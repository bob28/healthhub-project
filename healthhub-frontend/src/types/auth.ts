/**
 * Shared types describing the shape of authentication data returned by the
 * HealthHub backend (`/api/auth/*`). These mirror the DRF serializers.
 */

/** The mutually exclusive roles a user account can hold. */
export type Role = "patient" | "doctor" | "nurse" | "technician" | "admin";

/** Profile fields returned for a patient user. */
export interface PatientProfile {
  mrn: string;
  date_of_birth: string;
  sex: string;
  address: string;
  primary_doctor: number | null;
}

/** Profile fields returned for a clinical staff user. */
export interface StaffProfile {
  employee_id: string;
  job_title: string;
  specialty: string;
  license_number: string;
  facility: number | null;
}

/**
 * The authenticated user as returned by `/auth/me` and the login response.
 * `profile` is the role-appropriate profile, or `null` (e.g. for admins).
 */
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: Role;
  phone: string;
  profile: PatientProfile | StaffProfile | null;
}

/** Response body from `POST /auth/login`. */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

/** Fields collected to self-register a patient. */
export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
}

/** True when the user is clinical staff (doctor, nurse, or technician). */
export function isClinicalStaff(user: User | null): boolean {
  return (
    !!user && ["doctor", "nurse", "technician"].includes(user.role)
  );
}
