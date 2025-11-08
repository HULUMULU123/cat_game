# Generated manually to add AdsgramAssignment model
from __future__ import annotations

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0003_dailyreward_dailyrewardclaim_failure_rulecategory_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="AdsgramAssignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Дата обновления")),
                ("external_assignment_id", models.CharField(max_length=255, unique=True, verbose_name="ID задания Adsgram")),
                ("placement_id", models.CharField(blank=True, max_length=255, verbose_name="Placement ID")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("requested", "Задание получено"),
                            ("completed", "Задание выполнено"),
                            ("failed", "Ошибка"),
                        ],
                        default="requested",
                        max_length=32,
                        verbose_name="Статус",
                    ),
                ),
                ("payload", models.JSONField(blank=True, default=dict, verbose_name="Данные интеграции")),
                ("completed_at", models.DateTimeField(blank=True, null=True, verbose_name="Время завершения")),
                (
                    "profile",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="adsgram_assignments",
                        to="game.userprofile",
                        verbose_name="Профиль",
                    ),
                ),
            ],
            options={
                "verbose_name": "Задание Adsgram",
                "verbose_name_plural": "Задания Adsgram",
                "db_table": "adsgram_assignments",
            },
        ),
    ]
