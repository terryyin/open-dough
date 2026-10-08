// One continuation typed into a resumed Cursor composer after Recover.
// It names the recorded workflow, identity, worktree, and branch, and tells
// the agent to continue from the worktree's state without opening another
// assignment. The original first prompt is never pasted again.
import { launchKindName, type LaunchRecord } from "../../../src/agentLaunch.ts";

export function cursorRecoveryContinuation(record: LaunchRecord): string {
  if (record.session.host !== "cursor") {
    throw new Error("Only a Cursor session has a recovery continuation.");
  }
  const workflow = launchKindName(record.request.workflow);
  const established = record.start ?? record.preparation;
  const workspace = record.session.continuation.workspace;
  const lines = [
    `Continue the recorded ${workflow} from this launch.`,
    ...(established === undefined
      ? []
      : [
          `Identity: ${established.identity}.`,
          `Branch: ${established.branch}.`,
        ]),
    `Worktree: ${workspace}.`,
    "Continue from this worktree's committed and uncommitted state without opening another assignment.",
    ...(record.request.reporting === undefined
      ? []
      : [`Reporting command: ${record.request.reporting.command}`]),
  ];
  return lines.join("\n");
}
