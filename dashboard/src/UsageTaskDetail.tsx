// The task selected on System settings → Usage's chart
// (./SystemSettingsUsage.tsx), from the chart's own answer
// (./usageTokenIndex.ts): its story title and identity when known, project,
// tool and launch workflow, its Token index, primary observed model and
// effort, the model and effort its launch requested when known, its end time
// with its outcome or "Outcome unknown", and its coverage: "No known gaps",
// or "Partial" with the recorded gaps that show usage missing, and each model
// weighed at a substitute's rates. Close hands
// focus back to the task's point.
import type { ReactNode } from "react";
import { countWords } from "./chartValueAxis.ts";
import {
  reportedOutcomeLabel,
  returnedToBacklogLabel,
} from "./completionReport.ts";
import { launchKindName } from "./launchWorkflow.ts";
import { Moment } from "./Moment.tsx";
import { hostName } from "./sessionCapabilities.ts";
import type {
  TokenIndexCohort,
  TokenIndexTask,
  UsageCoverageGap,
  UsageSetting,
  UsageSubstitution,
  UsageTaskCoverage,
  UsageTaskOutcome,
} from "./usageTokenIndex.ts";

// The words the task's reported outcome reads with on its session elsewhere.
function outcomeWords(outcome: UsageTaskOutcome | null): string {
  if (outcome === null) return "Outcome unknown";
  if (outcome.disposition === "returned-to-backlog")
    return returnedToBacklogLabel;
  return reportedOutcomeLabel({
    completed: outcome.kind === "reported-complete",
    attention: outcome.attention === true,
  });
}

const effortWords = (effort: string) => `${effort} effort`;

function observedWords({ model, effort }: UsageSetting): string {
  return `${model?.name ?? "Model unknown"} · ${
    effort === null ? "effort unknown" : effortWords(effort)
  }`;
}

// Only what the launch requested, or undefined when it requested neither.
function requestedWords({ model, effort }: UsageSetting): string | undefined {
  const words = [model?.name, effort === null ? undefined : effortWords(effort)]
    .filter((each) => each !== undefined)
    .join(" · ");
  return words === "" ? undefined : words;
}

export const partialWords = "Partial";
export const provisionalWords = "Provisional";
export const estimatedWords = "Estimated rate";

// Each actual model with the substitute whose rates weighed it.
function substitutionWords(substitutions: readonly UsageSubstitution[]) {
  return substitutions
    .map(({ model, substitute }) => `${model.name} at ${substitute.name} rates`)
    .join(", ");
}

const gapWords: Record<UsageCoverageGap, string> = {
  "missing-worker-evidence": "Worker usage missing",
  "incomplete-worker-evidence": "Worker usage incomplete",
  "no-response-usage-evidence": "Session usage missing",
  "unsupported-response-counters": "Unsupported usage counters",
  "missing-root-transcript-usage": "Root transcript usage missing",
  "unresolved-task-association": "Unattributed response",
  "missing-token-components": "Token counts missing",
  "no-attributable-response-usage": "No attributed response",
};

// "No known gaps", "Partial" with the gaps that show usage missing, or
// "Provisional" when the task finished after the last usage check.
function coverageWords(coverage: UsageTaskCoverage) {
  switch (coverage.kind) {
    case "partial":
      return `${partialWords} · ${coverage.gaps.map((gap) => gapWords[gap]).join(", ")}`;
    case "provisional":
      return `${provisionalWords} · finished after the last usage check`;
    case "measured":
      return "No known gaps";
  }
}

function Fact({
  term,
  children,
}: {
  readonly term: string;
  readonly children: ReactNode;
}) {
  return (
    <div>
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function UsageTaskDetail({
  task,
  tool,
  onClose,
}: {
  readonly task: TokenIndexTask;
  readonly tool: TokenIndexCohort["tool"];
  readonly onClose: () => void;
}) {
  const requested = requestedWords(task.requested);
  const about = [
    task.project.label,
    task.identity,
    hostName(tool),
    launchKindName(task.workflow),
  ].filter((each) => each !== null);
  return (
    <section className="usage-detail" aria-label="Selected task">
      <div className="usage-detail-head">
        <div>
          <h3>{task.title ?? "Untitled task"}</h3>
          <p className="settings-note">{about.join(" · ")}</p>
        </div>
        <button type="button" className="frame-button" onClick={onClose}>
          Close
        </button>
      </div>
      <dl>
        <Fact term="Token index">{countWords(task.index)}</Fact>
        {task.substitutions !== undefined && (
          <Fact term={estimatedWords}>
            {substitutionWords(task.substitutions)}
          </Fact>
        )}
        <Fact term="Observed model">{observedWords(task.observed)}</Fact>
        {requested !== undefined && (
          <Fact term="Requested model">{requested}</Fact>
        )}
        <Fact term="Ended">
          <Moment at={new Date(task.endedAt)} /> · {outcomeWords(task.outcome)}
        </Fact>
        <Fact term="Coverage">
          <span
            className={
              task.coverage.kind === "measured" ? undefined : "usage-partial"
            }
          >
            {coverageWords(task.coverage)}
          </span>
        </Fact>
      </dl>
    </section>
  );
}
