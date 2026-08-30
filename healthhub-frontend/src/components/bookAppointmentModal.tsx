"use client";

/**
 * Modal form for booking an appointment.
 *
 * Loads the facility list for its picker, validates locally, and posts to the
 * scheduling API. Staff book on a patient's behalf, so for them an extra
 * (required) patient picker is shown; patients book for themselves and never
 * see it. Field-level validation errors from the backend are mapped back onto
 * the matching inputs; anything else surfaces as a form-level alert. On success
 * it resets and calls `onBooked` so the parent can refresh its list.
 */

import { useState } from "react";
import { Alert, Button, Modal, Select, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";

import { ApiError } from "@/src/services/apiClient";
import { appointmentService } from "@/src/services/appointment";
import { directoryService } from "@/src/services/directory";
import { patientService } from "@/src/services/patient";
import { useApi } from "@/src/hooks/useApi";
import { useAuth } from "@/src/context/auth-context";

/** Form shape; field names mirror the API so backend errors map directly. */
interface BookForm {
  patient: string;
  facility: string;
  scheduled_at: Date | null;
  reason: string;
}

export function BookAppointmentModal({
  opened,
  onClose,
  onBooked,
}: {
  opened: boolean;
  onClose: () => void;
  onBooked: () => void;
}) {
  const { user } = useAuth();
  const isStaff = !!user && user.role !== "patient";

  const { data: facilities, loading: loadingFacilities } = useApi(
    () => directoryService.listFacilities(),
    [],
  );
  // Only staff book for a patient, so only they need the patient list.
  const { data: patients, loading: loadingPatients } = useApi(
    () => (isStaff ? patientService.list() : Promise.resolve(null)),
    [isStaff],
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<BookForm>({
    initialValues: { patient: "", facility: "", scheduled_at: null, reason: "" },
    validate: {
      patient: (value) =>
        isStaff && !value ? "Select a patient." : null,
      facility: (value) => (value ? null : "Select a facility."),
      scheduled_at: (value) => (value ? null : "Choose a date and time."),
    },
  });

  const facilityOptions =
    facilities?.results.map((facility) => ({
      value: String(facility.id),
      label: facility.name,
    })) ?? [];

  const patientOptions =
    patients?.results.map((patient) => ({
      value: String(patient.id),
      label: `${patient.full_name}${patient.mrn ? ` · ${patient.mrn}` : ""}`,
    })) ?? [];

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await appointmentService.book({
        facility: Number(values.facility),
        scheduled_at: values.scheduled_at!.toISOString(),
        reason: values.reason || undefined,
        patient: isStaff ? Number(values.patient) : undefined,
      });
      form.reset();
      onBooked();
    } catch (err) {
      if (err instanceof ApiError) {
        const { non_field_errors, detail, ...fieldErrors } = err.fieldErrors();
        form.setErrors(fieldErrors);
        if (non_field_errors || detail) {
          setFormError(non_field_errors ?? detail);
        } else if (Object.keys(fieldErrors).length === 0) {
          setFormError(err.message);
        }
      } else {
        setFormError("Unable to reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Book an appointment" centered>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && (
          <Alert color="red" variant="light">
            {formError}
          </Alert>
        )}

        {isStaff && (
          <Select
            label="Patient"
            placeholder={loadingPatients ? "Loading…" : "Choose a patient"}
            data={patientOptions}
            disabled={loadingPatients}
            searchable
            {...form.getInputProps("patient")}
          />
        )}

        <Select
          label="Facility"
          placeholder={loadingFacilities ? "Loading…" : "Choose a facility"}
          data={facilityOptions}
          disabled={loadingFacilities}
          searchable
          {...form.getInputProps("facility")}
        />

        <DateTimePicker
          label="Date and time"
          placeholder="Pick a date and time"
          minDate={new Date()}
          valueFormat="MMM D, YYYY · h:mm A"
          {...form.getInputProps("scheduled_at")}
        />

        <Textarea
          label="Reason"
          placeholder="Reason for the visit (optional)"
          autosize
          minRows={2}
          {...form.getInputProps("reason")}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" color="primary" loading={submitting}>
            Book
          </Button>
        </div>
      </form>
    </Modal>
  );
}
