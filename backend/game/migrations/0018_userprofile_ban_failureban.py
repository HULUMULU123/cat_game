from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0017_task_max_users"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="is_banned",
            field=models.BooleanField(
                default=False,
                help_text="Блокирует доступ пользователя к приложению.",
                verbose_name="Доступ запрещён",
            ),
        ),
        migrations.CreateModel(
            name="FailureBan",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="Дата создания"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="Дата обновления"),
                ),
                (
                    "reason",
                    models.CharField(
                        blank=True,
                        default="",
                        max_length=255,
                        verbose_name="Причина бана",
                    ),
                ),
                (
                    "failure",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bans",
                        to="game.failure",
                        verbose_name="Сбой",
                    ),
                ),
                (
                    "profile",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="failure_bans",
                        to="game.userprofile",
                        verbose_name="Профиль",
                    ),
                ),
            ],
            options={
                "verbose_name": "Бан в сбое",
                "verbose_name_plural": "Баны в сбое",
                "db_table": "баны_сбоев",
            },
        ),
        migrations.AddConstraint(
            model_name="failureban",
            constraint=models.UniqueConstraint(
                fields=("profile", "failure"),
                name="uniq_failure_ban_per_profile",
            ),
        ),
    ]
