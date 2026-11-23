// Forty-five retained Done sessions across the three configured projects, a
// Node-free fixture both Playwright and mounted Vitest cases build from.
import type { LaunchRecord } from "../src/launchRecord.ts";
import { makeMe } from "../../Distribution/tests/support/pageMakeMe.mjs";

// The three configured projects these fixtures keep Done sessions under.
const threeProjects = ["open-dough", "doughnut", "pygardon"] as const;

// Forty-five retained Done sessions across the three configured projects,
// or the `sources` given, newest completion first as titles Done session
// 01 … 45. Two mid-list completions share a timestamp so identity breaks the
// tie. `titles[0]` is newest; `titles[44]` is oldest. Accepted cost: the
// list shows 20, then 40, then all 45, so forty-five reaches two full batches
// and a short last one, every paging boundary the paging cases prove.
export function fortyFiveDoneSessions(
  now: number,
  sources: readonly string[] = threeProjects,
): {
  readonly titles: readonly string[];
  readonly byProject: Record<string, LaunchRecord[]>;
  readonly records: readonly LaunchRecord[];
} {
  const titles = Array.from(
    Array(45).keys(),
    (index) => `Done session ${String(index + 1).padStart(2, "0")}`,
  );
  const records = titles.map((title, index): LaunchRecord => {
    const source = sources[index % sources.length] ?? "open-dough";
    // Indices 4 and 5 (Done session 05 / 06) share a completion time.
    const doneAt =
      index === 5
        ? new Date(now - 5 * 60_000).toISOString()
        : new Date(now - (index + 1) * 60_000).toISOString();
    return makeMe.aLaunchRecord
      .adHoc({ instruction: title, title, source })
      .inClaudeSession({
        sessionId: `done-${String(index + 1).padStart(2, "0")}`,
      })
      .launchedAt(new Date(now - (index + 1) * 120_000).toISOString())
      .markedDoneAt(doneAt)
      .please();
  });
  return { titles, byProject: byProjectOf(records, sources), records };
}

// The records kept under each of these projects, in the order given; a record
// of any other project is a fixture mistake.
export function byProjectOf(
  records: readonly LaunchRecord[],
  sources: readonly string[] = threeProjects,
): Record<string, LaunchRecord[]> {
  const byProject: Record<string, LaunchRecord[]> = Object.fromEntries(
    sources.map((source) => [source, []]),
  );
  for (const record of records) {
    const bucket = byProject[record.request.source];
    if (bucket === undefined) {
      throw new Error(`Unexpected project ${record.request.source}`);
    }
    bucket.push(record);
  }
  return byProject;
}
