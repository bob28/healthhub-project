/** Types for the clinical directory: facilities and the test catalog. */

/** A hospital, clinic, or lab. */
export interface Facility {
  id: number;
  name: string;
  facility_type: string;
  facility_type_display: string;
  address: string;
  phone: string;
}

/** A single measured component of a lab test, with its reference range. */
export interface TestAnalyte {
  id: number;
  name: string;
  unit: string;
  ref_low: string | null;
  ref_high: string | null;
  reference_range: string;
  display_order: number;
}

/** A catalog (orderable) lab test with its analytes. */
export interface LabTest {
  id: number;
  code: string;
  name: string;
  category: string;
  category_display: string;
  specimen_type: string;
  specimen_type_display: string;
  description: string;
  prep_instructions: string;
  turnaround_hours: number;
  price: string;
  is_active: boolean;
  analytes: TestAnalyte[];
}
