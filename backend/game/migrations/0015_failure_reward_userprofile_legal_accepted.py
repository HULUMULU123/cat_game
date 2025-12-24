from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0014_userprofile_photo_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="legal_accepted",
            field=models.BooleanField(default=False, verbose_name="Ознакомлен с юридическими правилами"),
        ),
        migrations.AddField(
            model_name="failure",
            name="reward",
            field=models.PositiveIntegerField(default=0, verbose_name="Награда (монеты)"),
        ),
    ]
