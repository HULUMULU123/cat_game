from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0011_adsgramblock"),
    ]

    operations = [
        migrations.AddField(
            model_name="failure",
            name="shop_enabled",
            field=models.BooleanField(
                default=True,
                help_text="Определяет, должен ли показываться магазин бонусов перед стартом сбоя.",
                verbose_name="Магазин бонусов включён",
            ),
        ),
    ]
