"use client";

/**
 * Staff appointments page.
 *
 * Shows every appointment (the API returns all for staff), filterable by
 * status, and lets staff drive each one through its lifecycle (check-in,
 * complete, no-show, cancel) or book a new one on a patient's behalf. Mutations
 * call the service and then `refetch` to keep the list in sync.
 */

import { useState } from "react";
import { Button, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MdAdd } from "react-icons/md";

import { AsyncState } from "@/src/components/asyncState";
import { BookAppointmentModal } from "@/src/components/bookAppointmentModal";
import { ProviderAppointmentCard } from "@/src/components/providerAppointmentCard";
import { appointmentService } from "@/src/services/appointment";
import { useApi } from "@/src/hooks/useApi";
import type { AppointmentStatus } from "@/src/types/appointment";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "checked_in", label: "Checked in" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No show" },
];

export default function ProviderAppointmentsPage() {
  const { data, loading, error, refetch } = useApi(
    () => appointmentService.list(),
    [],
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpened, modal] = useDisclosure(false);

  const handleSetStatus = async (id: number, status: AppointmentStatus) => {
    await appointmentService.setStatus(id, status);
    await refetch();
  };

  const handleCancel = async (id: number) => {
    await appointmentService.cancel(id);
    await refetch();
  };

  const handleBooked = async () => {
    modal.close();
    await refetch();
  };

  const appointments = (data?.results ?? [])
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    );

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the schedule and check patients in.
          </p>
        </div>
        <Button
          color="primary"
          radius="md"
          leftSection={<MdAdd className="h-5 w-5" />}
          onClick={modal.open}
        >
          Book appointment
        </Button>
      </header>

      <Select
        data={STATUS_OPTIONS}
        value={statusFilter}
        onChange={(value) => setStatusFilter(value ?? "all")}
        radius="md"
        className="mb-6 max-w-[16rem]"
        aria-label="Filter by status"
      />

      <AsyncState loading={loading} error={error} onRetry={refetch} />

      {!loading && !error && appointments.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">No appointments match this filter.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {appointments.map((appointment) => (
          <ProviderAppointmentCard
            key={appointment.id}
            appointment={appointment}
            onSetStatus={handleSetStatus}
            onCancel={handleCancel}
          />
        ))}
      </div>

      <BookAppointmentModal
        opened={modalOpened}
        onClose={modal.close}
        onBooked={handleBooked}
      />
    </div>
  );
}
