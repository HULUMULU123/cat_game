from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0004_adsgram_assignment"),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="link",
            field=models.URLField(blank=True, verbose_name="Ссылка (URL)"),
        ),

        migrations.AddField(
            model_name="userprofile",
            name="referred_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="referrals",
                to="game.userprofile",
                verbose_name="Пригласивший пользователь",
            ),
        ),

        migrations.CreateModel(
            name="QuizAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Дата обновления")),
                ("mode", models.CharField(default="quiz", max_length=32, verbose_name="Режим")),
                ("correct_answers", models.PositiveIntegerField(default=0, verbose_name="Количество правильных ответов")),
                ("total_questions", models.PositiveIntegerField(default=0, verbose_name="Всего вопросов")),
                ("reward", models.PositiveIntegerField(default=0, verbose_name="Полученная награда")),
                ("completed_at", models.DateTimeField(default=django.utils.timezone.now, verbose_name="Дата завершения")),
                (
                    "profile",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="quiz_attempts",
                        to="game.userprofile",
                        verbose_name="Профиль",
                    ),
                ),
            ],
            options={
                "verbose_name": "Попытка викторины",
                "verbose_name_plural": "Попытки викторины",
                "db_table": "попытки_викторины",
            },
        ),
    ]
