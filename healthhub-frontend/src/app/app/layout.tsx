"use client";

/**
 * Shell and route guard for the authenticated area (`/app/*`).
 *
 * While the session is being checked it shows a loader; once resolved, an
 * unauthenticated visitor is redirected to the login page. Authenticated users
 * get the persistent sidebar plus a scrollable content region into which each
 * page renders — so individual pages no longer repeat the layout chrome.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";

import { Sidebar } from "@/src/components/sidebar";
import { useAuth } from "@/src/context/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <Center h="100vh">
        <Loader color="primary" />
      </Center>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 sm:flex-row">
      <div className="w-full sm:w-72">
        <Sidebar />
      </div>
      <main className="w-full overflow-y-auto text-secondary">{children}</main>
    </div>
  );
}
