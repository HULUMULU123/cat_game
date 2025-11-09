from __future__ import annotations

import secrets
import string

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


# ==============================
# Base model
# ==============================

class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        abstract = True


# ==============================
# User profile
# ==============================

def generate_referral_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    # 8 символов дают 36^8 комбинаций, этого достаточно даже при случайном выборе
    return "".join(secrets.choice(alphabet) for _ in range(8))


def ensure_all_profiles_have_referral_code(apps, schema_editor) -> None:
    UserProfile = apps.get_model("game", "UserProfile")
    existing_codes = set(
        UserProfile.objects.exclude(referral_code="").values_list("referral_code", flat=True)
    )

    for profile in UserProfile.objects.all():
        if profile.referral_code:
            continue

        while True:
            code = generate_referral_code()
            if code in existing_codes:
                continue

            profile.referral_code = code
            profile.save(update_fields=["referral_code"])
            existing_codes.add(code)
            break


class UserProfile(TimestampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
        verbose_name="Пользователь",
    )
    balance = models.PositiveIntegerField(default=0, verbose_name="Баланс монет")
    referral_code = models.CharField(
        max_length=12,
        unique=True,
        default=generate_referral_code,
        editable=False,
        verbose_name="Реферальный код",
    )
    referred_by = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="referrals",
        verbose_name="Пригласивший пользователь",
    )
    daily_reward_streak = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(8)],
        verbose_name="Серия ежедневных наград",
    )
    daily_reward_last_claimed_at = models.DateField(
        null=True,
        blank=True,
        verbose_name="Дата последней ежедневной награды",
    )

    class Meta:
        db_table = "профили_пользователей"
        verbose_name = "Профиль пользователя"
        verbose_name_plural = "Профили пользователей"

    def __str__(self):
        return f"Профиль {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.referral_code:
            # гарантируем уникальность, если код очищен вручную
            while True:
                code = generate_referral_code()
                if not UserProfile.objects.filter(referral_code=code).exists():
                    self.referral_code = code
                    break
        super().save(*args, **kwargs)


# ==============================
# Tasks
# ==============================

class Task(TimestampedModel):
    name = models.CharField(max_length=255, verbose_name="Название задания")
    description = models.TextField(blank=True, verbose_name="Описание")
    reward = models.PositiveIntegerField(default=0, verbose_name="Награда (монеты)")
    icon = models.URLField(blank=True, verbose_name="Изображение (URL)")
    link = models.URLField(blank=True, verbose_name="Ссылка (URL)")  # ← добавили

    class Meta:
        db_table = "задания"
        verbose_name = "Задание"
        verbose_name_plural = "Задания"

    def __str__(self):
        return self.name


class TaskCompletion(TimestampedModel):
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="task_completions",
        verbose_name="Профиль",
    )
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="completions",
        verbose_name="Задание",
    )
    is_completed = models.BooleanField(default=False, verbose_name="Выполнено")

    class Meta:
        unique_together = ("profile", "task")
        db_table = "выполнения_заданий"
        verbose_name = "Выполнение задания"
        verbose_name_plural = "Выполнения заданий"

    def __str__(self):
        return f"{self.profile.user.username} → {self.task.name}"


# ==============================
# Adsgram assignments
# ==============================


class AdsgramAssignmentStatus(models.TextChoices):
    REQUESTED = "requested", "Задание получено"
    COMPLETED = "completed", "Задание выполнено"
    FAILED = "failed", "Ошибка"


class AdsgramAssignment(TimestampedModel):
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="adsgram_assignments",
        verbose_name="Профиль",
    )
    external_assignment_id = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="ID задания Adsgram",
    )
    placement_id = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Placement ID",
    )
    status = models.CharField(
        max_length=32,
        choices=AdsgramAssignmentStatus.choices,
        default=AdsgramAssignmentStatus.REQUESTED,
        verbose_name="Статус",
    )
    payload = models.JSONField(default=dict, blank=True, verbose_name="Данные интеграции")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Время завершения")

    class Meta:
        db_table = "adsgram_assignments"
        verbose_name = "Задание Adsgram"
        verbose_name_plural = "Задания Adsgram"

    def __str__(self) -> str:
        return f"Adsgram {self.external_assignment_id} ({self.get_status_display()})"


