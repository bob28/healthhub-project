"use client";

/**
 * Presentational card for a single appointment.
 *
 * Shows the facility, time, status, and reason, and — for appointments that
 * can still be cancelled — a Cancel button. The card owns only its own button
 * loading state; the actual cancel call is delegated to the parent via
 * `onCancel`, keeping API access in the page.
 */

import { useState } from "react";
import dayjs from "dayjs";
import { Badge, Button, Card } from "@mantine/core";
import { MdLocationOn, MdCalendarMonth } from "react-icons/md";

import type { Appointment, AppointmentStatus } from "@/src/types/appointment";

/** Mantine badge colour for each appointment status. */
const STATUS_COLOR: Record<AppointmentStatus, string> = {
  scheduled: "primary",
  checked_in: "accent",
  completed: "green",
  cancelled: "gray",
  no_show: "red",
};

/** Statuses that a patient or staff member is still allowed to cancel. */
const CANCELLABLE: AppointmentStatus[] = ["scheduled", "checked_in"];

export function AppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: Appointment;
  onCancel: (id: number) => Promise<void>;
}) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(appointment.id);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Card
      radius="lg"
      padding="lg"
      className="border border-gray-200 !shadow transition-shadow hover:!shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-secondary">
            {appointment.facility.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <MdCalendarMonth className="h-4 w-4 text-gray-400" />
            {dayjs(appointment.scheduled_at).format("MMM D, YYYY · h:mm A")}
          </p>
        </div>
        <Badge
          color={STATUS_COLOR[appointment.status]}
          variant="light"
          radius="sm"
        >
          {appointment.status_display}
        </Badge>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
        <MdLocationOn className="h-4 w-4 text-gray-400" />
        {appointment.facility.address}
      </p>

      {appointment.referring_doctor_name && (
        <p className="mt-1 text-sm text-gray-500">
          Referred by {appointment.referring_doctor_name}
        </p>
      )}

      {appointment.reason && (
        <p className="mt-3 border-t border-gray-200 pt-3 text-sm text-secondary">
          {appointment.reason}
        </p>
      )}

      {CANCELLABLE.includes(appointment.status) && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="light"
            color="red"
            size="xs"
            loading={cancelling}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );
}
