"use client";

/**
 * Patient dashboard: an at-a-glance overview of the things a patient cares
 * about — upcoming visits, how many results are in, anything flagged abnormal,
 * and tests still pending — derived from their appointments and lab orders.
 *
 * Staff are redirected to the provider dashboard; this view is patient-only.
 */

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Badge, Button, Card } from "@mantine/core";
import {
  MdCalendarMonth,
  MdChevronRight,
  MdLocationOn,
  MdOutlinePendingActions,
  MdOutlineWarningAmber,
} from "react-icons/md";
import { IoMdDocument } from "react-icons/io";

import { AsyncState } from "@/src/components/asyncState";
import { StatCard } from "@/src/components/statCard";
import { appointmentService } from "@/src/services/appointment";
import { labService } from "@/src/services/lab";
import { useApi } from "@/src/hooks/useApi";
import { useAuth } from "@/src/context/auth-context";
import type { PatientProfile } from "@/src/types/auth";
import type { TestOrder } from "@/src/types/lab";

/** Count the abnormal (non-normal) measured values within an order's result. */
function abnormalCount(order: TestOrder): number {
  return order.result?.values.filter((v) => v.flag !== "normal").length ?? 0;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Staff have their own dashboard; send them there if they land here.
  useEffect(() => {
    if (user && user.role !== "patient") {
      router.replace("/app/provider/dashboard");
    }
  }, [user, router]);

  // The route guard guarantees a user; render nothing while staff redirect.
  if (!user || user.role !== "patient") return null;

  const patient = user.profile as PatientProfile | null;

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
            Welcome back, {user.first_name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s your HealthHub overview.
          </p>
        </div>
        <Badge color="primary" size="lg" variant="light" radius="sm">
          {user.role}
        </Badge>
      </header>

      <PatientDashboard />

      {patient && (
        <Card
          radius="lg"
          padding="lg"
          className="mt-6 border border-gray-200 !shadow"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Profile
          </h2>
          <div className="mt-2 divide-y divide-gray-100">
            <ProfileRow label="Medical record #" value={patient.mrn} />
            <ProfileRow label="Date of birth" value={patient.date_of_birth} />
            <ProfileRow label="Sex" value={patient.sex} />
            <ProfileRow label="Email" value={user.email} />
            {user.phone && <ProfileRow label="Phone" value={user.phone} />}
          </div>
        </Card>
      )}
    </div>
  );
}

/** A labelled value row used in the profile summary. */
function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-secondary">{value}</span>
    </div>
  );
}

/** The metrics-driven body of the patient dashboard. */
function PatientDashboard() {
  const router = useRouter();
  const appts = useApi(() => appointmentService.list(), []);
  const orders = useApi(() => labService.listOrders(), []);

  const loading = appts.loading || orders.loading;
  const error = appts.error || orders.error;

  const reload = () => {
    appts.refetch();
    orders.refetch();
  };

  if (loading || error) {
    return <AsyncState loading={loading} error={error} onRetry={reload} />;
  }

  const appointments = appts.data?.results ?? [];
  const allOrders = orders.data?.results ?? [];
  const now = Date.now();

  const upcoming = appointments
    .filter(
      (a) =>
        a.status === "scheduled" && new Date(a.scheduled_at).getTime() >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    );
  const nextAppt = upcoming[0] ?? null;

  const resultsIn = allOrders.filter((o) => o.result).length;
  const flagged = allOrders.reduce((n, o) => n + abnormalCount(o), 0);
  const pending = allOrders.filter(
    (o) => !o.result && o.status !== "cancelled",
  ).length;
  const recentOrders = allOrders.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      {/* Headline metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          tone="lime"
          icon={<MdCalendarMonth className="h-6 w-6" />}
          value={upcoming.length}
          label="Upcoming visits"
        />
        <StatCard
          tone="cyan"
          icon={<IoMdDocument className="h-6 w-6" />}
          value={resultsIn}
          label="Results in"
        />
        <StatCard
          tone={flagged > 0 ? "amber" : "gray"}
          icon={<MdOutlineWarningAmber className="h-6 w-6" />}
          value={flagged}
          label="Flagged values"
        />
        <StatCard
          tone="gray"
          icon={<MdOutlinePendingActions className="h-6 w-6" />}
          value={pending}
          label="Pending tests"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Next appointment */}
        <Card
          radius="lg"
          padding="lg"
          className="border border-gray-200 !shadow lg:col-span-1"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Next appointment
          </h2>
          {nextAppt ? (
            <div className="mt-4">
              <p className="text-lg font-semibold text-secondary">
                {nextAppt.facility.name}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                <MdCalendarMonth className="h-4 w-4 text-gray-400" />
                {dayjs(nextAppt.scheduled_at).format("MMM D, YYYY · h:mm A")}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                <MdLocationOn className="h-4 w-4 text-gray-400" />
                {nextAppt.facility.address}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                You have no upcoming appointments.
              </p>
              <Button
                color="primary"
                radius="md"
                className="mt-4"
                onClick={() => router.push("/app/appointments")}
              >
                Book appointment
              </Button>
            </div>
          )}
        </Card>

        {/* Recent results */}
        <Card
          radius="lg"
          padding="lg"
          className="border border-gray-200 !shadow lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Recent results
            </h2>
            <Link
              href="/app/reports"
              className="flex items-center text-sm font-medium text-accent hover:underline"
            >
              View all
              <MdChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No test orders yet. Your doctor will order tests as needed.
            </p>
          ) : (
            <div className="mt-2 divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const abnormal = abnormalCount(order);
                return (
                  <Link
                    key={order.id}
                    href="/app/reports"
                    className="-mx-3 flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-secondary">
                        {order.lab_test_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {dayjs(order.created_at).format("MMM D, YYYY")}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {abnormal > 0 && (
                        <Badge
                          color="orange"
                          variant="light"
                          radius="sm"
                          size="sm"
                        >
                          {abnormal} flagged
                        </Badge>
                      )}
                      <Badge
                        color={order.result ? "green" : "gray"}
                        variant="light"
                        radius="sm"
                        size="sm"
                      >
                        {order.status_display}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