# ==============================
# Simulation (награды и цена)
# ==============================

class SimulationConfig(TimestampedModel):
    attempt_cost = models.PositiveIntegerField(default=200, verbose_name="Цена за попытку")
    reward_level_1 = models.PositiveIntegerField(default=100, verbose_name="Награда 1 уровня")
    reward_level_2 = models.PositiveIntegerField(default=500, verbose_name="Награда 2 уровня")
    reward_level_3 = models.PositiveIntegerField(default=1000, verbose_name="Награда 3 уровня")
    duration_seconds = models.PositiveSmallIntegerField(
        default=60, verbose_name="Длительность тренировки (сек)"
    )
    description = models.TextField(blank=True, verbose_name="Описание")
    reward_threshold_1 = models.PositiveIntegerField(
        default=100, verbose_name="Порог капель для награды 1"
    )
    reward_amount_1 = models.PositiveIntegerField(
        default=100, verbose_name="Размер награды 1"
    )
    reward_threshold_2 = models.PositiveIntegerField(
        default=200, verbose_name="Порог капель для награды 2"
    )
    reward_amount_2 = models.PositiveIntegerField(
        default=150, verbose_name="Размер награды 2"
    )
    reward_threshold_3 = models.PositiveIntegerField(
        default=300, verbose_name="Порог капель для награды 3"
    )
    reward_amount_3 = models.PositiveIntegerField(
        default=250, verbose_name="Размер награды 3"
    )

    class Meta:
        db_table = "симуляции"
        verbose_name = "Симуляция"
        verbose_name_plural = "Симуляции"

    def __str__(self):
        return f"Симуляция (цена: {self.attempt_cost})"


class SimulationRewardClaim(TimestampedModel):
    profile = models.ForeignKey(
        "UserProfile",
        on_delete=models.CASCADE,
        related_name="simulation_reward_claims",
        verbose_name="Профиль",
    )
    threshold = models.PositiveIntegerField(verbose_name="Порог капель")
    claimed_for_date = models.DateField(verbose_name="Дата начисления")

    class Meta:
        db_table = "simulation_reward_claims"
        verbose_name = "Награда симуляции"
        verbose_name_plural = "Награды симуляции"
        unique_together = ("profile", "threshold", "claimed_for_date")

    def __str__(self) -> str:
        return f"{self.profile_id}: {self.threshold} ({self.claimed_for_date})"


# ==============================
# Advertisements & frontend config
# ==============================


class AdvertisementButton(TimestampedModel):
    title = models.CharField(max_length=100, verbose_name="Подпись кнопки")
    link = models.URLField(verbose_name="Ссылка")
    image = models.URLField(verbose_name="Изображение (URL)")
    order = models.PositiveSmallIntegerField(default=0, verbose_name="Порядок отображения")

    class Meta:
        db_table = "рекламные_кнопки"
        verbose_name = "Рекламная кнопка"
        verbose_name_plural = "Рекламные кнопки"
        ordering = ("order", "id")

    def __str__(self) -> str:
        return self.title


class FrontendConfig(TimestampedModel):
    name = models.CharField(
        max_length=50,
        unique=True,
        default="default",
        verbose_name="Идентификатор конфигурации",
    )
    screen_texture = models.URLField(blank=True, verbose_name="Текстура экрана (URL)")

    class Meta:
        db_table = "настройки_фронтенда"
        verbose_name = "Настройки фронтенда"
        verbose_name_plural = "Настройки фронтенда"

    def __str__(self) -> str:
        return f"Конфигурация {self.name}"

    @classmethod
    def get_active(cls) -> "FrontendConfig":
        config, _ = cls.objects.get_or_create(name="default")
        return config


# ==============================
# Rules by category
# ==============================

class RuleCategory(TimestampedModel):
    category = models.CharField(max_length=255, verbose_name="Категория")
    rule_text = models.TextField(verbose_name="Правило")
    icon = models.URLField(blank=True, verbose_name="Иконка (URL)")

    class Meta:
        db_table = "правила_по_категориям"
        verbose_name = "Правило по категории"
        verbose_name_plural = "Правила по категориям"

    def __str__(self):
        return self.category


# ==============================
# Daily rewards
# ==============================

