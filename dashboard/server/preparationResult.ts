// What the preparation start command reported. This module is the only reader
// of `preparation-assignment.mjs start`'s one-line JSON result
// (`readPreparationResult`); `./preparationStart.ts` runs the command.

import { z } from "zod";

// An announced start carries the published commit; a continued one (the
// workspace already held the assignment) does not.
export type PreparationResult =
  | {
      readonly kind: "established";
      readonly agent: string;
      readonly publishedSha?: string;
    }
  | {
      readonly kind: "stopped";
      readonly status: string;
      readonly error?: string;
    }
  | { readonly kind: "unreadable" };

const establishedSchema = z.looseObject({
  ok: z.literal(true),
  status: z.enum(["announced", "continued"]),
  agent: z.string().min(1),
  publishedSha: z.string().min(1).optional(),
});

const stoppedSchema = z.looseObject({
  ok: z.literal(false),
  status: z.string().min(1),
  error: z.string().optional(),
});

// The command's stdout, as the typed result; output without JSON, or with
// JSON of another shape, is unreadable.
export function readPreparationResult(stdout: string): PreparationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout.trim().split("\n").at(-1) ?? "");
  } catch {
    return { kind: "unreadable" };
  }
  const established = establishedSchema.safeParse(parsed);
  if (established.success) {
    const { agent, publishedSha } = established.data;
    return {
      kind: "established",
      agent,
      ...(publishedSha === undefined ? {} : { publishedSha }),
    };
  }
  const stopped = stoppedSchema.safeParse(parsed);
  return stopped.success
    ? {
        kind: "stopped",
        status: stopped.data.status,
        ...(stopped.data.error === undefined
          ? {}
          : { error: stopped.data.error }),
      }
    : { kind: "unreadable" };
}

// The card's answer for a start that did not establish. Every stop is worded
// alike for now.
export function preparationRefusal(
  result: Exclude<PreparationResult, { kind: "established" }>,
): string {
  const reason =
    result.kind === "stopped"
      ? `The preparation start stopped (${result.status})${result.error ? `: ${result.error}` : ""}.`
      : "The preparation start gave no result this dashboard could read.";
  return `${reason} Nothing was launched.`;
}
