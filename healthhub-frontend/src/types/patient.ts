/** Types for the staff-facing patient directory. */

/**
 * A patient as returned by the staff directory (`/patients/`), with the key
 * profile fields flattened onto the user for search and identification.
 */
export interface Patient {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  mrn: string | null;
  date_of_birth: string | null;
  sex: string | null;
}
