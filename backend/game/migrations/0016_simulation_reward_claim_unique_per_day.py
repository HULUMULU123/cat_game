from django.db import migrations
from django.db.models import Count, Min


def dedupe_simulation_reward_claims(apps, schema_editor) -> None:
    SimulationRewardClaim = apps.get_model("game", "SimulationRewardClaim")
    duplicates = (
        SimulationRewardClaim.objects.values("profile_id", "claimed_for_date")
        .annotate(min_id=Min("id"), count_id=Count("id"))
        .filter(count_id__gt=1)
    )
    for dup in duplicates:
        (
            SimulationRewardClaim.objects.filter(
                profile_id=dup["profile_id"],
                claimed_for_date=dup["claimed_for_date"],
            )
            .exclude(id=dup["min_id"])
            .delete()
        )


class Migration(migrations.Migration):
    dependencies = [
        ("game", "0015_failure_reward_userprofile_legal_accepted"),
    ]

    operations = [
        migrations.RunPython(dedupe_simulation_reward_claims, migrations.RunPython.noop),
        migrations.AlterUniqueTogether(
            name="simulationrewardclaim",
            unique_together={("profile", "claimed_for_date")},
        ),
    ]
