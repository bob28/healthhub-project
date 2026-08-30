/**
 * Lab API calls (test orders and their results).
 *
 * Patients read their own orders; clinical staff drive the workflow — order a
 * test (doctor), record specimen collection, record measured values, and verify
 * the result (doctor). These wrappers keep the lab URLs and payloads in one
 * place; the backend enforces which role may call each action.
 */

import type { Paginated } from "@/src/types/common";
import type {
  OrderStatus,
  OrderTestInput,
  RecordResultInput,
  TestOrder,
  TestResult,
} from "@/src/types/lab";
import { apiFetch } from "@/src/services/apiClient";

/** Optional query filters for listing orders. */
interface OrderFilters {
  status?: OrderStatus;
  patient?: number;
}

export const labService = {
  /** List test orders, optionally filtered by `status` and/or `patient`. */
  listOrders: (filters?: OrderFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.patient) params.set("patient", String(filters.patient));
    const query = params.toString();
    return apiFetch<Paginated<TestOrder>>(
      `/orders/${query ? `?${query}` : ""}`,
    );
  },

  /** Fetch a single test order (including its result, if available). */
  getOrder: (id: number) => apiFetch<TestOrder>(`/orders/${id}/`),

  /** Order a test for a patient (doctor only). */
  createOrder: (input: OrderTestInput) =>
    apiFetch<TestOrder>("/orders/", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** Record specimen collection for an order (clinical staff). */
  collect: (id: number) =>
    apiFetch<TestOrder>(`/orders/${id}/collect/`, { method: "POST" }),

  /** Record measured values against an order (clinical staff). */
  recordResult: (id: number, input: RecordResultInput) =>
    apiFetch<TestResult>(`/orders/${id}/result/`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** Verify an order's result, finalizing it for the patient (doctor only). */
  verify: (id: number) =>
    apiFetch<TestResult>(`/orders/${id}/verify/`, { method: "POST" }),
};
