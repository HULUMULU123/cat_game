from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0005_task_link_userprofile_referral_code_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="telegram_id",
            field=models.BigIntegerField(
                default=0,
                help_text="Числовой идентификатор пользователя Telegram для проверок подписок",
                verbose_name="Telegram ID",
            ),
        ),
    ]
