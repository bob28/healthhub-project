"use client";

import { Badge, Card } from "@mantine/core";

import { Sidebar } from "@/src/components/sidebar";
import { useAuth } from "@/src/context/auth-context";
import type { PatientProfile, StaffProfile } from "@/src/types/auth";

/** A labelled value tile shown on the dashboard. */
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card withBorder radius="md" padding="lg">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <p className="mt-1 text-lg font-semibold text-secondary">{value}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  // The route guard guarantees a user here, but keep TypeScript happy.
  if (!user) return null;

  const isPatient = user.role === "patient";
  const patient = isPatient ? (user.profile as PatientProfile | null) : null;
  const staff = !isPatient ? (user.profile as StaffProfile | null) : null;

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className="w-full sm:w-96">
        <Sidebar />
      </div>

      <div className="w-full text-secondary overflow-y-auto">
        <div className="p-6 sm:p-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-secondary">
                Welcome back, {user.first_name}
              </h1>
              <p className="text-gray-500">Here&apos;s your HealthHub overview.</p>
            </div>
            <Badge color="primary" size="lg" variant="light">
              {user.role}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard label="Name" value={user.full_name} />
            <InfoCard label="Email" value={user.email} />

            {patient && (
              <>
                <InfoCard label="Medical Record #" value={patient.mrn} />
                <InfoCard label="Date of Birth" value={patient.date_of_birth} />
                <InfoCard label="Sex" value={patient.sex} />
              </>
            )}

            {staff && (
              <>
                <InfoCard label="Employee ID" value={staff.employee_id} />
                <InfoCard label="Job Title" value={staff.job_title || "—"} />
                <InfoCard label="Specialty" value={staff.specialty || "—"} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
