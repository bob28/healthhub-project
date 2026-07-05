"""Tests for reference-range classification and display on TestAnalyte."""

from decimal import Decimal

import pytest

from apps.directory.models import LabTest, ResultFlag, TestAnalyte, TestCategory

pytestmark = pytest.mark.django_db


@pytest.fixture
def hemoglobin():
    """Return a Hemoglobin analyte with a 12–16 g/dL reference range.

    The 4-unit-wide range means the "critical" margin is also 4: below 8 is
    critical-low and above 20 is critical-high.
    """
    test = LabTest.objects.create(
        code="CBC", name="Complete Blood Count", category=TestCategory.HEMATOLOGY
    )
    return TestAnalyte.objects.create(
        lab_test=test,
        name="Hemoglobin",
        unit="g/dL",
        ref_low=Decimal("12"),
        ref_high=Decimal("16"),
    )


@pytest.mark.parametrize(
    "value,expected",
    [
        (14, ResultFlag.NORMAL),
        (12, ResultFlag.NORMAL),
        (16, ResultFlag.NORMAL),
        (10, ResultFlag.LOW),
        (18, ResultFlag.HIGH),
        (7, ResultFlag.CRITICAL_LOW),
        (21, ResultFlag.CRITICAL_HIGH),
    ],
)
def test_classify_bounded_range(hemoglobin, value, expected):
    """Values are flagged normal/low/high/critical against a two-sided range."""
    assert hemoglobin.classify(value) == expected


def test_classify_upper_bound_only():
    """An analyte with only an upper bound never flags low."""
    test = LabTest.objects.create(
        code="CRP", name="C-Reactive Protein", category=TestCategory.IMMUNOLOGY
    )
    analyte = TestAnalyte.objects.create(
        lab_test=test, name="CRP", unit="mg/L", ref_high=Decimal("5")
    )
    assert analyte.classify(2) == ResultFlag.NORMAL
    assert analyte.classify(8) == ResultFlag.HIGH
    assert analyte.classify(0) == ResultFlag.NORMAL


def test_classify_no_range_is_always_normal():
    """A qualitative analyte with no bounds is always normal."""
    test = LabTest.objects.create(
        code="CULT", name="Culture", category=TestCategory.MICROBIOLOGY
    )
    analyte = TestAnalyte.objects.create(lab_test=test, name="Growth")
    assert analyte.classify(999) == ResultFlag.NORMAL


def test_reference_range_display_formats():
    """The reference range renders in the expected human-readable forms."""
    test = LabTest.objects.create(
        code="X", name="X", category=TestCategory.CHEMISTRY
    )
    both = TestAnalyte.objects.create(
        lab_test=test, name="A", unit="g/dL",
        ref_low=Decimal("12"), ref_high=Decimal("16"),
    )
    upper = TestAnalyte.objects.create(
        lab_test=test, name="B", unit="mg/L", ref_high=Decimal("5")
    )
    lower = TestAnalyte.objects.create(
        lab_test=test, name="C", unit="U/L", ref_low=Decimal("40")
    )
    none = TestAnalyte.objects.create(lab_test=test, name="D")

    assert both.reference_range_display() == "12–16 g/dL"
    assert upper.reference_range_display() == "< 5 mg/L"
    assert lower.reference_range_display() == "> 40 U/L"
    assert none.reference_range_display() == ""
