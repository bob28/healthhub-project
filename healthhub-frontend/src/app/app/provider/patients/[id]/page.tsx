"use client";

/**
 * Staff patient detail: a patient's identifying info and their test orders.
 *
 * Loads the patient record and their orders (scoped with `?patient=`), reusing
 * the shared TestOrderCard so results render exactly as the patient sees them.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@mantine/core";
import { MdArrowBack } from "react-icons/md";

import { AsyncState } from "@/src/components/asyncState";
import { TestOrderCard } from "@/src/components/testOrderCard";
import { patientService } from "@/src/services/patient";
import { labService } from "@/src/services/lab";
import { useApi } from "@/src/hooks/useApi";

/** A labelled field in the patient info card. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-secondary">{value}</p>
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const patient = useApi(() => patientService.get(id), [id]);
  const orders = useApi(() => labService.listOrders({ patient: id }), [id]);

  const loading = patient.loading || orders.loading;
  const error = patient.error || orders.error;
  const reload = () => {
    patient.refetch();
    orders.refetch();
  };

  const record = patient.data;
  const orderList = orders.data?.results ?? [];

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <Link
        href="/app/provider/patients"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-secondary"
      >
        <MdArrowBack className="h-4 w-4" />
        All patients
      </Link>

      {loading || error ? (
        <AsyncState loading={loading} error={error} onRetry={reload} />
      ) : record ? (
        <>
          <Card
            radius="lg"
            padding="lg"
            className="border border-gray-200 !shadow"
          >
            <h1 className="text-2xl font-bold tracking-tight text-secondary">
              {record.full_name}
            </h1>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Medical record #" value={record.mrn ?? "—"} />
              <Field
                label="Date of birth"
                value={record.date_of_birth ?? "—"}
              />
              <Field label="Sex" value={record.sex ?? "—"} />
              <Field label="Email" value={record.email} />
              <Field label="Phone" value={record.phone || "—"} />
            </div>
          </Card>

          <h2 className="mb-4 mt-8 text-lg font-semibold text-secondary">
            Test orders
          </h2>
          {orderList.length === 0 ? (
            <p className="text-sm text-gray-500">
              This patient has no test orders yet.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {orderList.map((order) => (
                <TestOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
