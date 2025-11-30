from __future__ import annotations

from datetime import date, timedelta

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
    AdvertisementButton,
    AdvertisementButtonRewardClaim,
    UserProfile,
    Task,
    TaskCompletion,
    SimulationConfig,
    SimulationRewardClaim,
    RuleCategory,
    DailyReward,
    DailyRewardClaim,
    Failure,
    FailureBonusPurchase,
    FailureBonusType,
    QuizQuestion,
    ScoreEntry,
    QuizAttempt,
    AdsgramBlock,
    AdsgramAssignment,
    AdsgramAssignmentStatus,
    FrontendConfig,
)
from .serializers import (
    TaskCompletionSerializer,
    QuizQuestionSerializer,
    SimulationConfigSerializer,
    SimulationRewardClaimSerializer,
    RuleCategorySerializer,
    DailyRewardSerializer,
    DailyRewardClaimSerializer,
    AdvertisementButtonSerializer,
    FrontendConfigSerializer,
    FailureSerializer,
    FailureStartSerializer,
    FailureCompleteSerializer,
    FailureBonusPurchaseSerializer,
    ScoreEntrySerializer,
    LeaderboardRowSerializer,
    QuizResultSubmitSerializer,
    QuizResultResponseSerializer,
    AdsgramBlockSerializer,
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
        serializer = TaskCompletionSerializer(
            assignments,
            many=True,
            context={"request": request},
        )
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
                reward_threshold_1=100,
                reward_amount_1=100,
                reward_threshold_2=200,
                reward_amount_2=150,
                reward_threshold_3=300,
                reward_amount_3=250,
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
                reward_threshold_1=100,
                reward_amount_1=100,
                reward_threshold_2=200,
                reward_amount_2=150,
                reward_threshold_3=300,
                reward_amount_3=250,
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
                "reward_threshold_1": config.reward_threshold_1,
                "reward_amount_1": config.reward_amount_1,
                "reward_threshold_2": config.reward_threshold_2,
                "reward_amount_2": config.reward_amount_2,
                "reward_threshold_3": config.reward_threshold_3,
                "reward_amount_3": config.reward_amount_3,
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


class SimulationRewardClaimView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        serializer = SimulationRewardClaimSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        threshold = serializer.validated_data["threshold"]
        profile = request.user.profile

        config = (
            SimulationConfig.objects.select_for_update().order_by("-updated_at").first()
        )
        if not config:
            config = SimulationConfig.objects.create(
                attempt_cost=200,
                reward_level_1=100,
                reward_level_2=500,
                reward_level_3=1000,
                duration_seconds=60,
                description="Default simulation config",
                reward_threshold_1=100,
                reward_amount_1=100,
                reward_threshold_2=200,
                reward_amount_2=150,
                reward_threshold_3=300,
                reward_amount_3=250,
            )

        mapping = {
            int(config.reward_threshold_1): int(config.reward_amount_1),
            int(config.reward_threshold_2): int(config.reward_amount_2),
            int(config.reward_threshold_3): int(config.reward_amount_3),
        }

        if threshold not in mapping:
            return Response(
                {"detail": "Награда для указанного порога не найдена."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reward_amount = mapping[threshold]
        if reward_amount <= 0:
            return Response(
                {"detail": "Награда для данного порога отключена."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.localdate()
        claim, created = SimulationRewardClaim.objects.get_or_create(
            profile=profile,
            threshold=threshold,
            claimed_for_date=today,
        )
        if not created:
            return Response(
                {"detail": "Награда уже начислена."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.balance = F("balance") + reward_amount
        profile.save(update_fields=["balance", "updated_at"])
        profile.refresh_from_db(fields=["balance"])

        return Response(
            {
                "detail": "Награда начислена.",
                "threshold": threshold,
                "reward": reward_amount,
                "balance": profile.balance,
            }
        )


# ---------- Rules ----------

class RuleCategoryListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        rules = RuleCategory.objects.order_by("category")
        serializer = RuleCategorySerializer(
            rules,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)


# ---------- Daily rewards ----------

def _failure_is_active(failure: Failure, now: timezone.datetime | None = None) -> bool:
    now = now or timezone.now()
    if failure.start_time and failure.start_time > now:
        return False
    if failure.end_time and failure.end_time <= now:
        return False
    return True


def _ensure_daily_reward_defaults() -> None:
    existing = set(DailyReward.objects.values_list("day_number", flat=True))
    missing = [idx for idx in range(1, 9) if idx not in existing]
    if missing:
        DailyReward.objects.bulk_create(
            [DailyReward(day_number=idx, reward_amount=0) for idx in missing],
            ignore_conflicts=True,
        )


def _next_reward_day(profile: UserProfile, today: date) -> int:
    last_claim = profile.daily_reward_last_claimed_at
    streak = profile.daily_reward_streak or 0

    if last_claim == today:
        base = streak or 0
        return 1 if base >= 8 else min(base + 1, 8)

    if last_claim and last_claim == today - timedelta(days=1):
        if streak <= 0:
            return 1
        return min(streak + 1, 8)

    return 1


class DailyRewardConfigView(APIView):
    """Возвращает конфиг наград на 7 дней."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        _ensure_daily_reward_defaults()
        rewards = DailyReward.objects.order_by("day_number")
        profile = request.user.profile
        today = timezone.localdate()
        last_claim_entry = (
            profile.reward_claims.order_by("-claimed_for_date", "-claimed_at").first()
        )
        last_claim_date = (
            last_claim_entry.claimed_for_date if last_claim_entry else None
        )

        data = {
            "rewards": DailyRewardSerializer(rewards, many=True).data,
            "streak": int(profile.daily_reward_streak or 0),
            "last_claim_date": last_claim_date,
            "today_claimed": last_claim_date == today,
            "next_day": _next_reward_day(profile, today),
            "current_day": last_claim_entry.sequence_day if last_claim_entry else 0,
        }
        return Response(data)


class DailyRewardClaimTodayView(APIView):
    """POST {} — выдать награду за текущий день недели (1–7), если ещё не была получена сегодня."""
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        profile = request.user.profile
        today = timezone.localdate()

        if profile.daily_reward_last_claimed_at == today:
            return Response(
                {"detail": "Награда за сегодня уже получена."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _ensure_daily_reward_defaults()

        streak = profile.daily_reward_streak or 0
        last_claim = profile.daily_reward_last_claimed_at

        if last_claim and last_claim == today - timedelta(days=1):
            day_to_claim = 1 if streak <= 0 else min(streak + 1, 8)
        else:
            day_to_claim = 1

        try:
            reward_cfg = DailyReward.objects.get(day_number=day_to_claim)
        except DailyReward.DoesNotExist:
            return Response(
                {"detail": "Конфиг наград не найден."},
                status=status.HTTP_404_NOT_FOUND,
            )

        claim = DailyRewardClaim.objects.create(
            profile=profile,
            reward=reward_cfg,
            claimed_for_date=today,
            sequence_day=day_to_claim,
        )

        profile.balance = F("balance") + reward_cfg.reward_amount
        profile.daily_reward_last_claimed_at = today
        profile.daily_reward_streak = 0 if day_to_claim == 8 else day_to_claim
        profile.save(
            update_fields=[
                "balance",
                "updated_at",
                "daily_reward_last_claimed_at",
                "daily_reward_streak",
            ]
        )
        profile.refresh_from_db(
            fields=["balance", "daily_reward_last_claimed_at", "daily_reward_streak"]
        )

        serializer = DailyRewardClaimSerializer(claim)
        next_day = _next_reward_day(profile, today)

        return Response(
            {
                "detail": "Ежедневная награда получена",
                "claim": serializer.data,
                "balance": profile.balance,
                "streak": profile.daily_reward_streak,
                "next_day": next_day,
                "current_day": claim.sequence_day,
            }
        )


# ---------- Advertisements & config ----------


class AdvertisementButtonListView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request: Request) -> Response:
        buttons = AdvertisementButton.objects.order_by("order", "id")
        serializer = AdvertisementButtonSerializer(
            buttons,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)


class AdvertisementButtonClaimView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request, button_id: int) -> Response:
        profile = request.user.profile

        try:
            button = AdvertisementButton.objects.select_for_update().get(id=button_id)
        except AdvertisementButton.DoesNotExist:
            return Response({"detail": "Рекламное предложение не найдено."}, status=status.HTTP_404_NOT_FOUND)

        if button.reward_amount <= 0:
            return Response(
                {"detail": "Для этого предложения награда не предусмотрена."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        already_claimed = AdvertisementButtonRewardClaim.objects.filter(
            button=button, profile=profile
        ).exists()

        if already_claimed:
            return Response(
                {"detail": "Награда за эту ссылку уже была получена."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        AdvertisementButtonRewardClaim.objects.create(button=button, profile=profile)

        if button.reward_amount:
            profile.balance = F("balance") + int(button.reward_amount)
            profile.save(update_fields=["balance", "updated_at"])
            profile.refresh_from_db(fields=["balance"])

        return Response(
            {
                "detail": "Награда начислена.",
                "reward": int(button.reward_amount),
                "balance": profile.balance,
            }
        )


class FrontendConfigView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request: Request) -> Response:
        config = FrontendConfig.get_active()
        serializer = FrontendConfigSerializer(config, context={"request": request})
        return Response(serializer.data)


# ---------- Failures ----------

class FailureListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        failures = Failure.objects.order_by("-created_at")
        serializer = FailureSerializer(
            failures, many=True, context={"request": request}
        )
        return Response(serializer.data)


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

        profile = UserProfile.objects.select_for_update().get(pk=profile.pk)
        attempt_cost = int(failure.attempt_cost or 0)

        if attempt_cost > 0:
            if profile.balance < attempt_cost:
                logger.warning(
                    "FAILURE START 400: insufficient balance profile_id=%s cost=%s balance=%s",
                    profile.id,
                    attempt_cost,
                    profile.balance,
                )
                return Response(
                    {"detail": "Недостаточно монет для участия в сбое."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            profile.balance = max(profile.balance - attempt_cost, 0)
            profile.save(update_fields=["balance", "updated_at"])
            profile.refresh_from_db(fields=["balance"])

        # bonuses are single-use: clear leftovers from previous attempts
        FailureBonusPurchase.objects.filter(
            profile=profile, failure=failure
        ).delete()

        purchases: list[str] = []

        failure_payload = FailureSerializer(
            failure, context={"request": request}
        ).data

        return Response(
            {
                "detail": "Можно начинать.",
                "failure": failure_payload,
                "duration_seconds": failure.duration_seconds,
                "bombs_min_count": failure.bombs_min_count,
                "bombs_max_count": failure.bombs_max_count,
                "max_bonuses_per_run": failure.max_bonuses_per_run,
                "purchased_bonuses": list(purchases),
                "bonus_prices": failure.bonus_prices(),
                "attempt_cost": attempt_cost,
                "balance": profile.balance,
            }
        )

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

        entry = (
            ScoreEntry.objects.select_for_update()
            .filter(profile=profile, failure=failure)
            .first()
        )

        now = timezone.now()
        detail = "Результат сохранён."

        if entry is None:
            ScoreEntry.objects.create(
                profile=profile,
                failure=failure,
                points=points,
                duration_seconds=duration,
                earned_at=now,
            )
        else:
            if points > int(entry.points or 0):
                entry.points = points
                entry.duration_seconds = duration
                entry.earned_at = now
                entry.save(update_fields=["points", "duration_seconds", "earned_at", "updated_at"])
                detail = "Результат обновлён."

        # bonuses are single-use per attempt: clear purchases after completion
        FailureBonusPurchase.objects.filter(
            profile=profile, failure=failure
        ).delete()

        return Response(
            {
                "detail": detail,
                "score": points,
                "failure": FailureSerializer(failure).data,
            },
            status=status.HTTP_200_OK,
        )


class FailureBonusPurchaseView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        serializer = FailureBonusPurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        failure_id = serializer.validated_data["failure_id"]
        bonus_type = serializer.validated_data["bonus_type"]

        profile = request.user.profile

        try:
            failure = Failure.objects.select_for_update().get(id=failure_id)
        except Failure.DoesNotExist:
            return Response({"detail": "Сбой не найден."}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        if not _failure_is_active(failure, now):
            return Response(
                {"detail": "Сбой недоступен для покупки бонусов."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # if ScoreEntry.objects.filter(profile=profile, failure=failure).exists():
        #     return Response(
        #         {"detail": "Сбой уже завершён."}, status=status.HTTP_400_BAD_REQUEST
        #     )

        existing = FailureBonusPurchase.objects.select_for_update().filter(
            profile=profile, failure=failure
        )

        if existing.filter(bonus_type=bonus_type).exists():
            return Response(
                {"detail": "Бонус уже приобретён."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if existing.count() >= failure.max_bonuses_per_run:
            return Response(
                {"detail": "Достигнут лимит бонусов."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        prices = failure.bonus_prices()
        price = int(prices.get(bonus_type, 0))

        if price < 0:
            price = 0

        profile.refresh_from_db(fields=["balance"])
        if profile.balance < price:
            return Response(
                {
                    "detail": "Недостаточно монет.",
                    "balance": profile.balance,
                    "required": price,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if price:
            profile.balance = F("balance") - price
            profile.save(update_fields=["balance", "updated_at"])
            profile.refresh_from_db(fields=["balance"])

        FailureBonusPurchase.objects.create(
            profile=profile,
            failure=failure,
            bonus_type=bonus_type,
        )

        purchases = list(
            FailureBonusPurchase.objects.filter(
                profile=profile, failure=failure
            ).values_list("bonus_type", flat=True)
        )

        return Response(
            {
                "detail": "Бонус приобретён.",
                "bonus_type": bonus_type,
                "purchased_bonuses": purchases,
                "balance": profile.balance,
                "max_bonuses_per_run": failure.max_bonuses_per_run,
            }
        )


# ---------- Adsgram ----------


class AdsgramBlockView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        block = AdsgramBlock.objects.filter(is_active=True).order_by("?").first()
        if not block:
            return Response(
                {"detail": "Нет доступных рекламных блоков."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(AdsgramBlockSerializer(block).data)


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
                "detail": f"Результат сохранён. Награда: {reward}",
                "reward": reward,
                "balance": profile.balance,
            }
        )
        return Response(resp.data, status=status.HTTP_200_OK)


class LeaderboardView(APIView):
    """Возвращает таблицу лидеров для выбранного сбоя."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        failure_param = request.query_params.get("failure")
        failure_obj: Failure | None = None

        if failure_param:
            try:
                failure_id = int(failure_param)
            except (TypeError, ValueError):
                return Response(
                    {"detail": "Некорректный идентификатор сбоя."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                failure_obj = Failure.objects.get(id=failure_id)
            except Failure.DoesNotExist:
                return Response(
                    {"detail": "Сбой не найден."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            now = timezone.now()
            failure_obj = (
                Failure.objects.filter(Q(start_time__isnull=True) | Q(start_time__lte=now))
                .filter(Q(end_time__isnull=True) | Q(end_time__gt=now))
                .order_by("-start_time", "-created_at")
                .first()
            )

        qs = ScoreEntry.objects.select_related("profile", "profile__user")
        if failure_obj is not None:
            qs = qs.filter(failure=failure_obj)
        else:
            qs = qs.none()

        qs = qs.filter(points__gt=0).order_by("-points", "earned_at", "id")

        rows = []
        for position, entry in enumerate(qs, start=1):
            rows.append(
                {
                    "position": position,
                    "username": entry.profile.user.username,
                    "first_name": entry.profile.user.first_name or "",
                    "last_name": entry.profile.user.last_name or "",
                    "score": int(entry.points or 0),
                    "duration_seconds": 0,  # legacy поле, больше не используем
                    "achieved_at": entry.earned_at.isoformat() if entry.earned_at else None,
                }
            )

        current = next((r for r in rows if r["username"] == request.user.username), None)

        failure_payload = (
            FailureSerializer(failure_obj, context={"request": request}).data
            if failure_obj is not None
            else None
        )

        return Response(
            {"entries": rows, "current_user": current, "failure": failure_payload}
        )