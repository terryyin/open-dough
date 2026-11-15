// The coverage gaps a usage write keeps (./usageHistory.ts). A gap belongs to
// the session it names, by its host and session ID, or to the session its
// native source lies in, found by the gap's host: a Claude transcript's
// session (./claudeUsageKeys.ts), a Codex rollout's thread
// (./codexUsageLineage.ts). A write that reads a session again replaces that
// session's gaps with the ones the batch reports for it, as it replaces the
// session's contribution, so a gap the session no longer reports is dropped;
// a stored gap reported again keeps its place. Gaps of sessions the batch does
// not read stay, each gap is kept once, and a task's missing-response gap is
// dropped once the task has a response.
import { sessionKey } from "../src/sessionReference.ts";
import { containingClaudeSession } from "./claudeUsageKeys.ts";
import { containingCodexThread } from "./codexUsageLineage.ts";
import {
  usageGapSchema,
  type UsageBatch,
  type UsageGap,
} from "./usageRecords.ts";

// The sessions a gap belongs to: the one it names and the one its native
// source lies in, found by the gap's host; a gap without a host is read as
// Codex's.
export function gapSessions(gap: UsageGap): string[] {
  const native =
    gap.source?.kind !== "native"
      ? undefined
      : gap.host === "claude"
        ? containingClaudeSession(gap.source.file)
        : containingCodexThread(gap.source.file);
  return [gap.sessionId, native].flatMap((id) =>
    id === undefined ? [] : [id],
  );
}

const gapSessionKeys = (gap: UsageGap): string[] => {
  const { host } = gap;
  if (host === undefined) return [];
  return gapSessions(gap).map((sessionId) => sessionKey({ host, sessionId }));
};

export function reconciledGaps(
  stored: readonly UsageGap[],
  incoming: UsageBatch["gaps"],
  replaced: ReadonlySet<string>,
  answered: ReadonlySet<string>,
): UsageGap[] {
  const reported = new Map<string, UsageGap>();
  for (const value of incoming ?? []) {
    const gap = usageGapSchema.parse(value);
    reported.set(JSON.stringify(gap), gap);
  }
  const gaps = new Map<string, UsageGap>();
  for (const gap of stored) {
    const id = JSON.stringify(gap);
    if (
      reported.has(id) ||
      !gapSessionKeys(gap).some((key) => replaced.has(key))
    )
      gaps.set(id, gap);
  }
  for (const [id, gap] of reported) if (!gaps.has(id)) gaps.set(id, gap);
  return [...gaps.values()].filter(
    (gap) =>
      gap.code !== "no-attributable-response-usage" ||
      !gap.taskId ||
      !answered.has(gap.taskId),
  );
}
