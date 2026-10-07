// Typed presentation of the shared dependency interpretation. Repository reads
// stay at the canonical enrichment boundary; no second dependency grammar.
import { z } from "zod";
import { readStoryDependencies } from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs";
import type { WorkEntry } from "./publishedWork.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  unavailableGap,
  type GapCause,
  type UnavailableGap,
} from "./readWaitBound.ts";
import { resolveSourceLink, type SourceLink } from "./sourceLink.ts";

const dependencySchema = z.object({
  supplier: z.object({ identity: z.string(), href: z.string() }),
  implementation: z.string(),
  rationale: z.string(),
  condition: z.string(),
  state: z.enum(["waiting", "satisfied", "decision-needed"]),
  decision: z.string().optional(),
  resolution: z
    .object({ revision: z.string(), path: z.string(), summary: z.string() })
    .optional(),
});
const interpretedSchema = z.object({
  status: z.enum(["recorded", "not-recorded"]),
  dependencies: z.array(dependencySchema),
  blocking: z.array(dependencySchema),
});

type Dependency = z.infer<typeof dependencySchema> & {
  readonly supplierLink: SourceLink;
  readonly evidenceLink?: SourceLink;
};
export type WorkDependencies =
  | UnavailableGap
  | {
      readonly status: "recorded" | "not-recorded";
      readonly entries: readonly Dependency[];
      readonly blocking: number;
    };

export function dependenciesFor(
  entry: WorkEntry,
  path: string | undefined,
  texts: ReadonlyMap<string, string>,
  problems: ReadonlyMap<string, GapCause>,
  source: PublishedSource,
  revision: string,
): WorkDependencies {
  const text = path === undefined ? undefined : texts.get(path);
  if (text === undefined) {
    const cause = path === undefined ? undefined : problems.get(path);
    return cause !== undefined
      ? unavailableGap(cause)
      : {
          status: "unavailable",
          problem:
            "The canonical record could not be read for dependency facts.",
        };
  }
  try {
    const parsed = interpretedSchema.parse(
      readStoryDependencies(text, entry.canonical.recorded),
    );
    return {
      status: parsed.status,
      blocking: parsed.blocking.length,
      entries: parsed.dependencies.map((dependency) => ({
        ...dependency,
        supplierLink: resolveSourceLink(
          dependency.supplier.href,
          source,
          revision,
        ),
        ...(dependency.resolution !== undefined && {
          evidenceLink: resolveSourceLink(
            `/${dependency.resolution.path}`,
            source,
            dependency.resolution.revision,
          ),
        }),
      })),
    };
  } catch (error) {
    return {
      status: "unavailable",
      problem: error instanceof Error ? error.message : String(error),
    };
  }
}

export function dependencyStartProblem(
  dependencies: WorkDependencies | undefined,
): string | undefined {
  if (dependencies === undefined)
    return "Execution unavailable while dependency facts are being read.";
  if (dependencies.status === "unavailable")
    return `Execution unavailable: dependency facts could not be read. ${dependencies.problem}`;
  if (dependencies.blocking > 0)
    return `Execution unavailable: ${dependencies.blocking} blocking ${dependencies.blocking === 1 ? "dependency" : "dependencies"}. Expand Dependencies for the suppliers and completion conditions.`;
  return undefined;
}
