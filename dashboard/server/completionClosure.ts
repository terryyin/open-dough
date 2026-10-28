// Completion closes tracked execution only after its published story leaves Taken.
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  completedWithoutAttention,
  type CompletionReport,
} from "../src/completionReport.ts";
import { parseBacklog } from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { configuredProject } from "./projectConfiguration.ts";
import { runGit, defaultGitOutputLimit } from "./gitRunner.ts";

// Claimed tracked execution needs published closure; other launches do not.
function claimedTrackedExecution(
  record: Pick<LaunchRecord, "request" | "start">,
): boolean {
  return (
    record.request.workflow === "execution" &&
    record.start !== undefined &&
    !("tracking" in record.start)
  );
}

// Tracked-execution product-closure evidence: retained landing and readable
// published closure. Directory absence is never this evidence.
export async function trackedExecutionClosureReadable(
  record: Pick<LaunchRecord, "request" | "start" | "landing">,
): Promise<boolean> {
  if (!claimedTrackedExecution(record)) return false;
  const source = configuredProject(record.request.source);
  const landing = record.landing;
  if (source === undefined || landing === undefined) return false;
  try {
    const git = async (...args: string[]) =>
      (
        await runGit(args, {
          cwd: landing.repository,
          maxBuffer: defaultGitOutputLimit,
        })
      ).stdout.trim();
    // The first landing is fixed; wrap-up may publish later on the same target.
    const target = `refs/remotes/${landing.remote}/${landing.target.slice("refs/heads/".length)}`;
    const revision = await git("rev-parse", "--verify", `${target}^{commit}`);
    await git("merge-base", "--is-ancestor", landing.revision, revision);
    const document = parseBacklog(
      await git("show", `${revision}:${source.backlogPath}`),
    );
    return !document.entries.some(
      (entry: { identity: string }) =>
        entry.identity === record.start?.identity,
    );
  } catch {
    // Missing or unreadable closure evidence keeps the continuation available.
    return false;
  }
}

export async function completionClosesSession(
  record: Pick<LaunchRecord, "request" | "start" | "landing">,
  report: Pick<CompletionReport, "outcome" | "message">,
): Promise<boolean> {
  if (!completedWithoutAttention(report)) return false;
  if (!claimedTrackedExecution(record)) return true;
  return trackedExecutionClosureReadable(record);
}
