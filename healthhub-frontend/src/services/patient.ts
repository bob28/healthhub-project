/**
 * Patient directory API calls (staff-only).
 *
 * Backs the clinical staff patient lookup: a searchable list plus single-record
 * retrieval. Wraps {@link apiFetch} with typed shapes so callers never touch the
 * URL or pagination envelope.
 */

import type { Paginated } from "@/src/types/common";
import type { Patient } from "@/src/types/patient";
import { apiFetch } from "@/src/services/apiClient";

export const patientService = {
  /** List patients, optionally filtered by a free-text `?search=` query. */
  list: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiFetch<Paginated<Patient>>(`/patients/${query}`);
  },

  /** Fetch a single patient by id. */
  get: (id: number) => apiFetch<Patient>(`/patients/${id}/`),
};
