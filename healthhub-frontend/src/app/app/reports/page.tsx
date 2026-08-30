"use client";

/**
 * Patient/staff reports page.
 *
 * Lists the test orders the current user can see (scoped by the API), each with
 * its status and — once available — the measured results and their flags. Data
 * loads through `useApi`; this view is read-only for patients.
 */

import { AsyncState } from "@/src/components/asyncState";
import { TestOrderCard } from "@/src/components/testOrderCard";
import { labService } from "@/src/services/lab";
import { useApi } from "@/src/hooks/useApi";

export default function ReportsPage() {
  const { data, loading, error, refetch } = useApi(
    () => labService.listOrders(),
    [],
  );

  const orders = data?.results ?? [];

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
          My Test Results
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your lab orders and results, most recent first.
        </p>
      </header>

      <AsyncState loading={loading} error={error} onRetry={refetch} />

      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-500">
          You have no test orders yet. Your doctor will order tests as needed.
        </p>
      )}

      <div className="flex flex-col gap-5">
        {orders.map((order) => (
          <TestOrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
