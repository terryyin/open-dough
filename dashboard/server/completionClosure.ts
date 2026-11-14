// Completion closes tracked execution only after its published story leaves
// Taken: completed when it left the backlog, returned when it went back to
// the queue. The launch only reads that membership; it never moves the story.
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  completedWithoutAttention,
  type CompletionReport,
} from "../src/completionReport.ts";
import {
  parseBacklog,
  takenHeading,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { configuredProject } from "./projectConfiguration.ts";
import { runGit, defaultGitOutputLimit } from "./gitRunner.ts";

// How a report closes its session: completed, returned to the queue, or open.
// Tracked execution reads it from published evidence, where Taken, or missing
// or unreadable evidence, stays open.
export type PublishedClosure = "completed" | "returned" | "open";

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

// Tracked-execution published closure: retained landing and the story's
// membership in the readable published backlog that contains it. Directory
// absence is never this evidence.
async function trackedExecutionClosure(
  record: Pick<LaunchRecord, "request" | "start" | "landing">,
): Promise<PublishedClosure> {
  if (!claimedTrackedExecution(record)) return "open";
  const source = configuredProject(record.request.source);
  const landing = record.landing;
  if (source === undefined || landing === undefined) return "open";
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
    const listed = document.entries.find(
      (entry: { identity: string }) =>
        entry.identity === record.start?.identity,
    );
    if (listed === undefined) return "completed";
    return listed.list === takenHeading ? "open" : "returned";
  } catch {
    // Missing or unreadable closure evidence keeps the continuation available.
    return "open";
  }
}

// Tracked-execution product-closure evidence: published completion only.
export async function trackedExecutionClosureReadable(
  record: Pick<LaunchRecord, "request" | "start" | "landing">,
): Promise<boolean> {
  return (await trackedExecutionClosure(record)) === "completed";
}

// Whether a report closes its session, and as which published outcome.
export async function completionClosure(
  record: Pick<LaunchRecord, "request" | "start" | "landing">,
  report: Pick<CompletionReport, "outcome" | "message">,
): Promise<PublishedClosure> {
  if (!completedWithoutAttention(report)) return "open";
  if (!claimedTrackedExecution(record)) return "completed";
  return trackedExecutionClosure(record);
}

// The returned outcome a report gives its record: that report's receipt when
// its story went back to the queue, so a newer report replaces an earlier one's.
export function returnedOutcome(
  closure: PublishedClosure,
  receipt: string | undefined,
): string | undefined {
  return closure === "returned" ? receipt : undefined;
}
