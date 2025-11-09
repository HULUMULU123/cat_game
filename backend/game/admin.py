import io
import re
import string
import zipfile
from typing import TYPE_CHECKING
from xml.etree import ElementTree

from django import forms
from django.contrib import admin, messages
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import path

from .models import (
    AdvertisementButton,
    AdsgramAssignment,
    DailyReward,
    DailyRewardClaim,
    FrontendConfig,
    Failure,
    FailureBonusPurchase,
    PromoCode,
    PromoCodeRedemption,
    QuizQuestion,
    RuleCategory,
    ScoreEntry,
    SimulationConfig,
    SimulationRewardClaim,
    Task,
    TaskCompletion,
    UserProfile,
)
from .models import generate_promo_code

# --- Типы только для mypy ---
if TYPE_CHECKING:
    from django.contrib.admin import ModelAdmin as _ModelAdmin

    AdvertisementButtonAdminBase = _ModelAdmin[AdvertisementButton]  # type: ignore[index]
    AdsgramAssignmentAdminBase = _ModelAdmin[AdsgramAssignment]  # type: ignore[index]
    DailyRewardAdminBase = _ModelAdmin[DailyReward]  # type: ignore[index]
    DailyRewardClaimAdminBase = _ModelAdmin[DailyRewardClaim]  # type: ignore[index]
    FrontendConfigAdminBase = _ModelAdmin[FrontendConfig]  # type: ignore[index]
    FailureAdminBase = _ModelAdmin[Failure]  # type: ignore[index]
    FailureBonusPurchaseAdminBase = _ModelAdmin[FailureBonusPurchase]  # type: ignore[index]
    PromoCodeAdminBase = _ModelAdmin[PromoCode]  # type: ignore[index]
    PromoCodeRedemptionAdminBase = _ModelAdmin[PromoCodeRedemption]  # type: ignore[index]
    QuizQuestionAdminBase = _ModelAdmin[QuizQuestion]  # type: ignore[index]
    RuleCategoryAdminBase = _ModelAdmin[RuleCategory]  # type: ignore[index]
    ScoreEntryAdminBase = _ModelAdmin[ScoreEntry]  # type: ignore[index]
    SimulationConfigAdminBase = _ModelAdmin[SimulationConfig]  # type: ignore[index]
    SimulationRewardClaimAdminBase = _ModelAdmin[SimulationRewardClaim]  # type: ignore[index]
    TaskAdminBase = _ModelAdmin[Task]  # type: ignore[index]
    TaskCompletionAdminBase = _ModelAdmin[TaskCompletion]  # type: ignore[index]
    UserProfileAdminBase = _ModelAdmin[UserProfile]  # type: ignore[index]
else:
    AdvertisementButtonAdminBase = admin.ModelAdmin
    AdsgramAssignmentAdminBase = admin.ModelAdmin
    DailyRewardAdminBase = admin.ModelAdmin
    DailyRewardClaimAdminBase = admin.ModelAdmin
    FrontendConfigAdminBase = admin.ModelAdmin
    FailureAdminBase = admin.ModelAdmin
    FailureBonusPurchaseAdminBase = admin.ModelAdmin
    PromoCodeAdminBase = admin.ModelAdmin
    PromoCodeRedemptionAdminBase = admin.ModelAdmin
    QuizQuestionAdminBase = admin.ModelAdmin
    RuleCategoryAdminBase = admin.ModelAdmin
    ScoreEntryAdminBase = admin.ModelAdmin
    SimulationConfigAdminBase = admin.ModelAdmin
    SimulationRewardClaimAdminBase = admin.ModelAdmin
    TaskAdminBase = admin.ModelAdmin
    TaskCompletionAdminBase = admin.ModelAdmin
    UserProfileAdminBase = admin.ModelAdmin


class QuizQuestionImportForm(forms.Form):
    file = forms.FileField(label="Excel-файл (XLSX)")
    replace_existing = forms.BooleanField(
        required=False,
        initial=True,
        label="Удалить существующие вопросы перед импортом",
    )


class PromoCodeGenerateForm(forms.Form):
    count = forms.IntegerField(min_value=1, max_value=200, initial=10, label="Количество кодов")
    reward = forms.IntegerField(min_value=0, initial=0, label="Начисляемые монеты")
    max_redemptions = forms.IntegerField(
        min_value=1, initial=1, label="Максимум активаций на код"
    )


