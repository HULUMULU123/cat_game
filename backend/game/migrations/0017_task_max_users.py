from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0016_simulation_reward_claim_unique_per_day"),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="max_users",
            field=models.PositiveIntegerField(
                blank=True,
                null=True,
                help_text="Сколько пользователей могут выполнить задание. Пусто — без ограничений.",
                verbose_name="Лимит пользователей",
            ),
        ),
    ]
