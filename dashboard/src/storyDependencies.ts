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
      // The unsatisfied entries, as the shared reader reports them.
      readonly blocking: readonly Dependency[];
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
    const entries = parsed.dependencies.map((dependency) => ({
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
    }));
    const blocking = new Set(
      parsed.blocking.map((dependency) => dependency.supplier.identity),
    );
    return {
      status: parsed.status,
      entries,
      blocking: entries.filter((dependency) =>
        blocking.has(dependency.supplier.identity),
      ),
    };
  } catch (error) {
    return {
      status: "unavailable",
      problem: error instanceof Error ? error.message : String(error),
    };
  }
}
