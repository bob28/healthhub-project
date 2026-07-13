"""Business rules for creating and progressing test orders."""

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from ..models import OrderPriority, OrderStatus, TestOrder


def create_order(
    *, patient, lab_test, ordered_by, appointment=None, priority=OrderPriority.ROUTINE
):
    """Create a test order for a patient.

    Args:
        patient: The patient ``User`` the test is for.
        lab_test: The :class:`~directory.models.LabTest` being ordered.
        ordered_by: The ordering doctor ``User``.
        appointment: Optional appointment the specimen is collected at.
        priority: Order priority (routine or STAT).

    Returns:
        The created :class:`~lab.models.TestOrder`.
    """
    return TestOrder.objects.create(
        patient=patient,
        lab_test=lab_test,
        ordered_by=ordered_by,
        appointment=appointment,
        priority=priority,
    )


def collect_order(order, collected_by):
    """Record specimen collection, advancing the order to ``collected``.

    Args:
        order: The order whose specimen was collected.
        collected_by: The staff ``User`` who collected it.

    Returns:
        The updated order.

    Raises:
        ValidationError: If the order was cancelled or already resulted.
    """
    closed = {OrderStatus.CANCELLED, OrderStatus.RESULTED, OrderStatus.VERIFIED}
    if order.status in closed:
        raise ValidationError("This order can no longer be collected.")
    order.collected_by = collected_by
    order.collected_at = timezone.now()
    order.status = OrderStatus.COLLECTED
    order.save(update_fields=["collected_by", "collected_at", "status"])
    return order
