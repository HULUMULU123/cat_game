from __future__ import annotations

from datetime import timedelta

from django.db import migrations
from django.utils import timezone


def seed_initial_data(apps, schema_editor) -> None:
    User = apps.get_model("auth", "User")
    UserProfile = apps.get_model("game", "UserProfile")
    Task = apps.get_model("game", "Task")
    TaskAssignment = apps.get_model("game", "TaskAssignment")
    Gift = apps.get_model("game", "Gift")
    QuizQuestion = apps.get_model("game", "QuizQuestion")
    LeaderboardEntry = apps.get_model("game", "LeaderboardEntry")
    SimulationConfig = apps.get_model("game", "SimulationConfig")

    user, _ = User.objects.get_or_create(username="demo")
    if not user.first_name:
        user.first_name = "Demo"
        user.last_name = "User"
        user.set_unusable_password()
        user.save()

    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"balance": 5500})

    tasks = [
        Task.objects.get_or_create(
            name="Просмотр рекламного ролика",
            defaults={
                "description": "Посмотрите ролик, чтобы получить бонусные монеты.",
                "reward": 100,
                "icon": "https://example.com/advert.svg",
            },
        )[0],
        Task.objects.get_or_create(
            name="Тест на внимательность",
            defaults={
                "description": "Ответьте на вопросы, чтобы укрепить навык концентрации.",
                "reward": 150,
                "icon": "https://example.com/quiz.svg",
            },
        )[0],
        Task.objects.get_or_create(
            name="Поделиться с другом",
            defaults={
                "description": "Пригласите друга и заработайте монеты.",
                "reward": 200,
                "icon": "https://example.com/share.svg",
            },
        )[0],
    ]

    for index, task in enumerate(tasks):
        TaskAssignment.objects.get_or_create(
            profile=profile,
            task=task,
            defaults={"is_completed": index == 0},
        )

    Gift.objects.update_or_create(
        title="Ежедневный подарок",
        defaults={
            "description": "Получите бонусные монеты за вход сегодня.",
            "coins": 50,
            "expires_at": timezone.now() + timedelta(hours=4),
            "image_url": "https://example.com/gift.svg",
        },
    )

    QuizQuestion.objects.update_or_create(
        round_number=4,
        defaults={
            "question": "Кто такой Александр Македонский?",
            "answers": [
                "Основатель Римской Империи",
                "Великий полководец и царь",
                "Учёный из Древней Греции",
                "Мифический герой Спарты",
            ],
            "correct_answer_index": 1,
            "total_rounds": 5,
        },
    )

    SimulationConfig.objects.update_or_create(
        id=1,
        defaults={
            "cost": 200,
            "description": "Симуляция имитирует сбой и позволяет потренироваться.",
        },
    )

    leaderboard_data = [
        {"position": 1, "score": 9750, "duration_seconds": 732},
        {"position": 2, "score": 9100, "duration_seconds": 845},
        {"position": 3, "score": 8750, "duration_seconds": 921},
        {"position": 4, "score": 8200, "duration_seconds": 1034},
        {"position": 5, "score": 7900, "duration_seconds": 1112},
    ]

    for entry_data in leaderboard_data:
        entry_profile = profile
        if entry_data["position"] != 4:
            username = f"player{entry_data['position']}"
            player, _ = User.objects.get_or_create(username=username)
            if not player.first_name:
                player.first_name = f"Player {entry_data['position']}"
                player.set_unusable_password()
                player.save()
            entry_profile, _ = UserProfile.objects.get_or_create(user=player)
        LeaderboardEntry.objects.update_or_create(
            position=entry_data["position"],
            defaults={
                "profile": entry_profile,
                "score": entry_data["score"],
                "duration_seconds": entry_data["duration_seconds"],
            },
        )


def unseed_initial_data(apps, schema_editor) -> None:
    TaskAssignment = apps.get_model("game", "TaskAssignment")
    TaskAssignment.objects.all().delete()
    Task = apps.get_model("game", "Task")
    Task.objects.all().delete()
    Gift = apps.get_model("game", "Gift")
    Gift.objects.all().delete()
    QuizQuestion = apps.get_model("game", "QuizQuestion")
    QuizQuestion.objects.all().delete()
    LeaderboardEntry = apps.get_model("game", "LeaderboardEntry")
    LeaderboardEntry.objects.all().delete()
    SimulationConfig = apps.get_model("game", "SimulationConfig")
    SimulationConfig.objects.all().delete()


default_operations = [
    migrations.RunPython(seed_initial_data, reverse_code=unseed_initial_data)
]


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0001_initial"),
    ]

    operations = default_operations
