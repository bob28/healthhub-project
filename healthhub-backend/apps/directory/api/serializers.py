from rest_framework import serializers

from ..models import Facility, LabTest, TestAnalyte


class FacilitySerializer(serializers.ModelSerializer):
    """Read serializer for a care/collection facility."""

    facility_type_display = serializers.CharField(
        source="get_facility_type_display", read_only=True
    )

    class Meta:
        model = Facility
        fields = [
            "id",
            "name",
            "facility_type",
            "facility_type_display",
            "address",
            "phone",
        ]


class TestAnalyteSerializer(serializers.ModelSerializer):
    """Read serializer for a test's analyte, including its display range."""

    reference_range = serializers.CharField(
        source="reference_range_display", read_only=True
    )

    class Meta:
        model = TestAnalyte
        fields = [
            "id",
            "name",
            "unit",
            "ref_low",
            "ref_high",
            "reference_range",
            "display_order",
        ]


class LabTestSerializer(serializers.ModelSerializer):
    """Read serializer for a catalog test with its analytes nested."""

    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )
    specimen_type_display = serializers.CharField(
        source="get_specimen_type_display", read_only=True
    )
    analytes = TestAnalyteSerializer(many=True, read_only=True)

    class Meta:
        model = LabTest
        fields = [
            "id",
            "code",
            "name",
            "category",
            "category_display",
            "specimen_type",
            "specimen_type_display",
            "description",
            "prep_instructions",
            "turnaround_hours",
            "price",
            "is_active",
            "analytes",
        ]
