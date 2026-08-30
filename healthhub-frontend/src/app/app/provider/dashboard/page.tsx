"use client";

/**
 * Provider (clinical staff) dashboard: the day's workload at a glance —
 * today's appointments and where every open test order sits in the pipeline
 * (awaiting collection, results, or verification) — plus a link through to the
 * schedule and the results worklist.
 */

import Link from "next/link";
import dayjs from "dayjs";
import { Badge, Card } from "@mantine/core";
import {
  MdCalendarMonth,
  MdChevronRight,
  MdOutlineScience,
  MdOutlineVerified,
  MdOutlineColorize,
  MdPeople,
} from "react-icons/md";

import { AsyncState } from "@/src/components/asyncState";
import { StatCard } from "@/src/components/statCard";
import { appointmentService } from "@/src/services/appointment";
import { labService } from "@/src/services/lab";
import { patientService } from "@/src/services/patient";
import { useApi } from "@/src/hooks/useApi";
import { useAuth } from "@/src/context/auth-context";
import type { OrderStatus, TestOrder } from "@/src/types/lab";

/** Order statuses that still need staff action, with their worklist label. */
const STAGE_LABEL: Partial<Record<OrderStatus, string>> = {
  ordered: "To collect",
  collected: "To result",
  in_progress: "To result",
  resulted: "To verify",
};

const STAGE_COLOR: Partial<Record<OrderStatus, string>> = {
  ordered: "orange",
  collected: "cyan",
  in_progress: "cyan",
  resulted: "indigo",
};

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const appts = useApi(() => appointmentService.list(), []);
  const orders = useApi(() => labService.listOrders(), []);
  const patients = useApi(() => patientService.list(), []);

  if (!user) return null;

  const loading = appts.loading || orders.loading || patients.loading;
  const error = appts.error || orders.error || patients.error;

  const reload = () => {
    appts.refetch();
    orders.refetch();
    patients.refetch();
  };

  const appointments = appts.data?.results ?? [];
  const allOrders = orders.data?.results ?? [];

  const today = dayjs();
  const todaysAppts = appointments
    .filter(
      (a) =>
        dayjs(a.scheduled_at).isSame(today, "day") &&
        (a.status === "scheduled" || a.status === "checked_in"),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    );

  const byStatus = (s: OrderStatus) => allOrders.filter((o) => o.status === s);
  const toCollect = byStatus("ordered").length;
  const toResult =
    byStatus("collected").length + byStatus("in_progress").length;
  const toVerify = byStatus("resulted").length;

  const worklist: TestOrder[] = allOrders
    .filter((o) => o.status in STAGE_LABEL)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
            Welcome back, {user.first_name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s your clinical workload for today.
          </p>
        </div>
        <Badge color="accent" size="lg" variant="light" radius="sm">
          {user.role}
        </Badge>
      </header>

      {loading || error ? (
        <AsyncState loading={loading} error={error} onRetry={reload} />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Workload metrics */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard
              tone="lime"
              icon={<MdCalendarMonth className="h-6 w-6" />}
              value={todaysAppts.length}
              label="Today's visits"
            />
            <StatCard
              tone="amber"
              icon={<MdOutlineColorize className="h-6 w-6" />}
              value={toCollect}
              label="To collect"
            />
            <StatCard
              tone="cyan"
              icon={<MdOutlineScience className="h-6 w-6" />}
              value={toResult}
              label="To result"
            />
            <StatCard
              tone="indigo"
              icon={<MdOutlineVerified className="h-6 w-6" />}
              value={toVerify}
              label="To verify"
            />
            <StatCard
              tone="gray"
              icon={<MdPeople className="h-6 w-6" />}
              value={patients.data?.count ?? 0}
              label="Patients"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Today's schedule */}
            <Card
              radius="lg"
              padding="lg"
              className="border border-gray-200 !shadow"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Today&apos;s schedule
                </h2>
                <Link
                  href="/app/provider/appointments"
                  className="flex items-center text-sm font-medium text-accent hover:underline"
                >
                  View all
                  <MdChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {todaysAppts.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No appointments scheduled for today.
                </p>
              ) : (
                <div className="mt-2 divide-y divide-gray-100">
                  {todaysAppts.slice(0, 6).map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-secondary">
                          {appt.patient_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {appt.facility.name}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {dayjs(appt.scheduled_at).format("h:mm A")}
                        </span>
                        <Badge
                          color={
                            appt.status === "checked_in" ? "accent" : "primary"
                          }
                          variant="light"
                          radius="sm"
                          size="sm"
                        >
                          {appt.status_display}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Results worklist */}
            <Card
              radius="lg"
              padding="lg"
              className="border border-gray-200 !shadow"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Results worklist
                </h2>
                <Link
                  href="/app/provider/reports"
                  className="flex items-center text-sm font-medium text-accent hover:underline"
                >
                  Open worklist
                  <MdChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {worklist.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  Nothing waiting — every order is up to date.
                </p>
              ) : (
                <div className="mt-2 divide-y divide-gray-100">
                  {worklist.map((order) => (
                    <Link
                      key={order.id}
                      href="/app/provider/reports"
                      className="-mx-3 flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-secondary">
                          {order.lab_test_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.patient_name}
                        </p>
                      </div>
                      <Badge
                        color={STAGE_COLOR[order.status] ?? "gray"}
                        variant="light"
                        radius="sm"
                        size="sm"
                      >
                        {STAGE_LABEL[order.status]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
