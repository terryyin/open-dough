// One selected tool's part of System settings → Usage's trend
// (`./TokenIndexTrend.tsx`): its name beside its trace's task mark, how many
// tasks it finished in the period with the partial, provisional and unpriced
// ones, its own latest rolling median, and the tariff whose reference unit its
// values are in, with the work its usage leaves out, and once per model of its
// shown tasks that its rate card does not list, the substitute that estimated
// it until the card is updated. A tool with no priced task says so.
import { countWords } from "./chartValueAxis.ts";
import { HistoryChartKey } from "./historyChartShapes.tsx";
import { usageToolName, usageToolSlot } from "./usageComparison.ts";
import {
  rollingMedianTasks,
  usageSubstitutions,
  type TokenIndexAnswer,
  type UsageTool,
} from "./usageTokenIndex.ts";

export const rollingMedianWords = `${String(rollingMedianTasks)}-task rolling median`;

// Claude Code's background work never reaches its transcripts.
const excludedWork: Partial<Record<UsageTool, string>> = {
  claude:
    "Not included: background agent-view row summaries, recaps and idle compaction",
};

// How many tasks the cohort finished, then how many of them are partial,
// provisional and unpriced, when any are.
function cohortNote({ tasks, unpriced }: TokenIndexAnswer): string {
  const total = tasks.length + unpriced;
  const counted = (kind: "partial" | "provisional") => {
    const count = tasks.filter((task) => task.coverage.kind === kind).length;
    return count === 0 ? undefined : `${String(count)} ${kind}`;
  };
  return [
    `${String(total)} task${total === 1 ? "" : "s"}`,
    counted("partial"),
    counted("provisional"),
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
  const substitutions = usageSubstitutions(answer.tasks);
  return (
    <li className="usage-tool" aria-label={name}>
      <div className="usage-chart-head">
        <div>
          <h4>
            <HistoryChartKey slot={usageToolSlot(tool)} kind="point" /> {name}
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
      {substitutions.map(({ model, substitute }) => (
        <p key={model.id} className="usage-rate-warning" role="note">
          {name} used {model.name}, which is not on its Token Index rate card;
          estimated at {substitute.name} rates. The Token Index rate card needs
          an update.
        </p>
      ))}
      <p className="settings-note usage-tool-note">{answer.tariff.label}</p>
      {excluded !== undefined && (
        <p className="settings-note usage-tool-note">{excluded}</p>
      )}
    </li>
  );
}
