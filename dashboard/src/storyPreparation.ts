// Typed projection of shared story-state facts for overview cards. The shared
// reader owns meaning; this only checks the shape the dashboard shows and maps
// it to labels. Loading is observation, never a lifecycle state.

import { z } from "zod";
import { readStoryState } from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { ReadProblem } from "./readProblem";

const approachSchema = z.union([
  z.object({ kind: z.literal("unselected") }),
  z.object({ kind: z.literal("planned"), plan: z.string().min(1) }),
  z.object({ kind: z.literal("planless") }),
]);

const assessmentSchema = z.union([
  z.object({ status: z.literal("absent") }),
  z.object({
    status: z.literal("ready"),
    reasons: z.array(z.string()),
  }),
  z.object({
    status: z.literal("not-ready"),
    reasons: z.array(z.string()).min(1),
  }),
  z.object({
    status: z.literal("needs-reassessment"),
    recorded: z.enum(["ready", "not-ready"]),
    reasons: z.array(z.string()),
  }),
]);

const interpretedStoryState = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("not-recorded"),
    assessment: z.object({ status: z.literal("absent") }),
  }),
  z.object({
    status: z.literal("unsupported-version"),
    schemaVersion: z.unknown(),
  }),
  z.object({
    status: z.literal("recorded"),
    refinement: z.enum(["not-refined", "refined"]),
    approach: approachSchema,
    assessment: assessmentSchema,
  }),
]);

export type WorkPreparation =
  | { readonly status: "loading" }
  | { readonly status: "not-recorded" }
  | {
      readonly status: "unsupported-version";
      readonly schemaVersion: unknown;
    }
  | { readonly status: "unavailable"; readonly problem: string }
  | {
      readonly status: "recorded";
      readonly refinement: "not-refined" | "refined";
      readonly approach:
        | { readonly kind: "unselected" }
        | { readonly kind: "planned"; readonly plan: string }
        | { readonly kind: "planless" };
      readonly assessment:
        | { readonly status: "absent" }
        | { readonly status: "ready"; readonly reasons: readonly string[] }
        | {
            readonly status: "not-ready";
            readonly reasons: readonly string[];
          }
        | {
            readonly status: "needs-reassessment";
            readonly recorded: "ready" | "not-ready";
            readonly reasons: readonly string[];
          }
        | { readonly status: "unavailable"; readonly problem: string };
    };

// Preparation badge: one of the labeled colors. Ready is a separate badge.
export type PreparationBadge =
  | { readonly kind: "not-refined"; readonly label: "Not refined" }
  | { readonly kind: "refined"; readonly label: "Refined" }
  | { readonly kind: "slice-planned"; readonly label: "Slice planned" };

export function preparationBadge(
  preparation: WorkPreparation,
): PreparationBadge | undefined {
  if (preparation.status !== "recorded") {
    return undefined;
  }
  if (preparation.refinement === "not-refined") {
    return { kind: "not-refined", label: "Not refined" };
  }
  if (preparation.approach.kind === "planned") {
    return { kind: "slice-planned", label: "Slice planned" };
  }
  return { kind: "refined", label: "Refined" };
}

export function readyBadge(
  preparation: WorkPreparation,
): { readonly label: "Ready for execution" } | undefined {
  if (
    preparation.status === "recorded" &&
    preparation.assessment.status === "ready"
  ) {
    return { label: "Ready for execution" };
  }
  return undefined;
}

export type InterpretedPreparation = Exclude<
  WorkPreparation,
  { readonly status: "loading" }
>;

export function interpretStoryState(
  source: string,
  href: string,
  options: {
    readonly planSource?: string;
    readonly planIsCanonical?: boolean;
  } = {},
): InterpretedPreparation {
  let raw: unknown;
  try {
    raw = readStoryState(source, href, options);
  } catch (error) {
    const reported = error instanceof Error ? error.message : String(error);
    return {
      status: "unavailable",
      problem: `The shared story-state reader reports: “${reported}”`,
    };
  }
  const parsed = interpretedStoryState.safeParse(raw);
  if (!parsed.success) {
    throw new ReadProblem(
      "The shared story-state reader answered in a shape this dashboard does not understand.",
    );
  }
  if (parsed.data.status === "not-recorded") {
    return { status: "not-recorded" };
  }
  if (parsed.data.status === "unsupported-version") {
    return {
      status: "unsupported-version",
      schemaVersion: parsed.data.schemaVersion,
    };
  }
  return {
    status: "recorded",
    refinement: parsed.data.refinement,
    approach: parsed.data.approach,
    assessment: parsed.data.assessment,
  };
}

// Peek at recorded approach without requiring a plan file, so the overview can
// discover which plan paths to fetch. Assessment is not trusted until a plan
// is supplied for planned work.
export function peekRecordedApproach(
  source: string,
  href: string,
): InterpretedPreparation {
  const peeked = interpretStoryState(source, href);
  if (peeked.status === "recorded") {
    return {
      status: "recorded",
      refinement: peeked.refinement,
      approach: peeked.approach,
      assessment: { status: "absent" },
    };
  }
  return peeked;
}
