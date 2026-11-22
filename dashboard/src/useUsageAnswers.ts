// Reads each selected tool's Token index answer (`./usageComparison.ts`) for
// one period, and keeps the last complete set per selection: a new selection
// aborts the obsolete reads, answers for another selection never join it, and
// a read that fails is named by its tool rather than taken as empty; that
// failure lasts only until the selection is read again. Once
// every selected tool answered, a model or effort none of them offers resets
// the selection before its answers show.
import { useEffect, useState } from "react";
import {
  cohortOf,
  offeredSelection,
  selectionKey,
  unionOptions,
  usageToolName,
  type UsageSelection,
} from "./usageComparison.ts";
import { recentUsagePeriod } from "./usagePeriod.ts";
import type { UsageSource } from "./usageSource.ts";
import type { TokenIndexAnswer } from "./usageTokenIndex.ts";

type Settled<T> = { readonly key: string; readonly value: T };

export function useUsageAnswers({
  source,
  selection,
  days,
  refreshed,
  onReset,
}: {
  readonly source: UsageSource;
  readonly selection: UsageSelection;
  readonly days: number;
  // Each Refresh that brought usage in reads the selection again.
  readonly refreshed: number;
  readonly onReset: (selection: UsageSelection) => void;
}) {
  const key = selectionKey(selection, days);
  const [answers, setAnswers] = useState<Settled<TokenIndexAnswer[]>>();
  const [problem, setProblem] = useState<Settled<string>>();
  // The latest offered models and efforts stay on offer while the next
  // selection loads.
  const [options, setOptions] = useState<TokenIndexAnswer["options"]>();
  // Only a settled read of that Refresh's current selection finishes checking.
  const [readAfterRefresh, setReadAfterRefresh] = useState(0);
  useEffect(() => {
    if (selection.tools.length === 0) {
      setReadAfterRefresh(refreshed);
      return;
    }
    // A failure belongs to the read that produced it.
    setProblem(undefined);
    const controller = new AbortController();
    const period = recentUsagePeriod(days);
    const read = (tool: UsageSelection["tools"][number]) =>
      source
        .read(cohortOf(selection, tool), period, controller.signal)
        .catch((error: unknown) => {
          const words = error instanceof Error ? error.message : String(error);
          throw new Error(`${usageToolName(tool)}: ${words}`);
        });
    void Promise.allSettled(selection.tools.map(read)).then((results) => {
      if (controller.signal.aborted) return;
      setReadAfterRefresh(refreshed);
      const failed = results.flatMap((result) =>
        result.status === "rejected"
          ? [result.reason instanceof Error ? result.reason.message : ""]
          : [],
      );
      if (failed.length > 0) {
        setProblem({
          key: `${key}#${String(refreshed)}`,
          value: failed.join(" "),
        });
        return;
      }
      const settled = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      const offered = unionOptions(settled);
      const kept = offeredSelection(selection, offered);
      if (kept !== selection) {
        onReset(kept);
        return;
      }
      setAnswers({ key, value: settled });
      setOptions(offered);
    });
    return () => {
      controller.abort();
    };
    // The key spells the selection and days.
  }, [key, refreshed]);
  return {
    answers: answers?.key === key ? answers.value : undefined,
    problem:
      problem?.key === `${key}#${String(refreshed)}`
        ? problem.value
        : undefined,
    options,
    readAfterRefresh,
  };
}
