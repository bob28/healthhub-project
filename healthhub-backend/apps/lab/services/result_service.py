"""Business rules for recording and verifying test results."""

from django.db import transaction
from rest_framework.exceptions import ValidationError

from ..models import OrderStatus, ResultStatus, ResultValue, TestResult


@transaction.atomic
def record_result(*, order, performed_by, values, notes=""):
    """Record a set of measured values against an order (auto-flagged).

    Creates a preliminary :class:`~lab.models.TestResult` and one
    :class:`~lab.models.ResultValue` per supplied value; each value is
    classified against its analyte's reference range on save. The order
    advances to ``resulted``.

    Args:
        order: The order being resulted.
        performed_by: The staff ``User`` who ran the test.
        values: An iterable of ``{"analyte": TestAnalyte, "value": Decimal}``.
        notes: Optional free-text notes on the result.

    Returns:
        The created :class:`~lab.models.TestResult`.

    Raises:
        ValidationError: If the order is cancelled, already has a result, no
            values are supplied, or an analyte does not belong to the ordered
            test.
    """
    if order.status == OrderStatus.CANCELLED:
        raise ValidationError("Results can't be recorded for a cancelled order.")
    if hasattr(order, "result"):
        raise ValidationError("This order already has a result.")
    if not values:
        raise ValidationError({"values": "At least one value is required."})

    valid_analyte_ids = set(
        order.lab_test.analytes.values_list("id", flat=True)
    )

    result = TestResult.objects.create(
        order=order,
        performed_by=performed_by,
        status=ResultStatus.PRELIMINARY,
        notes=notes,
    )
    for item in values:
        analyte = item["analyte"]
        if analyte.id not in valid_analyte_ids:
            raise ValidationError(
                {"values": f"'{analyte.name}' is not part of this test."}
            )
        ResultValue.objects.create(
            result=result, analyte=analyte, value=item["value"]
        )

    order.status = OrderStatus.RESULTED
    order.save(update_fields=["status"])
    return result


def verify_result(*, order, verified_by):
    """Verify an order's result, finalizing it for the patient to view.

    Args:
        order: The order whose result is being verified.
        verified_by: The verifying doctor ``User``.

    Returns:
        The finalized :class:`~lab.models.TestResult`.

    Raises:
        ValidationError: If the order has no result, or it is already verified.
    """
    result = getattr(order, "result", None)
    if result is None:
        raise ValidationError("This order has no result to verify.")
    if order.status == OrderStatus.VERIFIED:
        raise ValidationError("This result has already been verified.")

    result.verified_by = verified_by
    result.status = ResultStatus.FINAL
    result.save(update_fields=["verified_by", "status"])

    order.status = OrderStatus.VERIFIED
    order.save(update_fields=["status"])
    return result
