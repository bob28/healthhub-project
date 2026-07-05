"use client";

/**
 * Client-side route guard for the authenticated area (`/app/*`).
 *
 * While the session is being checked it shows a loader; once resolved, an
 * unauthenticated visitor is redirected to the login page and authenticated
 * users see the requested page.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";

import { useAuth } from "@/src/context/auth-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return <>{children}</>;
}