_COLUMN_RE = re.compile(r"([A-Z]+)([0-9]+)")
_EXCEL_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def _column_letters_to_index(column: str) -> int:
    result = 0
    for char in column:
        if char not in string.ascii_letters:
            break
        result = result * 26 + (ord(char.upper()) - ord("A") + 1)
    return result or 1


def _read_xlsx_rows(payload: bytes) -> list[list[str]]:
    """Минимальный парсер XLSX без внешних зависимостей."""

    rows: list[list[str]] = []

    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = archive.read("xl/sharedStrings.xml")
            shared_tree = ElementTree.fromstring(shared_root)
            for si in shared_tree.findall(f"{_EXCEL_NS}si"):
                parts = [node.text or "" for node in si.findall(f".//{_EXCEL_NS}t")]
                shared_strings.append("".join(parts))

        sheet_name = "xl/worksheets/sheet1.xml"
        if sheet_name not in archive.namelist():
            candidates = [name for name in archive.namelist() if name.startswith("xl/worksheets/")]
            if not candidates:
                return rows
            sheet_name = candidates[0]

        sheet_data = archive.read(sheet_name)
        sheet_tree = ElementTree.fromstring(sheet_data)

        for row_node in sheet_tree.findall(f"{_EXCEL_NS}sheetData/{_EXCEL_NS}row"):
            cells: dict[int, str] = {}
            for cell_node in row_node.findall(f"{_EXCEL_NS}c"):
                ref = cell_node.get("r", "")
                match = _COLUMN_RE.match(ref)
                col_idx = _column_letters_to_index(match.group(1)) if match else len(cells) + 1

                cell_type = cell_node.get("t")
                value_node = cell_node.find(f"{_EXCEL_NS}v")
                text = ""
                if value_node is not None and value_node.text is not None:
                    raw = value_node.text
                    if cell_type == "s":
                        try:
                            text = shared_strings[int(raw)]
                        except (ValueError, IndexError):
                            text = ""
                    else:
                        text = raw

                cells[col_idx] = text

            if not cells:
                rows.append([])
                continue

            max_idx = max(cells)
            row_values = ["" for _ in range(max_idx)]
            for idx, value in cells.items():
                row_values[idx - 1] = value
            rows.append(row_values)

    return rows


# --- Регистрация моделей ---

