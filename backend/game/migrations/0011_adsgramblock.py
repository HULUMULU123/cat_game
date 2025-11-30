from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0010_referralprogramconfig_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="AdsgramBlock",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Дата обновления")),
                ("block_id", models.CharField(max_length=64, unique=True, verbose_name="Block ID")),
                ("is_active", models.BooleanField(default=True, verbose_name="Активен")),
            ],
            options={
                "verbose_name": "Рекламный блок Adsgram",
                "verbose_name_plural": "Рекламные блоки Adsgram",
                "db_table": "adsgram_blocks",
            },
        ),
    ]
