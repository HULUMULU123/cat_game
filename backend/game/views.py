from __future__ import annotations

from datetime import date

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models import Sum, F, Q
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    UserProfile,
    Task,
    TaskCompletion,
    SimulationConfig,
    RuleCategory,
    DailyReward,
    DailyRewardClaim,
    Failure,
    QuizQuestion,
    ScoreEntry,
    QuizAttempt,
    AdsgramAssignment,
    AdsgramAssignmentStatus,
)
from .serializers import (
    TaskCompletionSerializer,
    QuizQuestionSerializer,
    SimulationConfigSerializer,
    RuleCategorySerializer,
    DailyRewardSerializer,
    DailyRewardClaimSerializer,
    FailureSerializer,
    FailureStartSerializer,
    FailureCompleteSerializer,
    ScoreEntrySerializer,
    LeaderboardRowSerializer,
    QuizResultSubmitSerializer,
    QuizResultResponseSerializer,
    AdsgramAssignmentSerializer,
    AdsgramAssignmentRequestSerializer,
    AdsgramAssignmentCompleteSerializer,
)
from .services import (
    AdsgramIntegrationError,
    get_adsgram_client,
)

User = get_user_model()


# ---------- Tasks ----------

class TaskCompletionListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        # note: related_name="profile" → request.user.profile
        profile = request.user.profile
        assignments = (
            TaskCompletion.objects.filter(profile=profile)
            .select_related("task")
            .order_by("-is_completed", "task__name")
        )
        # ensure every task is visible: create missing rows (not completed)
        existing_task_ids = set(assignments.values_list("task_id", flat=True))
        missing_tasks = Task.objects.exclude(id__in=existing_task_ids)
        TaskCompletion.objects.bulk_create(
            [TaskCompletion(profile=profile, task=t, is_completed=False) for t in missing_tasks],
            ignore_conflicts=True,
        )
        assignments = (
            TaskCompletion.objects.filter(profile=profile)
            .select_related("task")
            .order_by("-is_completed", "task__name")
        )
        serializer = TaskCompletionSerializer(assignments, many=True)
        return Response(serializer.data)


class TaskToggleCompleteView(APIView):
    """POST {"task_id": int, "is_completed": bool}"""
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        profile = request.user.profile
        task_id = request.data.get("task_id")
        is_completed = bool(request.data.get("is_completed", True))

        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

        assignment, _ = TaskCompletion.objects.select_for_update().get_or_create(
            profile=profile, task=task, defaults={"is_completed": False}
        )
        if is_completed and not assignment.is_completed:
            assignment.is_completed = True
            assignment.save(update_fields=["is_completed", "updated_at"])
            # optional: reward user instantly for task.reward
            profile.balance = F("balance") + task.reward
            profile.save(update_fields=["balance", "updated_at"])
            profile.refresh_from_db(fields=["balance"])

        if not is_completed and assignment.is_completed:
            assignment.is_completed = False
            assignment.save(update_fields=["is_completed", "updated_at"])

        return Response(
            {
                "task_id": task.id,
                "is_completed": assignment.is_completed,
                "balance": profile.balance,
            }
        )


# ---------- Quiz ----------

class QuizQuestionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        question = QuizQuestion.objects.order_by("-updated_at").first()
        if not question:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = QuizQuestionSerializer(question)
        return Response(serializer.data)


# --- НОВОЕ: 5 случайных вопросов ---
class QuizRandomBatchView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        # можно передать count, по умолчанию 5
        try:
            count = int(request.query_params.get("count", 5))
        except (TypeError, ValueError):
            count = 5
        count = max(1, min(count, 20))  # ограничим адекватно

        qs = QuizQuestion.objects.order_by("?")[:count]
        if not qs:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = QuizQuestionSerializer(qs, many=True)
        return Response(serializer.data)


# ---------- Simulation ----------

class SimulationConfigView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        config = SimulationConfig.objects.order_by("-updated_at").first()
        if not config:
            config = SimulationConfig.objects.create(
                attempt_cost=200,
                reward_level_1=100,
                reward_level_2=500,
                reward_level_3=1000,
                duration_seconds=60,
                description="Default simulation config",
            )
        serializer = SimulationConfigSerializer(config)
        return Response(serializer.data)