@admin.register(UserProfile)
class UserProfileAdmin(UserProfileAdminBase):
    list_display = (
        "user",
        "balance",
        "daily_reward_streak",
        "daily_reward_last_claimed_at",
        "created_at",
        "updated_at",
    )
    search_fields = ("user__username",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("user", "balance", "daily_reward_streak", "daily_reward_last_claimed_at")}),
        ("Реферальная программа", {"fields": ("referral_code", "referred_by")}),
        ("Служебное", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(Task)
class TaskAdmin(TaskAdminBase):
    list_display = ("name", "reward", "link", "created_at", "updated_at")
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "description", "reward")}),
        ("Оформление", {"fields": ("icon",)}),
        ("Ссылка", {"fields": ("link",)}),
        ("Служебное", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(TaskCompletion)
class TaskCompletionAdmin(TaskCompletionAdminBase):
    list_display = ("profile", "task", "is_completed", "created_at")
    list_filter = ("is_completed",)
    search_fields = ("profile__user__username", "task__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(SimulationConfig)
class SimulationConfigAdmin(SimulationConfigAdminBase):
    list_display = (
        "attempt_cost",
        "reward_level_1",
        "reward_level_2",
        "reward_level_3",
        "reward_threshold_1",
        "reward_amount_1",
        "reward_threshold_2",
        "reward_amount_2",
        "reward_threshold_3",
        "reward_amount_3",
        "duration_seconds",
        "updated_at",
    )
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {
            "fields": (
                "attempt_cost",
                "duration_seconds",
                "description",
            )
        }),
        (
            "Пороговые награды",
            {
                "fields": (
                    "reward_threshold_1",
                    "reward_amount_1",
                    "reward_threshold_2",
                    "reward_amount_2",
                    "reward_threshold_3",
                    "reward_amount_3",
                )
            },
        ),
        (
            "Стандартные награды",
            {
                "fields": (
                    "reward_level_1",
                    "reward_level_2",
                    "reward_level_3",
                )
            },
        ),
        (
            "Тех. поля",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(RuleCategory)
class RuleCategoryAdmin(RuleCategoryAdminBase):
    list_display = ("category", "created_at", "updated_at")
    search_fields = ("category",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("category", "rule_text", "icon")}),
        ("Служебное", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(DailyReward)
class DailyRewardAdmin(DailyRewardAdminBase):
    list_display = ("day_number", "reward_amount", "created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("day_number", "reward_amount")}),
        ("Служебное", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(DailyRewardClaim)
class DailyRewardClaimAdmin(DailyRewardClaimAdminBase):
    list_display = ("profile", "reward", "sequence_day", "claimed_for_date", "claimed_at")
    list_filter = ("sequence_day", "claimed_for_date")
    search_fields = ("profile__user__username",)
    readonly_fields = ("claimed_at", "created_at", "updated_at")


@admin.register(SimulationRewardClaim)
class SimulationRewardClaimAdmin(SimulationRewardClaimAdminBase):
    list_display = ("profile", "threshold", "claimed_for_date", "created_at")
    list_filter = ("threshold", "claimed_for_date")
    search_fields = ("profile__user__username",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Failure)
class FailureAdmin(FailureAdminBase):
    list_display = (
        "name",
        "start_time",
        "end_time",
        "duration_seconds",
        "bombs_min_count",
        "bombs_max_count",
        "created_at",
    )
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "start_time", "end_time")}),
        (
            "Параметры игры",
            {
                "fields": (
                    "duration_seconds",
                    "bombs_min_count",
                    "bombs_max_count",
                    "max_bonuses_per_run",
                )
            },
        ),
        (
            "Цены на бонусы",
            {
                "fields": (
                    "bonus_price_x2",
                    "bonus_price_x5",
                    "bonus_price_x10",
                    "bonus_price_freeze",
                    "bonus_price_no_bombs",
                )
            },
        ),
        ("Главный приз", {"fields": ("main_prize_title", "main_prize_image")}),
        ("Служебное", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(FailureBonusPurchase)
class FailureBonusPurchaseAdmin(FailureBonusPurchaseAdminBase):
    list_display = ("profile", "failure", "bonus_type", "created_at")
    list_filter = ("bonus_type", "failure")
    search_fields = ("profile__user__username", "failure__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(AdvertisementButton)
class AdvertisementButtonAdmin(AdvertisementButtonAdminBase):
    list_display = ("title", "link", "order", "created_at", "updated_at")
    list_editable = ("order",)
    search_fields = ("title",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(FrontendConfig)
class FrontendConfigAdmin(FrontendConfigAdminBase):
    list_display = ("name", "screen_texture", "updated_at")
    readonly_fields = ("created_at", "updated_at")

    def has_add_permission(self, request: HttpRequest) -> bool:  # pragma: no cover - admin guard
        if FrontendConfig.objects.exists():
            return False
        return super().has_add_permission(request)


@admin.register(QuizQuestion)
class QuizQuestionAdmin(QuizQuestionAdminBase):
    list_display = ("id", "question_text", "reward", "created_at")
    readonly_fields = ("created_at", "updated_at")
    change_list_template = "admin/game/quizquestion/change_list.html"

    def get_urls(self):  # type: ignore[override]
        urls = super().get_urls()
        custom = [
            path(
                "import-excel/",
                self.admin_site.admin_view(self.import_excel_view),
                name="game_quizquestion_import",
            ),
        ]
        return custom + urls

    def import_excel_view(self, request: HttpRequest) -> HttpResponse:
        context = dict(
            self.admin_site.each_context(request),
            opts=self.model._meta,
        )

        if request.method == "POST":
            form = QuizQuestionImportForm(request.POST, request.FILES)
            if form.is_valid():
                upload = form.cleaned_data["file"]
                replace_existing = form.cleaned_data["replace_existing"]

                try:
                    rows_raw = _read_xlsx_rows(upload.read())
                except Exception as exc:  # pragma: no cover - defensive
                    messages.error(request, f"Не удалось прочитать файл: {exc}")
                    context["form"] = form
                    return TemplateResponse(
                        request,
                        "admin/game/quizquestion/import_form.html",
                        context,
                    )

                rows = []
                skipped = 0

                for idx, row in enumerate(rows_raw[1:], start=2):
                    question_text = (row[0] if len(row) > 0 else "").strip()
                    correct_answer = (row[1] if len(row) > 1 else "").strip()
                    if not question_text or not correct_answer:
                        skipped += 1
                        continue

                    wrong_answers = []
                    for col in range(2, 5):
                        if len(row) <= col:
                            continue
                        value = row[col]
                        text = str(value).strip()
                        if text:
                            wrong_answers.append(text)

                    answers = [correct_answer, *wrong_answers]
                    reward_raw = 0
                    try:
                        reward_raw = int(row[5]) if len(row) > 5 and row[5] not in {None, ""} else 0
                    except (TypeError, ValueError):
                        reward_raw = 0

                    rows.append(
                        QuizQuestion(
                            question_text=question_text,
                            answers=answers,
                            correct_answer_index=0,
                            reward=max(reward_raw, 0),
                        )
                    )

                if replace_existing:
                    QuizQuestion.objects.all().delete()

                if rows:
                    QuizQuestion.objects.bulk_create(rows)

                messages.success(
                    request,
                    f"Импортировано вопросов: {len(rows)}. Пропущено строк: {skipped}.",
                )
                return redirect("..")

            context["form"] = form
        else:
            context["form"] = QuizQuestionImportForm()

        return TemplateResponse(
            request,
            "admin/game/quizquestion/import_form.html",
            context,
        )


@admin.register(ScoreEntry)
class ScoreEntryAdmin(ScoreEntryAdminBase):
    list_display = (
        "profile",
        "failure",
        "points",
        "duration_seconds",
        "earned_at",
    )
    list_filter = ("failure",)
    search_fields = ("profile__user__username",)
    readonly_fields = ("earned_at", "created_at", "updated_at")


@admin.register(AdsgramAssignment)
class AdsgramAssignmentAdmin(AdsgramAssignmentAdminBase):
    list_display = (
        "external_assignment_id",
        "profile",
        "placement_id",
        "status",
        "created_at",
        "completed_at",
    )
    list_filter = ("status", "placement_id")
    search_fields = ("external_assignment_id", "profile__user__username")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PromoCode)
class PromoCodeAdmin(PromoCodeAdminBase):
    list_display = (
        "code",
        "reward",
        "max_redemptions",
        "redemptions_count",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active",)
    search_fields = ("code",)
    readonly_fields = ("created_at", "updated_at")
    change_list_template = "admin/game/promocode/change_list.html"

    def get_urls(self):  # type: ignore[override]
        urls = super().get_urls()
        custom = [
            path(
                "generate/",
                self.admin_site.admin_view(self.generate_view),
                name="game_promocode_generate",
            ),
        ]
        return custom + urls

    def generate_view(self, request: HttpRequest) -> HttpResponse:
        context = dict(
            self.admin_site.each_context(request),
            opts=self.model._meta,
        )

        if request.method == "POST":
            form = PromoCodeGenerateForm(request.POST)
            if form.is_valid():
                count = form.cleaned_data["count"]
                reward = form.cleaned_data["reward"]
                max_redemptions = form.cleaned_data["max_redemptions"]

                created_codes: list[PromoCode] = []
                existing_codes = set(
                    PromoCode.objects.values_list("code", flat=True)
                )

                for _ in range(count):
                    while True:
                        candidate = generate_promo_code()
                        if candidate not in existing_codes:
                            existing_codes.add(candidate)
                            break

                    created_codes.append(
                        PromoCode(
                            code=candidate,
                            reward=reward,
                            max_redemptions=max_redemptions,
                        )
                    )

                PromoCode.objects.bulk_create(created_codes)

                codes_preview = ", ".join(code.code for code in created_codes)
                messages.success(
                    request,
                    f"Создано промокодов: {len(created_codes)}. Коды: {codes_preview}",
                )
                return redirect("..")

            context["form"] = form
        else:
            context["form"] = PromoCodeGenerateForm()

        return TemplateResponse(
            request,
            "admin/game/promocode/generate.html",
            context,
        )


@admin.register(PromoCodeRedemption)
class PromoCodeRedemptionAdmin(PromoCodeRedemptionAdminBase):
    list_display = ("promo_code", "profile", "redeemed_at")
    search_fields = ("promo_code__code", "profile__user__username")
    readonly_fields = ("redeemed_at", "created_at", "updated_at")
