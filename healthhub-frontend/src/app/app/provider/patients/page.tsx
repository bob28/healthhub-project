"use client";

/**
 * Staff patient directory: a searchable table of patients.
 *
 * The search box is debounced and drives the backend `?search=` query (name,
 * email, or MRN). Clicking a row opens that patient's detail page.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, TextInput } from "@mantine/core";
import { MdChevronRight, MdSearch } from "react-icons/md";

import { AsyncState } from "@/src/components/asyncState";
import { patientService } from "@/src/services/patient";
import { useApi } from "@/src/hooks/useApi";

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useApi(
    () => patientService.list(query),
    [query],
  );

  const patients = data?.results ?? [];

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
          Patients
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Search by name, email, or medical record number.
        </p>
      </header>

      <TextInput
        placeholder="Search patients…"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        leftSection={<MdSearch className="h-5 w-5" />}
        radius="md"
        size="md"
        className="mb-6 max-w-md"
      />

      <AsyncState loading={loading} error={error} onRetry={refetch} />

      {!loading && !error && (
        <Card
          radius="lg"
          padding={0}
          className="overflow-hidden border border-gray-200 !shadow"
        >
          {patients.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No patients found.</p>
          ) : (
            <Table
              verticalSpacing="md"
              horizontalSpacing="lg"
              highlightOnHover
              classNames={{
                th: "!text-xs !font-semibold !uppercase !tracking-wider !text-gray-400",
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Patient</Table.Th>
                  <Table.Th>MRN</Table.Th>
                  <Table.Th>Date of birth</Table.Th>
                  <Table.Th>Sex</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {patients.map((patient) => (
                  <Table.Tr
                    key={patient.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/app/provider/patients/${patient.id}`)
                    }
                  >
                    <Table.Td>
                      <p className="font-medium text-secondary">
                        {patient.full_name}
                      </p>
                      <p className="text-xs text-gray-400">{patient.email}</p>
                    </Table.Td>
                    <Table.Td className="text-gray-500">
                      {patient.mrn ?? "—"}
                    </Table.Td>
                    <Table.Td className="text-gray-500">
                      {patient.date_of_birth ?? "—"}
                    </Table.Td>
                    <Table.Td className="capitalize text-gray-500">
                      {patient.sex ?? "—"}
                    </Table.Td>
                    <Table.Td>
                      <MdChevronRight className="h-5 w-5 text-gray-300" />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}
