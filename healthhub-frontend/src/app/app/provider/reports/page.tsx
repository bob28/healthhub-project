"use client";

/**
 * Staff results worklist ("Complete a Report").
 *
 * Lists test orders and lets staff move each through the pipeline — collect the
 * specimen, record measured values, and (doctors) verify — filterable by stage.
 * Doctors can also order a new test. Mutations call the service then `refetch`.
 */

import { useState } from "react";
import { Button, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MdAdd } from "react-icons/md";

import { AsyncState } from "@/src/components/asyncState";
import { OrderTestModal } from "@/src/components/orderTestModal";
import { ProviderOrderCard } from "@/src/components/providerOrderCard";
import { RecordResultModal } from "@/src/components/recordResultModal";
import { labService } from "@/src/services/lab";
import { useApi } from "@/src/hooks/useApi";
import { useAuth } from "@/src/context/auth-context";
import type { OrderStatus, TestOrder } from "@/src/types/lab";

const STAGE_OPTIONS = [
  { value: "action", label: "Needs action" },
  { value: "ordered", label: "To collect" },
  { value: "results", label: "To result" },
  { value: "resulted", label: "To verify" },
  { value: "verified", label: "Verified" },
  { value: "all", label: "All orders" },
];

/** Order statuses still awaiting some staff action. */
const ACTION_STATUSES: OrderStatus[] = [
  "ordered",
  "collected",
  "in_progress",
  "resulted",
];

/** Decide whether an order passes the selected stage filter. */
function matchesStage(order: TestOrder, stage: string): boolean {
  switch (stage) {
    case "action":
      return ACTION_STATUSES.includes(order.status);
    case "ordered":
      return order.status === "ordered";
    case "results":
      return order.status === "collected" || order.status === "in_progress";
    case "resulted":
      return order.status === "resulted";
    case "verified":
      return order.status === "verified";
    default:
      return true;
  }
}

export default function ProviderReportsPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";

  const { data, loading, error, refetch } = useApi(
    () => labService.listOrders(),
    [],
  );
  const [stage, setStage] = useState("action");
  const [recordOrder, setRecordOrder] = useState<TestOrder | null>(null);
  const [orderModalOpened, orderModal] = useDisclosure(false);

  const handleCollect = async (id: number) => {
    await labService.collect(id);
    await refetch();
  };

  const handleVerify = async (id: number) => {
    await labService.verify(id);
    await refetch();
  };

  const handleRecorded = async () => {
    setRecordOrder(null);
    await refetch();
  };

  const handleOrdered = async () => {
    orderModal.close();
    await refetch();
  };

  const orders = (data?.results ?? []).filter((o) => matchesStage(o, stage));

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
            Results worklist
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Collect specimens, record results, and verify reports.
          </p>
        </div>
        {isDoctor && (
          <Button
            color="primary"
            radius="md"
            leftSection={<MdAdd className="h-5 w-5" />}
            onClick={orderModal.open}
          >
            Order a test
          </Button>
        )}
      </header>

      <Select
        data={STAGE_OPTIONS}
        value={stage}
        onChange={(value) => setStage(value ?? "action")}
        allowDeselect={false}
        radius="md"
        className="mb-6 max-w-[16rem]"
        aria-label="Filter by stage"
      />

      <AsyncState loading={loading} error={error} onRetry={refetch} />

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">No orders in this stage.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <ProviderOrderCard
            key={order.id}
            order={order}
            isDoctor={!!isDoctor}
            onCollect={handleCollect}
            onRecord={setRecordOrder}
            onVerify={handleVerify}
          />
        ))}
      </div>

      {recordOrder && (
        <RecordResultModal
          order={recordOrder}
          onClose={() => setRecordOrder(null)}
          onRecorded={handleRecorded}
        />
      )}

      {isDoctor && (
        <OrderTestModal
          opened={orderModalOpened}
          onClose={orderModal.close}
          onOrdered={handleOrdered}
        />
      )}
    </div>
  );
}