class DailyReward(TimestampedModel):
    day_number = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(8)],
        verbose_name="Номер дня (1–8)",
    )
    reward_amount = models.PositiveIntegerField(default=0, verbose_name="Награда (монеты)")

    class Meta:
        db_table = "ежедневные_награды"
        verbose_name = "Ежедневная награда"
        verbose_name_plural = "Ежедневные награды"

    def __str__(self):
        return f"День {self.day_number}: {self.reward_amount} монет"


class DailyRewardClaim(TimestampedModel):
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="reward_claims",
        verbose_name="Профиль",
    )
    reward = models.ForeignKey(
        DailyReward,
        on_delete=models.CASCADE,
        related_name="claims",
        verbose_name="Награда",
    )
    claimed_at = models.DateTimeField(default=timezone.now, verbose_name="Дата получения")
    claimed_for_date = models.DateField(
        default=timezone.localdate,
        verbose_name="Дата награды",
    )
    sequence_day = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(8)],
        verbose_name="День последовательности",
    )

    class Meta:
        db_table = "полученные_награды"
        verbose_name = "Полученная награда"
        verbose_name_plural = "Полученные награды"
        constraints = (
            models.UniqueConstraint(
                fields=("profile", "claimed_for_date"),
                name="unique_daily_reward_claim_per_day",
            ),
        )


# ==============================
# Failures (Сбои)
# ==============================

class Failure(TimestampedModel):
    name = models.CharField(max_length=255, verbose_name="Название сбоя")
    start_time = models.DateTimeField(null=True, blank=True, verbose_name="Время начала")
    end_time = models.DateTimeField(null=True, blank=True, verbose_name="Время окончания")
    duration_seconds = models.PositiveIntegerField(
        default=60, verbose_name="Длительность попытки (сек)"
    )
    bombs_min_count = models.PositiveSmallIntegerField(
        default=0, verbose_name="Минимум бомб за игру"
    )
    bombs_max_count = models.PositiveSmallIntegerField(
        default=0, verbose_name="Максимум бомб за игру"
    )
    max_bonuses_per_run = models.PositiveSmallIntegerField(
        default=3, verbose_name="Максимум бонусов за игру"
    )
    bonus_price_x2 = models.PositiveIntegerField(default=0, verbose_name="Цена бонуса x2")
    bonus_price_x5 = models.PositiveIntegerField(default=0, verbose_name="Цена бонуса x5")
    bonus_price_x10 = models.PositiveIntegerField(default=0, verbose_name="Цена бонуса x10")
    bonus_price_freeze = models.PositiveIntegerField(default=0, verbose_name="Цена бонуса заморозка")
    bonus_price_no_bombs = models.PositiveIntegerField(
        default=0, verbose_name="Цена бонуса отключение бомб"
    )
    main_prize_title = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Название главного приза",
    )
    main_prize_image = models.URLField(
        blank=True,
        verbose_name="Изображение главного приза (URL)",
    )

    class Meta:
        db_table = "сбои"
        verbose_name = "Сбой"
        verbose_name_plural = "Сбои"

    def __str__(self):
        return self.name

    def bonus_prices(self) -> dict[str, int]:
        return {
            "x2": int(self.bonus_price_x2 or 0),
            "x5": int(self.bonus_price_x5 or 0),
            "x10": int(self.bonus_price_x10 or 0),
            "freeze": int(self.bonus_price_freeze or 0),
            "no_bombs": int(self.bonus_price_no_bombs or 0),
        }


class FailureBonusType(models.TextChoices):
    X2 = "x2", "x2"
    X5 = "x5", "x5"
    X10 = "x10", "x10"
    FREEZE = "freeze", "freeze"
    NO_BOMBS = "no_bombs", "no_bombs"


class FailureBonusPurchase(TimestampedModel):
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="failure_bonus_purchases",
        verbose_name="Профиль",
    )
    failure = models.ForeignKey(
        Failure,
        on_delete=models.CASCADE,
        related_name="bonus_purchases",
        verbose_name="Сбой",
    )
    bonus_type = models.CharField(
        max_length=32,
        choices=FailureBonusType.choices,
        verbose_name="Тип бонуса",
    )

    class Meta:
        db_table = "покупки_бонусов_сбоя"
        verbose_name = "Покупка бонуса сбоя"
        verbose_name_plural = "Покупки бонусов сбоя"
        unique_together = ("profile", "failure", "bonus_type")

    def __str__(self) -> str:
        return f"{self.profile_id} → {self.failure_id}: {self.bonus_type}"


