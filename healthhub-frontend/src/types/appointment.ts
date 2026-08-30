/** Types for the scheduling (appointments) domain. */

import type { Facility } from "@/src/types/directory";

export type AppointmentStatus =
  | "scheduled"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

/** An appointment as returned by the API (read shape). */
export interface Appointment {
  id: number;
  patient: number;
  patient_name: string;
  facility: Facility;
  referring_doctor: number | null;
  referring_doctor_name: string | null;
  scheduled_at: string;
  status: AppointmentStatus;
  status_display: string;
  reason: string;
  created_at: string;
}

/** Payload for booking an appointment. `patient` is only sent by staff. */
export interface BookAppointmentInput {
  facility: number;
  scheduled_at: string;
  reason?: string;
  patient?: number;
  referring_doctor?: number;
}
