// A Codex launch record for Story B that already carries an attention
// message, kept in the machine store the page reads. The outcome is
// completed unless the caller rewrites it unfinished. Storing it does not
// launch, and it does not call retained().

import { mkdirSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CompletionReport } from "../../src/completionReport.ts";
import { readyIdentity, readyStory } from "../launchJourney.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { codexEndpoint, type FakeCodex } from "./fakeCodex.ts";
import { keepLaunchRecords } from "./launchStore.ts";

// Stores Story B's attention record on `native`'s thread, continuing in a
// workspace under the dashboard home, and returns that workspace path. A
// later call with the same message and `unfinished` rewrites that record.
export function keepComposedAttentionCompletion(
  dashboard: DashboardServer,
  native: FakeCodex | undefined,
  message: string,
  outcome: CompletionReport["outcome"] = "completed",
): string {
  if (native === undefined) throw new Error("Missing native fixture");
  const workspace = path.join(dashboard.home, "attention-workspace");
  mkdirSync(workspace, { recursive: true });
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({ identity: readyIdentity, title: readyStory })
      .inCodexSession({
        sessionId: native.threadId,
        continuation: { workspace, endpoint: codexEndpoint(native) },
      })
      .completedWith({ outcome, message })
      .please(),
  ]);
  return workspace;
}
