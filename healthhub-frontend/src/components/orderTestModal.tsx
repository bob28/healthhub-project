"use client";

/**
 * Modal for a doctor to order a test for a patient.
 *
 * Loads the patient directory and the lab-test catalog for its pickers, then
 * posts a new order. Field-level backend errors map onto the inputs; anything
 * else surfaces as a form-level alert. On success it resets and calls
 * `onOrdered` so the parent can refresh its worklist.
 */

import { useState } from "react";
import { Alert, Button, Modal, Select } from "@mantine/core";
import { useForm } from "@mantine/form";

import { ApiError } from "@/src/services/apiClient";
import { directoryService } from "@/src/services/directory";
import { labService } from "@/src/services/lab";
import { patientService } from "@/src/services/patient";
import { useApi } from "@/src/hooks/useApi";

const PRIORITY_OPTIONS = [
  { value: "routine", label: "Routine" },
  { value: "stat", label: "STAT" },
];

/** Form shape; field names mirror the API so backend errors map directly. */
interface OrderForm {
  patient: string;
  lab_test: string;
  priority: string;
}

export function OrderTestModal({
  opened,
  onClose,
  onOrdered,
}: {
  opened: boolean;
  onClose: () => void;
  onOrdered: () => void;
}) {
  const { data: patients, loading: loadingPatients } = useApi(
    () => patientService.list(),
    [],
  );
  const { data: labTests, loading: loadingLabTests } = useApi(
    () => directoryService.listLabTests(),
    [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<OrderForm>({
    initialValues: { patient: "", lab_test: "", priority: "routine" },
    validate: {
      patient: (value) => (value ? null : "Select a patient."),
      lab_test: (value) => (value ? null : "Select a test."),
    },
  });

  const patientOptions =
    patients?.results.map((patient) => ({
      value: String(patient.id),
      label: `${patient.full_name}${patient.mrn ? ` · ${patient.mrn}` : ""}`,
    })) ?? [];

  const labTestOptions =
    labTests?.results.map((test) => ({
      value: String(test.id),
      label: `${test.name} (${test.code})`,
    })) ?? [];

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await labService.createOrder({
        patient: Number(values.patient),
        lab_test: Number(values.lab_test),
        priority: values.priority,
      });
      form.reset();
      onOrdered();
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
    <Modal opened={opened} onClose={onClose} title="Order a test" centered>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && (
          <Alert color="red" variant="light">
            {formError}
          </Alert>
        )}

        <Select
          label="Patient"
          placeholder={loadingPatients ? "Loading…" : "Choose a patient"}
          data={patientOptions}
          disabled={loadingPatients}
          searchable
          {...form.getInputProps("patient")}
        />

        <Select
          label="Test"
          placeholder={loadingLabTests ? "Loading…" : "Choose a test"}
          data={labTestOptions}
          disabled={loadingLabTests}
          searchable
          {...form.getInputProps("lab_test")}
        />

        <Select
          label="Priority"
          data={PRIORITY_OPTIONS}
          allowDeselect={false}
          {...form.getInputProps("priority")}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" color="primary" loading={submitting}>
            Order test
          </Button>
        </div>
      </form>
    </Modal>
  );
}
