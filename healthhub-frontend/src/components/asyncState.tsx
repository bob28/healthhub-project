"use client";

/**
 * Renders the loading and error states for a {@link useApi}-backed view.
 *
 * Returns a centered loader while `loading`, an error alert with an optional
 * retry when `error` is set, and `null` once the data is ready — so a page can
 * render this above its content and only show the real UI when there is data.
 */

import { Alert, Button, Center, Loader } from "@mantine/core";

export function AsyncState({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <Center className="py-16">
        <Loader color="primary" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" variant="light" title="Something went wrong">
        <p>{error}</p>
        {onRetry && (
          <Button
            variant="light"
            color="red"
            size="xs"
            className="!mt-3"
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Alert>
    );
  }

  return null;
}
