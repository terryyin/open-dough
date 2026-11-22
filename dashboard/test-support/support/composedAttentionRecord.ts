// A Codex launch record for Story B that already carries a completed
// attention message, kept in the machine store the page reads. Storing it
// does not launch, and it does not call retained().

import { mkdirSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readyIdentity, readyStory } from "../launchJourney.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { codexEndpoint, type FakeCodex } from "./fakeCodex.ts";
import { keepLaunchRecords } from "./launchStore.ts";

// Stores Story B's completed attention record on `native`'s thread, continuing
// in a workspace under the dashboard home, and returns that workspace path.
export function keepComposedAttentionCompletion(
  dashboard: DashboardServer,
  native: FakeCodex | undefined,
  message: string,
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
      .completedWith({ outcome: "completed", message })
      .please(),
  ]);
  return workspace;
}
