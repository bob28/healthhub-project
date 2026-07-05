/**
 * Authentication API calls (login, register, current user, logout).
 *
 * These wrap {@link apiFetch} with typed request/response shapes and are the
 * only place the auth endpoints are referenced, so the auth context stays free
 * of URL and payload details.
 */

import type { LoginResponse, RegisterPayload, User } from "@/src/types/auth";
import { apiFetch } from "@/src/services/api-client";

export const authService = {
  /** Fetch the currently authenticated user (throws 401 if not logged in). */
  me: () => apiFetch<User>("/auth/me/"),

  /** Log in; the backend sets httpOnly cookies and returns the user. */
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /** Self-register a patient account. Does not log the user in. */
  register: (payload: RegisterPayload) =>
    apiFetch<User>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Log out; the backend clears the auth cookies. */
  logout: () => apiFetch<void>("/auth/logout/", { method: "POST" }),
};
