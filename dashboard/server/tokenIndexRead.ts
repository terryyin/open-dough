// Admit the chart request before reading its evidence, then weigh that
// evidence for the selected cohort and period.
import {
  requestedCohort,
  type TokenIndexAnswer,
  type TokenIndexCohort,
  type UsageTool,
} from "../src/usageTokenIndex.ts";
import { requestedUsagePeriod, type UsagePeriod } from "../src/usagePeriod.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { ConfiguredProject } from "./projectConfiguration.ts";
import { tokenIndexCohort } from "./tokenIndexCohort.ts";
import type { UsageReading } from "./tokenIndexTask.ts";
import type { UsageTaskSummary } from "./usageTaskSummary.ts";

export type TokenIndexInputs = Omit<UsageReading, "projects"> & {
  readonly summary: UsageTaskSummary;
  readonly projects: readonly Pick<ConfiguredProject, "id" | "label">[];
};

export function tokenIndexAnswer(
  { summary, projects, launches, tariff, checkedAt }: TokenIndexInputs,
  cohort: TokenIndexCohort,
  period?: UsagePeriod,
): TokenIndexAnswer {
  return {
    ...tokenIndexCohort(
      summary,
      {
        projects: new Map(projects.map(({ id, label }) => [id, label])),
        launches,
        tariff,
        checkedAt,
      },
      cohort,
      period,
    ),
    checkedAt,
  };
}

export async function readTokenIndex(
  method: string | undefined,
  query: URLSearchParams,
  load: (tool: UsageTool) => TokenIndexInputs | Promise<TokenIndexInputs>,
): Promise<TokenIndexAnswer> {
  if (method !== "GET") throw new RefusedRequest(405, "Only GET is accepted.");
  const cohort = requestedCohort(query);
  if (cohort === undefined)
    throw new RefusedRequest(400, "Choose a known tool and launch workflow.");
  const period = requestedUsagePeriod(query);
  if (period === null)
    throw new RefusedRequest(
      400,
      "Choose a valid Usage period with both from and until instants.",
    );
  return tokenIndexAnswer(await load(cohort.tool), cohort, period);
}
