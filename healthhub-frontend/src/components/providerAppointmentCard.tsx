"use client";

/**
 * Staff-facing appointment card with status actions.
 *
 * Leads with the patient (staff scan by patient, not facility) and exposes the
 * status transitions available at each stage: a scheduled visit can be checked
 * in or cancelled; a checked-in visit can be completed or marked a no-show. The
 * card owns only its in-flight button state; the API calls are delegated to the
 * parent so data access stays in the page.
 */

import { useState } from "react";
import dayjs from "dayjs";
import { Badge, Button, Card } from "@mantine/core";
import { MdCalendarMonth, MdLocationOn } from "react-icons/md";

import type { Appointment, AppointmentStatus } from "@/src/types/appointment";

/** Mantine badge colour for each appointment status. */
const STATUS_COLOR: Record<AppointmentStatus, string> = {
  scheduled: "primary",
  checked_in: "accent",
  completed: "green",
  cancelled: "gray",
  no_show: "red",
};

export function ProviderAppointmentCard({
  appointment,
  onSetStatus,
  onCancel,
}: {
  appointment: Appointment;
  onSetStatus: (id: number, status: AppointmentStatus) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
}) {
  const [pending, setPending] = useState<string | null>(null);

  /** Run a delegated action, tracking which button is in flight. */
  const run = async (key: string, action: () => Promise<void>) => {
    setPending(key);
    try {
      await action();
    } finally {
      setPending(null);
    }
  };

  const busy = pending !== null;
  const { id, status } = appointment;

  return (
    <Card
      radius="lg"
      padding="lg"
      className="border border-gray-200 !shadow transition-shadow hover:!shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-secondary">
            {appointment.patient_name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <MdCalendarMonth className="h-4 w-4 text-gray-400" />
            {dayjs(appointment.scheduled_at).format("MMM D, YYYY · h:mm A")}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <MdLocationOn className="h-4 w-4 text-gray-400" />
            {appointment.facility.name}
          </p>
        </div>
        <Badge color={STATUS_COLOR[status]} variant="light" radius="sm">
          {appointment.status_display}
        </Badge>
      </div>

      {appointment.reason && (
        <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-secondary">
          {appointment.reason}
        </p>
      )}

      {(status === "scheduled" || status === "checked_in") && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {status === "scheduled" && (
            <>
              <Button
                size="xs"
                color="accent"
                loading={pending === "checkin"}
                disabled={busy && pending !== "checkin"}
                onClick={() =>
                  run("checkin", () => onSetStatus(id, "checked_in"))
                }
              >
                Check in
              </Button>
              <Button
                size="xs"
                variant="light"
                color="red"
                loading={pending === "cancel"}
                disabled={busy && pending !== "cancel"}
                onClick={() => run("cancel", () => onCancel(id))}
              >
                Cancel
              </Button>
            </>
          )}
          {status === "checked_in" && (
            <>
              <Button
                size="xs"
                color="green"
                loading={pending === "complete"}
                disabled={busy && pending !== "complete"}
                onClick={() =>
                  run("complete", () => onSetStatus(id, "completed"))
                }
              >
                Complete
              </Button>
              <Button
                size="xs"
                variant="light"
                color="orange"
                loading={pending === "noshow"}
                disabled={busy && pending !== "noshow"}
                onClick={() => run("noshow", () => onSetStatus(id, "no_show"))}
              >
                No show
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
