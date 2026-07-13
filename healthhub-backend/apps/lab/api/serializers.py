from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.accounts.models import User, UserRole
from apps.directory.models import TestAnalyte

from ..models import ResultValue, TestOrder, TestResult


class ResultValueSerializer(serializers.ModelSerializer):
    """Read serializer for one measured value, with analyte context + flag."""

    analyte_name = serializers.CharField(source="analyte.name", read_only=True)
    unit = serializers.CharField(source="analyte.unit", read_only=True)
    reference_range = serializers.CharField(
        source="analyte.reference_range_display", read_only=True
    )
    flag_display = serializers.CharField(
        source="get_flag_display", read_only=True
    )

    class Meta:
        model = ResultValue
        fields = [
            "id",
            "analyte",
            "analyte_name",
            "unit",
            "reference_range",
            "value",
            "flag",
            "flag_display",
        ]


class TestResultSerializer(serializers.ModelSerializer):
    """Read serializer for a result set with its measured values nested."""

    performed_by_name = serializers.CharField(
        source="performed_by.get_full_name", read_only=True, default=None
    )
    verified_by_name = serializers.CharField(
        source="verified_by.get_full_name", read_only=True, default=None
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    values = ResultValueSerializer(many=True, read_only=True)

    class Meta:
        model = TestResult
        fields = [
            "id",
            "status",
            "status_display",
            "performed_by_name",
            "verified_by_name",
            "resulted_at",
            "notes",
            "values",
        ]


class TestOrderSerializer(serializers.ModelSerializer):
    """Read serializer for a test order, including its result if present."""

    patient_name = serializers.CharField(
        source="patient.get_full_name", read_only=True
    )
    lab_test_code = serializers.CharField(source="lab_test.code", read_only=True)
    lab_test_name = serializers.CharField(source="lab_test.name", read_only=True)
    ordered_by_name = serializers.CharField(
        source="ordered_by.get_full_name", read_only=True, default=None
    )
    collected_by_name = serializers.CharField(
        source="collected_by.get_full_name", read_only=True, default=None
    )
    priority_display = serializers.CharField(
        source="get_priority_display", read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    result = serializers.SerializerMethodField()

    class Meta:
        model = TestOrder
        fields = [
            "id",
            "order_number",
            "patient",
            "patient_name",
            "lab_test",
            "lab_test_code",
            "lab_test_name",
            "appointment",
            "ordered_by",
            "ordered_by_name",
            "collected_by_name",
            "collected_at",
            "priority",
            "priority_display",
            "status",
            "status_display",
            "created_at",
            "result",
        ]

    @extend_schema_field(TestResultSerializer)
    def get_result(self, order):
        """Return the nested result set, or ``None`` if not yet resulted.

        Args:
            order: The :class:`~lab.models.TestOrder` being serialized.

        Returns:
            The serialized result dict, or ``None`` when no result exists.
        """
        result = getattr(order, "result", None)
        return TestResultSerializer(result).data if result else None


class TestOrderCreateSerializer(serializers.ModelSerializer):
    """Write serializer for a doctor ordering a test for a patient."""

    patient = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=UserRole.PATIENT)
    )

    class Meta:
        model = TestOrder
        fields = ["patient", "lab_test", "appointment", "priority"]


class ResultValueInputSerializer(serializers.Serializer):
    """Validate one measured value submitted when recording a result."""

    analyte = serializers.PrimaryKeyRelatedField(
        queryset=TestAnalyte.objects.all()
    )
    value = serializers.DecimalField(max_digits=10, decimal_places=3)


class RecordResultSerializer(serializers.Serializer):
    """Validate the payload for recording a result against an order."""

    notes = serializers.CharField(required=False, allow_blank=True, default="")
    values = ResultValueInputSerializer(many=True)
