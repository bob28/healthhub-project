"use client";

/**
 * Staff worklist card for a single test order.
 *
 * Shows the order and surfaces the one action available at its current stage:
 * collect the specimen, record results, or (doctors only) verify. Collect and
 * verify are called inline; "Record results" is delegated to the parent, which
 * owns the result-entry modal. Verified orders show a short result summary.
 */

import { useState } from "react";
import dayjs from "dayjs";
import { Badge, Button, Card } from "@mantine/core";
import { MdCheckCircle } from "react-icons/md";

import type { OrderStatus, TestOrder } from "@/src/types/lab";

/** Mantine badge colour for each order status. */
const STATUS_COLOR: Record<OrderStatus, string> = {
  ordered: "orange",
  collected: "cyan",
  in_progress: "cyan",
  resulted: "indigo",
  verified: "green",
  cancelled: "gray",
};

export function ProviderOrderCard({
  order,
  isDoctor,
  onCollect,
  onRecord,
  onVerify,
}: {
  order: TestOrder;
  isDoctor: boolean;
  onCollect: (id: number) => Promise<void>;
  onRecord: (order: TestOrder) => void;
  onVerify: (id: number) => Promise<void>;
}) {
  const [pending, setPending] = useState<string | null>(null);

  const run = async (key: string, action: () => Promise<void>) => {
    setPending(key);
    try {
      await action();
    } finally {
      setPending(null);
    }
  };

  const flagged =
    order.result?.values.filter((v) => v.flag !== "normal").length ?? 0;

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
            {order.order_number} · {order.patient_name} ·{" "}
            {dayjs(order.created_at).format("MMM D, YYYY")}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {order.priority === "stat" && (
            <Badge color="red" variant="filled" radius="sm">
              STAT
            </Badge>
          )}
          <Badge color={STATUS_COLOR[order.status]} variant="light" radius="sm">
            {order.status_display}
          </Badge>
        </div>
      </div>

      {order.result && (
        <p className="mt-3 text-sm text-gray-500">
          {order.result.values.length} value
          {order.result.values.length === 1 ? "" : "s"} recorded
          {flagged > 0 && (
            <span className="font-medium text-orange-600"> · {flagged} flagged</span>
          )}
        </p>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        {order.status === "ordered" && (
          <Button
            size="xs"
            color="accent"
            loading={pending === "collect"}
            onClick={() => run("collect", () => onCollect(order.id))}
          >
            Collect specimen
          </Button>
        )}

        {(order.status === "collected" || order.status === "in_progress") && (
          <Button size="xs" color="primary" onClick={() => onRecord(order)}>
            Record results
          </Button>
        )}

        {order.status === "resulted" &&
          (isDoctor ? (
            <Button
              size="xs"
              color="green"
              loading={pending === "verify"}
              onClick={() => run("verify", () => onVerify(order.id))}
            >
              Verify
            </Button>
          ) : (
            <span className="text-sm text-gray-400">
              Awaiting doctor verification
            </span>
          ))}

        {order.status === "verified" && (
          <span className="flex items-center gap-1 text-sm font-medium text-green-600">
            <MdCheckCircle className="h-4 w-4" />
            Verified
          </span>
        )}
      </div>
    </Card>
  );
}
