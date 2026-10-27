// A Story card's start eligibility: whether new execution may start, from
// the preparation and dependency facts the card already read. The shared
// derivation owns the meaning; this maps the dashboard's own loading and
// unavailable shapes to gaps and words the Start reason. Nothing is stored.

import { z } from "zod";
import { deriveStartEligibility } from "../../src/skills/dough-product-backlog/scripts/product-backlog-start-eligibility.mjs";
import type { WorkEntry } from "./publishedWork.ts";
import type { WorkDependencies } from "./storyDependencies.ts";
import type { WorkPreparation } from "./storyPreparation.ts";

const blockerSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("dependency"),
    supplier: z.string(),
    href: z.string(),
    state: z.enum(["waiting", "decision-needed"]),
    rationale: z.string(),
    condition: z.string(),
    decision: z.string().optional(),
  }),
  z.object({
    kind: z.literal("assessment"),
    status: z.enum(["not-ready", "absent"]),
    reasons: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("gap"),
    fact: z.enum(["preparation", "dependencies"]),
    problem: z.string(),
  }),
]);
const eligibilitySchema = z.object({
  status: z.enum(["eligible", "blocked"]),
  blockers: z.array(blockerSchema),
});

export type StartEligibility = z.infer<typeof eligibilitySchema>;

const dependenciesReading = "Dependency facts are being read.";

function preparationFact(preparation: WorkPreparation | undefined): unknown {
  if (preparation === undefined || preparation.status === "loading")
    return { status: "unavailable", problem: "Preparation is being read." };
  if (
    preparation.status === "recorded" &&
    (preparation.assessment.status === "unavailable" ||
      preparation.assessment.status === "plan-association-conflict")
  )
    return { status: "unavailable", problem: preparation.assessment.problem };
  return preparation;
}

function dependenciesFact(dependencies: WorkDependencies | undefined): unknown {
  if (dependencies === undefined)
    return { status: "unavailable", problem: dependenciesReading };
  if (dependencies.status === "unavailable") return dependencies;
  return { status: dependencies.status, blocking: dependencies.blocking };
}

export function startEligibilityOf(
  entry: Pick<WorkEntry, "preparation" | "dependencies">,
): StartEligibility {
  return eligibilitySchema.parse(
    deriveStartEligibility({
      preparation: preparationFact(entry.preparation),
      dependencies: dependenciesFact(entry.dependencies),
    }),
  );
}

function blockingDependencyCount(eligibility: StartEligibility): number {
  return eligibility.blockers.filter((blocker) => blocker.kind === "dependency")
    .length;
}

const dependencyNoun = (count: number) =>
  count === 1 ? "dependency" : "dependencies";

// The Backlog badge naming unsatisfied dependencies, or nothing when none.
export function dependencyBlockedLabel(
  eligibility: StartEligibility,
): string | undefined {
  const count = blockingDependencyCount(eligibility);
  return count > 0 ? `Blocked by ${count} ${dependencyNoun(count)}` : undefined;
}

// Why Start execution is unavailable for dependencies, or nothing when no
// dependency blocks. The assessment alone leaves Start offered with its note.
export function dependencyStartReason(
  eligibility: StartEligibility,
): string | undefined {
  const gap = eligibility.blockers.find(
    (blocker) => blocker.kind === "gap" && blocker.fact === "dependencies",
  );
  if (gap?.kind === "gap")
    return gap.problem === dependenciesReading
      ? "Execution unavailable while dependency facts are being read."
      : `Execution unavailable: dependency facts could not be read. ${gap.problem}`;
  const count = blockingDependencyCount(eligibility);
  if (count > 0)
    return `Execution unavailable: ${count} blocking ${dependencyNoun(count)}. Expand Dependencies for the suppliers and completion conditions.`;
  return undefined;
}
