from __future__ import annotations

import secrets
import string

from django.conf import settings
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
    icon = models.URLField(blank=True, verbose_name="Иконка (URL)")
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
    description = models.TextField(blank=True, verbose_name="Описание")

    class Meta:
        db_table = "симуляции"
        verbose_name = "Симуляция"
        verbose_name_plural = "Симуляции"

    def __str__(self):
        return f"Симуляция (цена: {self.attempt_cost})"


# ==============================
# Rules by category
# ==============================

class RuleCategory(TimestampedModel):
    category = models.CharField(max_length=255, verbose_name="Категория")
    rule_text = models.TextField(verbose_name="Правило")

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
    day_number = models.PositiveSmallIntegerField(verbose_name="Номер дня (1–7)")
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

    class Meta:
        unique_together = ("profile", "reward")
        db_table = "полученные_награды"
        verbose_name = "Полученная награда"
        verbose_name_plural = "Полученные награды"


# ==============================
# Failures (Сбои)
# ==============================

class Failure(TimestampedModel):
    name = models.CharField(max_length=255, verbose_name="Название сбоя")
    start_time = models.DateTimeField(null=True, blank=True, verbose_name="Время начала")
    end_time = models.DateTimeField(null=True, blank=True, verbose_name="Время окончания")

    class Meta:
        db_table = "сбои"
        verbose_name = "Сбой"
        verbose_name_plural = "Сбои"

    def __str__(self):
        return self.name


# ==============================
# Questions (Викторина)
# ==============================

class QuizQuestion(TimestampedModel):
    question_text = models.TextField(verbose_name="Вопрос")
    answers = models.JSONField(default=list, verbose_name="Список ответов")
    correct_answer_index = models.PositiveIntegerField(default=0, verbose_name="Правильный ответ (индекс)")

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
