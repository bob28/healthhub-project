"use client";
import { Button } from "@nextui-org/button";
export default function NotFoundPage() {
  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-start h-screen md:px-8">
        <div className="max-w-lg mx-auto space-y-3 text-center">
          <h3 className="text-primary font-semibold">404 Error</h3>
          <p className="text-secondary text-4xl font-semibold sm:text-5xl">
            Page not found
          </p>
          <p className="text-secondary">
            Sorry, the page you are looking for could not be found or has been
            removed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              color="primary"
              size="md"
              onClick={() => window.history.back()}
            >
              Go back{" "}
            </Button>
            <Button
              color="secondary"
              variant="bordered"
              size="md"
              onClick={() => window.location.replace("/")}
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
