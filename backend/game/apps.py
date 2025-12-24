from django.apps import AppConfig
from django.db.models.signals import post_migrate


def ensure_role_permissions(sender, **kwargs):
    """
    Создаёт базовые роли и права:
    - "Младший админ" получает доступ только к модели QuizQuestion (таблица «Вопросы»).
    """
    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType

    target_models = [("game", "quizquestion")]
    permissions = []

    for app_label, model in target_models:
        ct = ContentType.objects.filter(app_label=app_label, model=model).first()
        if not ct:
            continue
        perms = Permission.objects.filter(content_type=ct)
        permissions.extend(perms)

    if not permissions:
        return

    junior_admin, _ = Group.objects.get_or_create(name="Младший админ")
    junior_admin.permissions.add(*permissions)


class GameConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "game"

    def ready(self):
        from . import signals  # noqa: F401
        post_migrate.connect(ensure_role_permissions, sender=self)
