from __future__ import annotations

from datetime import date

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum, F
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
)
from .serializers import (
    TaskCompletionSerializer,
    QuizQuestionSerializer,
    SimulationConfigSerializer,
    RuleCategorySerializer,
    DailyRewardSerializer,
    DailyRewardClaimSerializer,
    FailureSerializer,
    ScoreEntrySerializer,
    LeaderboardRowSerializer,
    QuizResultResponseSerializer
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


# --- НОВОЕ: приём результата квиза на /scores/ (POST) ---
class ScoreListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        # оставьте вашу текущую реализацию списка очков/статистики, если была
        return Response({"detail": "OK"})

    @transaction.atomic
    def post(self, request: Request) -> Response:
        submit_ser = QuizResultSubmitSerializer(data=request.data)
        submit_ser.is_valid(raise_exception=True)
        correct = submit_ser.validated_data["correct"]
        total = submit_ser.validated_data["total"]
        mode = submit_ser.validated_data["mode"]

        # простая 3-уровневая шкала наград
        # 60%+ правильных → 500, все правильные → 1000, иначе 100 (если >=20%), ниже — 0
        import math

        reward = 0
        if total > 0:
            if correct == total:
                reward = 1000
            elif correct >= math.ceil(total * 0.6):
                reward = 500
            elif correct >= math.ceil(total * 0.2):
                reward = 100
            else:
                reward = 0

        profile = request.user.userprofile
        profile.balance += reward
        profile.save(update_fields=["balance", "updated_at"])

        resp = QuizResultResponseSerializer(
            {"detail": f"Результат сохранён ({mode}). Награда: {reward}", "reward": reward, "balance": profile.balance}
        )
        return Response(resp.data, status=status.HTTP_200_OK)
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

        return Response({"detail": "Симуляция успешно запущена!", "balance": profile.balance, "cost": cost})


# ---------- Rules ----------

class RuleCategoryListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        rules = RuleCategory.objects.order_by("category")
        return Response(RuleCategorySerializer(rules, many=True).data)


# ---------- Daily rewards ----------

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


# ---------- Scores & Leaderboard ----------

class ScoreListView(APIView):
    """Список очков текущего пользователя (с привязкой к сбоям)."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        profile = request.user.profile
        scores = ScoreEntry.objects.filter(profile=profile).select_related("failure").order_by("-earned_at")
        return Response(ScoreEntrySerializer(scores, many=True).data)


class LeaderboardView(APIView):
    """
    «Лидерборд» считается на лету по сумме очков из ScoreEntry.
    Позиции сортируются по убыванию очков, при равенстве — по возрастанию суммарной длительности.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        qs = (
            UserProfile.objects.select_related("user")
            .annotate(total_points=Sum("scores__points"), total_duration=Sum("scores__duration_seconds"))
            .order_by("-total_points", "total_duration", "id")
        )

        rows = []
        pos = 1
        for p in qs:
            total_points = int(p.total_points or 0)
            total_duration = int(p.total_duration or 0)
            rows.append(
                {
                    "position": pos,
                    "username": p.user.username,
                    "first_name": p.user.first_name or "",
                    "last_name": p.user.last_name or "",
                    "score": total_points,
                    "duration_seconds": total_duration,
                }
            )
            pos += 1

        # current user row (или None, если нет очков и пользователя нет в выборке)
        current = next((r for r in rows if r["username"] == request.user.username), None)

        return Response(
            {
                "entries": LeaderboardRowSerializer(rows, many=True).data,
                "current_user": LeaderboardRowSerializer(current).data if current else None,
            }
        )
