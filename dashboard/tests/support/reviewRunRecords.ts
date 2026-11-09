// Canonical retained one-shot launch facts; actions and expectations stay in cases.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { queuedIdentity } from "./startOrigin.ts";

export function reviewLaunch({
  sessionId,
  workspace,
  launchedAt,
  reference,
}: {
  readonly sessionId: string;
  readonly workspace: string;
  readonly launchedAt: string;
  readonly reference?: string;
}) {
  const launch = makeMe.aLaunchRecord
    .refining({ identity: queuedIdentity, title: "Story A" })
    .onStoryBranch({
      workspace,
      branch: "review-history",
      tracking: "one-shot",
      role: "isolated",
      landing: "auto-land",
    })
    .inCodexSession({ sessionId })
    .launchedAt(launchedAt);
  return reference === undefined
    ? launch
    : launch.reportingThrough({
        reference,
        origin: "http://127.0.0.1:1",
        command: "report-completion",
      });
}
