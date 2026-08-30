"use client";

/**
 * Modal for recording measured values against a test order (clinical staff).
 *
 * Loads the order's lab test to get its analytes, then renders one number input
 * per analyte (showing its reference range). On submit it posts the values; the
 * backend flags each against its reference range and marks the order resulted.
 */

import { useState } from "react";
import {
  Alert,
  Button,
  Center,
  Loader,
  Modal,
  NumberInput,
  Textarea,
} from "@mantine/core";

import { ApiError } from "@/src/services/apiClient";
import { directoryService } from "@/src/services/directory";
import { labService } from "@/src/services/lab";
import { useApi } from "@/src/hooks/useApi";
import type { TestOrder } from "@/src/types/lab";

export function RecordResultModal({
  order,
  onClose,
  onRecorded,
}: {
  order: TestOrder;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const { data: labTest, loading } = useApi(
    () => directoryService.getLabTest(order.lab_test),
    [order.lab_test],
  );

  const [values, setValues] = useState<Record<number, number | string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const analytes = labTest?.analytes ?? [];

  const setValue = (analyteId: number, value: number | string) => {
    setValues((current) => ({ ...current, [analyteId]: value }));
  };

  const handleSubmit = async () => {
    // Every analyte needs a value before we can submit the result.
    const errors: Record<number, string> = {};
    for (const analyte of analytes) {
      const value = values[analyte.id];
      if (value === undefined || value === "") {
        errors[analyte.id] = "Required";
      }
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await labService.recordResult(order.id, {
        notes: notes || undefined,
        values: analytes.map((analyte) => ({
          analyte: analyte.id,
          value: String(values[analyte.id]),
        })),
      });
      onRecorded();
    } catch (err) {
      if (err instanceof ApiError) {
        const { non_field_errors, detail } = err.fieldErrors();
        setFormError(non_field_errors ?? detail ?? err.message);
      } else {
        setFormError("Unable to reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Record results — ${order.lab_test_name}`}
      centered
    >
      {loading ? (
        <Center className="py-10">
          <Loader color="primary" />
        </Center>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            {order.order_number} · {order.patient_name}
          </p>

          {formError && (
            <Alert color="red" variant="light">
              {formError}
            </Alert>
          )}

          {analytes.map((analyte) => (
            <NumberInput
              key={analyte.id}
              label={`${analyte.name} (${analyte.unit})`}
              description={`Reference: ${analyte.reference_range}`}
              placeholder="Enter value"
              decimalScale={3}
              value={values[analyte.id] ?? ""}
              onChange={(value) => setValue(analyte.id, value)}
              error={fieldErrors[analyte.id]}
            />
          ))}

          <Textarea
            label="Notes"
            placeholder="Optional notes"
            autosize
            minRows={2}
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" loading={submitting} onClick={handleSubmit}>
              Save results
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
