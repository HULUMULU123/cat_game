from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0003_dailyreward_dailyrewardclaim_failure_rulecategory_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="failure",
            name="is_repeatable",
            field=models.BooleanField(
                default=True,
                verbose_name="Можно участвовать несколько раз",
            ),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="photo_url",
            field=models.URLField(
                blank=True,
                default="",
                verbose_name="URL аватара",
            ),
        ),
    ]
