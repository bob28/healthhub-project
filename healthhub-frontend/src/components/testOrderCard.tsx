"use client";

/**
 * Presentational card for a single lab test order.
 *
 * Shows the test, who ordered it, and its status. Once results are available it
 * renders each measured value in a table with a colour-coded flag so abnormal
 * results (low/high/critical) stand out; otherwise it shows a pending note.
 */

import dayjs from "dayjs";
import { Badge, Card, Table } from "@mantine/core";

import type { OrderStatus, ResultFlag, TestOrder } from "@/src/types/lab";

/** Mantine badge colour for each order status. */
const STATUS_COLOR: Record<OrderStatus, string> = {
  ordered: "gray",
  collected: "accent",
  in_progress: "yellow",
  resulted: "indigo",
  verified: "green",
  cancelled: "gray",
};

/** Mantine badge colour for each result flag; normal is green, abnormal warms. */
const FLAG_COLOR: Record<ResultFlag, string> = {
  normal: "green",
  low: "yellow",
  high: "orange",
  critical_low: "red",
  critical_high: "red",
};

export function TestOrderCard({ order }: { order: TestOrder }) {
  const result = order.result;

  return (
    <Card
      radius="lg"
      padding="lg"
      className="border border-gray-200 !shadow transition-shadow hover:!shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-secondary">
            {order.lab_test_name}
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {order.lab_test_code} · Ordered{" "}
            {dayjs(order.created_at).format("MMM D, YYYY")}
            {order.ordered_by_name && ` by ${order.ordered_by_name}`}
          </p>
        </div>
        <Badge color={STATUS_COLOR[order.status]} variant="light" radius="sm">
          {order.status_display}
        </Badge>
      </div>

      {result ? (
        <Table
          className="mt-4"
          verticalSpacing="sm"
          horizontalSpacing="md"
          highlightOnHover
          classNames={{
            th: "!text-xs !font-semibold !uppercase !tracking-wider !text-gray-400",
            tr: "rounded-lg",
            td: "first:rounded-l-lg last:rounded-r-lg",
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Analyte</Table.Th>
              <Table.Th>Value</Table.Th>
              <Table.Th>Reference</Table.Th>
              <Table.Th>Flag</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {result.values.map((value) => (
              <Table.Tr key={value.id}>
                <Table.Td className="text-secondary">
                  {value.analyte_name}
                </Table.Td>
                <Table.Td className="font-semibold text-secondary">
                  {value.value} {value.unit}
                </Table.Td>
                <Table.Td className="text-gray-400">
                  {value.reference_range}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={FLAG_COLOR[value.flag]}
                    variant="light"
                    radius="sm"
                    size="sm"
                  >
                    {value.flag_display}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Results are not available yet.
        </div>
      )}

      {result?.verified_by_name && (
        <p className="mt-4 text-xs text-gray-400">
          Verified by {result.verified_by_name}
        </p>
      )}
    </Card>
  );
}