class SimulationStartView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        profile = request.user.profile
        config = SimulationConfig.objects.select_for_update().order_by("-updated_at").first()
        if not config:
            config = SimulationConfig.objects.create(
                attempt_cost=200,
                reward_level_1=100,
                reward_level_2=500,
                reward_level_3=1000,
                duration_seconds=60,
                description="Default simulation config",
            )
        cost = config.attempt_cost
        profile.refresh_from_db(fields=["balance"])

        if profile.balance < cost:
            return Response(
                {"detail": "Недостаточно монет для запуска симуляции.", "balance": profile.balance, "required": cost},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.balance = F("balance") - cost
        profile.save(update_fields=["balance", "updated_at"])
        profile.refresh_from_db(fields=["balance"])

        return Response(
            {
                "detail": "Симуляция успешно запущена!",
                "balance": profile.balance,
                "cost": cost,
                "duration_seconds": config.duration_seconds,
            }
        )


class SimulationAdRewardView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        profile = request.user.profile
        reward = int(getattr(settings, "SIMULATION_AD_REWARD", 200))
        profile.balance = F("balance") + reward
        profile.save(update_fields=["balance", "updated_at"])
        profile.refresh_from_db(fields=["balance"])

        return Response(
            {
                "detail": "Баланс пополнен за просмотр рекламы.",
                "balance": profile.balance,
                "reward": reward,
            }
        )


# ---------- Rules ----------

class RuleCategoryListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        rules = RuleCategory.objects.order_by("category")
        return Response(RuleCategorySerializer(rules, many=True).data)


# ---------- Daily rewards ----------

def _failure_is_active(failure: Failure, now: timezone.datetime | None = None) -> bool:
    now = now or timezone.now()
    if failure.start_time and failure.start_time > now:
        return False
    if failure.end_time and failure.end_time <= now:
        return False
    return True


def _weekday_1_7(d: date) -> int:
    # Python: Monday=0..Sunday=6 → 1..7
    return d.weekday() + 1


class DailyRewardConfigView(APIView):
    """Возвращает конфиг наград на 7 дней."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        rewards = DailyReward.objects.order_by("day_number")
        if rewards.count() == 0:
            # bootstrap default config
            objs = [DailyReward(day_number=i, reward_amount=0) for i in range(1, 8)]
            DailyReward.objects.bulk_create(objs, ignore_conflicts=True)
            rewards = DailyReward.objects.order_by("day_number")
        return Response(DailyRewardSerializer(rewards, many=True).data)


class DailyRewardClaimTodayView(APIView):
    """POST {} — выдать награду за текущий день недели (1–7), если ещё не была получена сегодня."""
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        profile = request.user.profile
        now = timezone.localtime()
        day_num = _weekday_1_7(now.date())

        try:
            reward_cfg = DailyReward.objects.get(day_number=day_num)
        except DailyReward.DoesNotExist:
            return Response({"detail": "Конфиг наград не найден."}, status=status.HTTP_404_NOT_FOUND)

        # запрещаем повторное получение в пределах календарной даты
        already_today = DailyRewardClaim.objects.filter(
            profile=profile, reward=reward_cfg, claimed_at__date=now.date()
        ).exists()
        if already_today:
            return Response({"detail": "Награда за сегодня уже получена."}, status=status.HTTP_400_BAD_REQUEST)

        claim = DailyRewardClaim.objects.create(profile=profile, reward=reward_cfg, claimed_at=now)

        # начисляем монеты
        profile.balance = F("balance") + reward_cfg.reward_amount
        profile.save(update_fields=["balance", "updated_at"])
        profile.refresh_from_db(fields=["balance"])

        return Response(
            {
                "detail": "Ежедневная награда получена",
                "claim": DailyRewardClaimSerializer(claim).data,
                "balance": profile.balance,
            }
        )


# ---------- Failures ----------

class FailureListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        failures = Failure.objects.order_by("-created_at")
        return Response(FailureSerializer(failures, many=True).data)


from rest_framework import status, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

class FailureStartView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        logger.info("FAILURE START POST data=%s user=%s", request.data, request.user.id)

        # Явно ловим валидацию, чтобы увидеть причину
        try:
            serializer = FailureStartSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            logger.warning("FAILURE START 400 serializer: %s", exc.detail)
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)

        failure_id = serializer.validated_data.get("failure_id")
        now = timezone.now()
        profile = request.user.profile

        qs = Failure.objects.select_for_update()

        if failure_id is not None:
            try:
                failure = qs.get(id=failure_id)
            except Failure.DoesNotExist:
                logger.warning("FAILURE START 404: not found id=%s", failure_id)
                return Response({"detail": "Сбой не найден."}, status=status.HTTP_404_NOT_FOUND)
        else:
            failure = (
                qs.filter(Q(start_time__isnull=True) | Q(start_time__lte=now))
                .filter(Q(end_time__isnull=True) | Q(end_time__gt=now))
                .order_by("-start_time", "-created_at")
                .first()
            )
            if not failure:
                logger.warning("FAILURE START 404: active not found")
                return Response({"detail": "Активный сбой не найден."}, status=status.HTTP_404_NOT_FOUND)

        if not _failure_is_active(failure, now):
            logger.warning("FAILURE START 400: not active failure_id=%s", failure.id)
            return Response({"detail": "Сбой недоступен для участия."}, status=status.HTTP_400_BAD_REQUEST)

        if ScoreEntry.objects.filter(profile=profile, failure=failure).exists():
            logger.warning("FAILURE START 400: already played failure_id=%s profile_id=%s",
                           failure.id, profile.id)
            return Response({"detail": "Вы уже участвовали в этом сбое."},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "detail": "Можно начинать.",
            "failure": FailureSerializer(failure).data,
            "duration_seconds": 60,
        })

class FailureCompleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        serializer = FailureCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        failure_id = serializer.validated_data["failure_id"]
        points = serializer.validated_data["points"]
        duration = serializer.validated_data["duration_seconds"]

        profile = request.user.profile

        try:
            failure = Failure.objects.select_for_update().get(id=failure_id)
        except Failure.DoesNotExist:
            return Response({"detail": "Сбой не найден."}, status=status.HTTP_404_NOT_FOUND)

        if ScoreEntry.objects.filter(profile=profile, failure=failure).exists():
            return Response(
                {"detail": "Результат уже зафиксирован."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ScoreEntry.objects.create(
            profile=profile,
            failure=failure,
            points=points,
            duration_seconds=duration,
            earned_at=timezone.now(),
        )

        return Response(
            {
                "detail": "Результат сохранён.",
                "score": points,
                "failure": FailureSerializer(failure).data,
            },
            status=status.HTTP_200_OK,
        )


# ---------- Adsgram ----------


class AdsgramAssignmentRequestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        serializer = AdsgramAssignmentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        placement_id = serializer.validated_data.get("placement_id") or getattr(
            settings,
            "ADSGRAM_DEFAULT_PLACEMENT_ID",
            "",
        )

        profile = request.user.profile
        client = get_adsgram_client()

        try:
            remote_payload = client.request_assignment(
                user_id=request.user.id,
                placement_id=placement_id or None,
            )
        except AdsgramIntegrationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        assignment_id = str(
            remote_payload.get("assignment_id")
            or remote_payload.get("id")
            or ""
        ).strip()
        if not assignment_id:
            return Response(
                {"detail": "Adsgram не вернул идентификатор задания."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payload = {"request": remote_payload}

        try:
            assignment = AdsgramAssignment.objects.create(
                profile=profile,
                external_assignment_id=assignment_id,
                placement_id=placement_id,
                status=AdsgramAssignmentStatus.REQUESTED,
                payload=payload,
            )
        except IntegrityError:
            assignment = AdsgramAssignment.objects.select_for_update().get(
                external_assignment_id=assignment_id
            )
            if assignment.profile_id != profile.id:
                return Response(
                    {"detail": "Задание закреплено за другим пользователем."},
                    status=status.HTTP_409_CONFLICT,
                )
            assignment.status = AdsgramAssignmentStatus.REQUESTED
            assignment.placement_id = placement_id
            assignment.payload = payload
            assignment.completed_at = None
            assignment.save(update_fields=[
                "status",
                "placement_id",
                "payload",
                "completed_at",
                "updated_at",
            ])

        return Response(AdsgramAssignmentSerializer(assignment).data)


class AdsgramAssignmentCompleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        serializer = AdsgramAssignmentCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        assignment_id = serializer.validated_data["assignment_id"]
        profile = request.user.profile

        try:
            assignment = (
                AdsgramAssignment.objects.select_for_update()
                .get(external_assignment_id=assignment_id, profile=profile)
            )
        except AdsgramAssignment.DoesNotExist:
            return Response({"detail": "Задание не найдено."}, status=status.HTTP_404_NOT_FOUND)

        client = get_adsgram_client()
        try:
            completion_payload = client.confirm_assignment(
                assignment_id=assignment.external_assignment_id,
                user_id=request.user.id,
            )
        except AdsgramIntegrationError as exc:
            payload = assignment.payload or {}
            payload["error"] = str(exc)
            assignment.payload = payload
            assignment.status = AdsgramAssignmentStatus.FAILED
            assignment.save(update_fields=["payload", "status", "updated_at"])
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        payload = assignment.payload or {}
        payload["completion"] = completion_payload
        assignment.payload = payload
        assignment.status = AdsgramAssignmentStatus.COMPLETED
        assignment.completed_at = timezone.now()
        assignment.save(update_fields=["payload", "status", "completed_at", "updated_at"])

        return Response(AdsgramAssignmentSerializer(assignment).data)


# ---------- Scores & Leaderboard ----------

class ScoreListView(APIView):
    """Список очков текущего пользователя и приём результатов квиза."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        profile = request.user.profile
        scores = (
            ScoreEntry.objects.filter(profile=profile)
            .select_related("failure")
            .order_by("-earned_at", "-id")
        )
        return Response(ScoreEntrySerializer(scores, many=True).data)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        submit_ser = QuizResultSubmitSerializer(data=request.data)
        submit_ser.is_valid(raise_exception=True)

        answers_payload = submit_ser.validated_data["answers"]
        mode_raw = submit_ser.validated_data["mode"]
        mode = str(mode_raw or "quiz")

        question_ids = [entry["question_id"] for entry in answers_payload]
        questions = {
            q.id: q for q in QuizQuestion.objects.filter(id__in=question_ids)
        }

        correct = 0
        total = len(answers_payload)
        reward = 0

        for entry in answers_payload:
            question = questions.get(entry["question_id"])
            if not question:
                continue

            answers = list(question.answers or [])
            try:
                correct_index = int(question.correct_answer_index)
            except (TypeError, ValueError):
                correct_index = 0

            try:
                correct_text = answers[correct_index]
            except IndexError:
                correct_text = answers[0] if answers else ""

            selected = (entry.get("selected_answer") or "").strip()
            if answers and selected == correct_text.strip():
                correct += 1
                reward += int(question.reward or 0)

        profile = request.user.profile
        if reward:
            profile.balance = F("balance") + reward
            profile.save(update_fields=["balance", "updated_at"])
            profile.refresh_from_db(fields=["balance"])

        QuizAttempt.objects.create(
            profile=profile,
            mode=mode,
            correct_answers=correct,
            total_questions=total,
            reward=reward,
        )

        resp = QuizResultResponseSerializer(
            {
                "detail": f"Результат сохранён ({mode}). Награда: {reward}",
                "reward": reward,
                "balance": profile.balance,
            }
        )
        return Response(resp.data, status=status.HTTP_200_OK)


class LeaderboardView(APIView):
    """
    Лидерборд на основе ScoreEntry:
      - только записи с score > 0 (игроки, реально что-то заработали),
      - сортируем по score (убыв.) и времени получения результата (updated_at возр.),
      - показываем achieved_at как updated_at.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        qs = (
            ScoreEntry.objects
            .select_related("profile", "profile__user")
            .filter(points__gt=0)
            .order_by("-points", "earned_at", "id")
        )

        rows = []
        for position, e in enumerate(qs, start=1):
            rows.append(
                {
                    "position": position,
                    "username": e.profile.user.username,
                    "first_name": e.profile.user.first_name or "",
                    "last_name": e.profile.user.last_name or "",
                    "score": int(e.points or 0),
                    "duration_seconds": 0,  # legacy поле, больше не используем
                    "achieved_at": e.earned_at.isoformat() if e.earned_at else None,
                }
            )

        current = next((r for r in rows if r["username"] == request.user.username), None)

        return Response({"entries": rows, "current_user": current})