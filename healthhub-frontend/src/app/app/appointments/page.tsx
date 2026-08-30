"use client";

/**
 * Patient/staff appointments page.
 *
 * Lists the appointments the current user can see (scoped by the API), and lets
 * them book a new one or cancel an upcoming one. Data loads through `useApi`;
 * mutations call the service and then `refetch` to keep the list in sync.
 */

import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MdAdd } from "react-icons/md";

import { AppointmentCard } from "@/src/components/appointmentCard";
import { AsyncState } from "@/src/components/asyncState";
import { BookAppointmentModal } from "@/src/components/bookAppointmentModal";
import { appointmentService } from "@/src/services/appointment";
import { useApi } from "@/src/hooks/useApi";

export default function AppointmentsPage() {
  const { data, loading, error, refetch } = useApi(
    () => appointmentService.list(),
    [],
  );
  const [modalOpened, modal] = useDisclosure(false);

  /** Cancel an appointment, then refresh the list to reflect the new status. */
  const handleCancel = async (id: number) => {
    await appointmentService.cancel(id);
    await refetch();
  };

  /** After a successful booking, close the modal and reload the list. */
  const handleBooked = async () => {
    modal.close();
    await refetch();
  };

  const appointments = data?.results ?? [];

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
            My Appointments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View, book, and manage your upcoming visits.
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

      <AsyncState loading={loading} error={error} onRetry={refetch} />

      {!loading && !error && appointments.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">
            You have no appointments yet. Book one to get started.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
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
