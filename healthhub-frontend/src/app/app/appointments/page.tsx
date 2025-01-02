import { Sidebar } from "@/src/components/sidebar";

import { Container } from "@mantine/core";

export default function DashboardPage() {
  const fakeAppointments = [
    {
      confirmationId: 1,
      dateTime: new Date("2022-01-01T10:00:00").toLocaleString(),
      location: "123 Main St.",
      locationId: 1,
      doctor: "Dr. Smith",
      doctorId: 1,
    },
    {
      dateTime: new Date("2022-01-02T11:00:00").toLocaleString(),
      location: "456 Elm St.",
      provider: "Dr. Johnson",
    },
    {
      dateTime: new Date("2022-01-03T12:00:00").toLocaleString(),
      location: "789 Oak St.",
      provider: "Dr. Williams",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className="w-full sm:w-96">
        <Sidebar />
      </div>
      <div className="w-full text-secondary">
        <div className="p-10">
          <h1 className="text-3xl font-semibold">My Appointments</h1>
        </div>
      </div>
    </div>
  );
}