# ==============================
# Questions (Викторина)
# ==============================

class QuizQuestion(TimestampedModel):
    question_text = models.TextField(verbose_name="Вопрос")
    answers = models.JSONField(default=list, verbose_name="Список ответов")
    correct_answer_index = models.PositiveIntegerField(default=0, verbose_name="Правильный ответ (индекс)")
    reward = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Награда за правильный ответ",
    )

    class Meta:
        db_table = "вопросы"
        verbose_name = "Вопрос"
        verbose_name_plural = "Вопросы"

    def __str__(self):
        return f"Вопрос #{self.id}"


# ==============================
# Score tracking
# ==============================

class ScoreEntry(TimestampedModel):
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="scores",
        verbose_name="Профиль",
    )
    failure = models.ForeignKey(
        Failure,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scores",
        verbose_name="Сбой",
    )
    points = models.PositiveIntegerField(default=0, verbose_name="Очки")
    duration_seconds = models.PositiveIntegerField(default=0, verbose_name="Время (сек)")
    earned_at = models.DateTimeField(default=timezone.now, verbose_name="Дата получения")

    class Meta:
        db_table = "очки"
        verbose_name = "Очки"
        verbose_name_plural = "Очки"

        constraints = [
            models.UniqueConstraint(
                fields=("profile", "failure"),
                name="uniq_score_per_failure",
            )
        ]

    def __str__(self):
        return f"{self.profile.user.username}: {self.points} очков"


# ==============================
# Quiz attempts
# ==============================


class QuizAttempt(TimestampedModel):
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="quiz_attempts",
        verbose_name="Профиль",
    )
    mode = models.CharField(max_length=32, default="quiz", verbose_name="Режим")
    correct_answers = models.PositiveIntegerField(
        default=0, verbose_name="Количество правильных ответов"
    )
    total_questions = models.PositiveIntegerField(
        default=0, verbose_name="Всего вопросов"
    )
    reward = models.PositiveIntegerField(default=0, verbose_name="Полученная награда")
    completed_at = models.DateTimeField(
        default=timezone.now, verbose_name="Дата завершения"
    )

    class Meta:
        db_table = "попытки_викторины"
        verbose_name = "Попытка викторины"
        verbose_name_plural = "Попытки викторины"

    def __str__(self):
        return f"{self.profile.user.username}: {self.correct_answers}/{self.total_questions}"


# ==============================
# Promo codes
# ==============================


def generate_promo_code(length: int = 10) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


class PromoCode(TimestampedModel):
    code = models.CharField(
        max_length=32,
        unique=True,
        verbose_name="Промокод",
    )
    reward = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Количество монет",
    )
    max_redemptions = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name="Максимум активаций",
    )
    redemptions_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Количество активаций",
    )
    is_active = models.BooleanField(default=True, verbose_name="Активен")

    class Meta:
        db_table = "промокоды"
        verbose_name = "Промокод"
        verbose_name_plural = "Промокоды"

    def __str__(self) -> str:
        return f"{self.code} ({self.reward})"

    def ensure_code(self) -> None:
        if self.code:
            return

        while True:
            candidate = generate_promo_code()
            if not PromoCode.objects.filter(code=candidate).exists():
                self.code = candidate
                break

    def save(self, *args, **kwargs):
        self.ensure_code()
        super().save(*args, **kwargs)

    @property
    def remaining_redemptions(self) -> int:
        return max(self.max_redemptions - self.redemptions_count, 0)


class PromoCodeRedemption(TimestampedModel):
    promo_code = models.ForeignKey(
        PromoCode,
        on_delete=models.CASCADE,
        related_name="redemptions",
        verbose_name="Промокод",
    )
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="promo_redemptions",
        verbose_name="Профиль",
    )
    redeemed_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата активации")

    class Meta:
        db_table = "активации_промокодов"
        verbose_name = "Активация промокода"
        verbose_name_plural = "Активации промокодов"
        unique_together = ("promo_code", "profile")

    def __str__(self) -> str:
        return f"{self.promo_code.code} → {self.profile.user.username}"
