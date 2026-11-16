// One selected tool's part of System settings → Usage's trend
// (`./TokenIndexTrend.tsx`): its name in its trace's colour, how many tasks
// it finished in the period with the partial and unpriced ones, its own
// latest rolling median, and the tariff whose reference unit its values are
// in, with the work its usage leaves out. A tool with no priced task says so.
import { countWords } from "./chartValueAxis.ts";
import { usageToolName, usageToolSwatch } from "./usageComparison.ts";
import {
  rollingMedianTasks,
  type TokenIndexAnswer,
  type UsageTool,
} from "./usageTokenIndex.ts";

export const rollingMedianWords = `${String(rollingMedianTasks)}-task rolling median`;

// Claude Code's background work never reaches its transcripts.
const excludedWork: Partial<Record<UsageTool, string>> = {
  claude:
    "Not included: background agent-view row summaries, recaps and idle compaction",
};

// How many tasks the cohort finished, then how many of them are partial and
// how many unpriced, when any are.
function cohortNote({ tasks, unpriced }: TokenIndexAnswer): string {
  const total = tasks.length + unpriced;
  const partial = tasks.filter(
    (task) => task.coverage.kind === "partial",
  ).length;
  return [
    `${String(total)} task${total === 1 ? "" : "s"}`,
    partial === 0 ? undefined : `${String(partial)} partial`,
    unpriced === 0 ? undefined : `${String(unpriced)} unpriced`,
  ]
    .filter((each) => each !== undefined)
    .join(" · ");
}

export function UsageToolSummary({
  answer,
  periodWords,
}: {
  readonly answer: TokenIndexAnswer;
  readonly periodWords: string;
}) {
  const tool = answer.cohort.tool;
  const name = usageToolName(tool);
  const latest = answer.average.at(-1);
  const excluded = excludedWork[tool];
  return (
    <li className="usage-tool" aria-label={name}>
      <div className="usage-chart-head">
        <div>
          <h4>
            <i className={usageToolSwatch(tool)} /> {name}
          </h4>
          <p className="settings-note usage-tool-count">
            {cohortNote(answer)} · Last {periodWords}
          </p>
        </div>
        <p className="usage-median">
          <strong>
            {latest === undefined ? "—" : countWords(latest.value)}
          </strong>
          <span className="settings-note">
            {latest === undefined
              ? `A rolling median needs ${String(rollingMedianTasks)} eligible tasks; none is available in this period`
              : rollingMedianWords}
          </span>
        </p>
      </div>
      {answer.tasks.length === 0 && (
        <p className="settings-empty">
          {answer.unpriced === 0
            ? `No finished task matches in the last ${periodWords}.`
            : `No priced finished task matches in the last ${periodWords}.`}
        </p>
      )}
      <p className="settings-note usage-tool-note">{answer.tariff.label}</p>
      {excluded !== undefined && (
        <p className="settings-note usage-tool-note">{excluded}</p>
      )}
    </li>
  );
}
