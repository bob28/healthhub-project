/**
 * Appointment API calls (list, book, reschedule, cancel).
 *
 * The backend scopes results by role: a patient sees only their own
 * appointments, while staff see all and may book on a patient's behalf. These
 * wrappers keep the scheduling URLs and payload shapes in one place.
 */

import type { Paginated } from "@/src/types/common";
import type {
  Appointment,
  AppointmentStatus,
  BookAppointmentInput,
} from "@/src/types/appointment";
import { apiFetch } from "@/src/services/apiClient";

export const appointmentService = {
  /** List appointments visible to the current user (most recent first). */
  list: () => apiFetch<Paginated<Appointment>>("/appointments/"),

  /** Book an appointment; a patient books for themselves, staff for a patient. */
  book: (input: BookAppointmentInput) =>
    apiFetch<Appointment>("/appointments/", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** Move an existing appointment to a new time. */
  reschedule: (id: number, scheduledAt: string) =>
    apiFetch<Appointment>(`/appointments/${id}/reschedule/`, {
      method: "POST",
      body: JSON.stringify({ scheduled_at: scheduledAt }),
    }),

  /** Cancel an appointment (owner patient or any staff member). */
  cancel: (id: number) =>
    apiFetch<Appointment>(`/appointments/${id}/cancel/`, {
      method: "POST",
    }),

  /** Apply a status change to an appointment (staff only). */
  setStatus: (id: number, status: AppointmentStatus) =>
    apiFetch<Appointment>(`/appointments/${id}/status/`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
};
