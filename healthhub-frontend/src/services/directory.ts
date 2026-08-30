/**
 * Directory API calls (facilities and the lab-test catalog).
 *
 * These are read-only reference lists used to populate pickers when booking an
 * appointment or ordering a test. They wrap {@link apiFetch} with typed shapes
 * so callers never touch URLs or the pagination envelope directly.
 */

import type { Paginated } from "@/src/types/common";
import type { Facility, LabTest } from "@/src/types/directory";
import { apiFetch } from "@/src/services/apiClient";

export const directoryService = {
  /** List every facility a patient can book an appointment at. */
  listFacilities: () =>
    apiFetch<Paginated<Facility>>("/facilities/"),

  /** List the orderable lab tests, newest catalog first. */
  listLabTests: () => apiFetch<Paginated<LabTest>>("/lab-tests/"),

  /** Fetch a single lab test with its analytes (for result entry). */
  getLabTest: (id: number) => apiFetch<LabTest>(`/lab-tests/${id}/`),
};
