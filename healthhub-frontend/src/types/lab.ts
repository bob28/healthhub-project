/** Types for the lab workflow: test orders, results, and measured values. */

export type OrderStatus =
  | "ordered"
  | "collected"
  | "in_progress"
  | "resulted"
  | "verified"
  | "cancelled";

export type ResultFlag =
  | "normal"
  | "low"
  | "high"
  | "critical_low"
  | "critical_high";

/** One measured value with its analyte context and computed flag. */
export interface ResultValue {
  id: number;
  analyte: number;
  analyte_name: string;
  unit: string;
  reference_range: string;
  value: string;
  flag: ResultFlag;
  flag_display: string;
}

/** A result set for an order, with its measured values. */
export interface TestResult {
  id: number;
  status: string;
  status_display: string;
  performed_by_name: string | null;
  verified_by_name: string | null;
  resulted_at: string;
  notes: string;
  values: ResultValue[];
}

/** One measured value submitted when recording a result. */
export interface ResultValueInput {
  analyte: number;
  value: string;
}

/** Payload for recording a result against an order (staff action). */
export interface RecordResultInput {
  notes?: string;
  values: ResultValueInput[];
}

/** Payload for a doctor ordering a test for a patient. */
export interface OrderTestInput {
  patient: number;
  lab_test: number;
  appointment?: number;
  priority?: string;
}

/** A test ordered for a patient, including its result once available. */
export interface TestOrder {
  id: number;
  order_number: string;
  patient: number;
  patient_name: string;
  lab_test: number;
  lab_test_code: string;
  lab_test_name: string;
  appointment: number | null;
  ordered_by: number | null;
  ordered_by_name: string | null;
  collected_by_name: string | null;
  collected_at: string | null;
  priority: string;
  priority_display: string;
  status: OrderStatus;
  status_display: string;
  created_at: string;
  result: TestResult | null;
}
