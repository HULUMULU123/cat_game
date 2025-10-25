from __future__ import annotations

from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Gift, LeaderboardEntry, QuizQuestion, SimulationConfig, TaskAssignment
from .serializers import (
    GiftSerializer,
    LeaderboardEntrySerializer,
    QuizQuestionSerializer,
    SimulationConfigSerializer,
    TaskAssignmentSerializer,
)


class ActiveGiftView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        gift = (
            Gift.objects.filter(expires_at__isnull=True)
            | Gift.objects.filter(expires_at__gte=timezone.now())
        ).order_by("-updated_at").first()
        if not gift:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = GiftSerializer(gift)
        return Response(serializer.data)


class TaskAssignmentListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        assignments = (
            TaskAssignment.objects.filter(profile=request.user.userprofile)
            .select_related("task")
            .order_by("-is_completed", "task__name")
        )
        serializer = TaskAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class QuizQuestionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        question = QuizQuestion.objects.order_by("-updated_at").first()
        if not question:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = QuizQuestionSerializer(question)
        return Response(serializer.data)


class LeaderboardView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        entries = LeaderboardEntry.objects.select_related("profile", "profile__user").order_by("position")
        serializer = LeaderboardEntrySerializer(entries, many=True)
        current_entry = entries.filter(profile=request.user.userprofile).first()
        current_data = (
            LeaderboardEntrySerializer(current_entry).data if current_entry else None
        )
        return Response({"entries": serializer.data, "current_user": current_data})


class SimulationConfigView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request) -> Response:
        config = SimulationConfig.objects.order_by("-updated_at").first()
        if not config:
            config = SimulationConfig.objects.create(cost=200, description="Запустите симуляцию, чтобы потренироваться без риска.")
        serializer = SimulationConfigSerializer(config)
        return Response(serializer.data)


class SimulationStartView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request: Request) -> Response:
        profile = request.user.userprofile
        config = SimulationConfig.objects.select_for_update().order_by("-updated_at").first()
        if not config:
            config = SimulationConfig.objects.create(cost=200, description="Запустите симуляцию, чтобы потренироваться без риска.")
        cost = config.cost
        if profile.balance < cost:
            return Response(
                {
                    "detail": "Недостаточно монет для запуска симуляции.",
                    "balance": profile.balance,
                    "required": cost,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.balance -= cost
        profile.save(update_fields=["balance", "updated_at"])

        return Response(
            {
                "detail": "Симуляция успешно запущена!",
                "balance": profile.balance,
                "cost": cost,
            },
            status=status.HTTP_200_OK,
        )
