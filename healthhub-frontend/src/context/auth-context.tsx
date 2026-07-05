"use client";

/**
 * React context exposing the authenticated user and auth actions to the app.
 *
 * On mount it bootstraps the session by calling `/auth/me` (the browser sends
 * the httpOnly cookie automatically). Components read state and actions via the
 * {@link useAuth} hook.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { authService } from "@/src/services/auth-service";
import type { RegisterPayload, User } from "@/src/types/auth";

interface AuthContextValue {
  /** The current user, or `null` when not authenticated. */
  user: User | null;
  /** True while the initial session check is in flight. */
  loading: boolean;
  /** Log in and store the resulting user. Throws on failure. */
  login: (email: string, password: string) => Promise<User>;
  /** Register a patient, then log them in. Throws on failure. */
  register: (payload: RegisterPayload) => Promise<User>;
  /** Log out and clear the local user. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Provides authentication state and actions to its subtree.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** Load (or clear) the current user from `/auth/me`. */
  const loadUser = useCallback(async () => {
    try {
      setUser(await authService.me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedIn } = await authService.login(email, password);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authService.register(payload);
      // Registration doesn't log the user in, so follow up with a login.
      const { user: loggedIn } = await authService.login(
        payload.email,
        payload.password
      );
      setUser(loggedIn);
      return loggedIn;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Access the auth context. Must be used within an {@link AuthProvider}.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return ctx;
}
