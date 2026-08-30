"use client";

/**
 * A single headline metric: a coloured icon chip beside a big number and label.
 * Shared by the patient and provider dashboards.
 */

import { Card } from "@mantine/core";

/**
 * Soft icon-chip palettes. Brand hex vars don't support Tailwind opacity
 * modifiers, so these use the standard palette tints.
 */
const TONES = {
  lime: "bg-lime-100 text-lime-700",
  cyan: "bg-cyan-100 text-cyan-700",
  amber: "bg-amber-100 text-amber-700",
  indigo: "bg-indigo-100 text-indigo-700",
  gray: "bg-gray-100 text-gray-500",
} as const;

/** The available icon-chip tones. */
export type StatTone = keyof typeof TONES;

export function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: StatTone;
}) {
  return (
    <Card radius="lg" padding="lg" className="border border-gray-200 !shadow">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold leading-none text-secondary">
            {value}
          </p>
          <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
            {label}
          </p>
        </div>
      </div>
    </Card>
  );
}
