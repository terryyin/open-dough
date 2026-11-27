// The one-shot session policy the session-policy launch specs share.

import type { SessionPolicy } from "../../src/agentLaunch.ts";

export const oneShot = (
  workspace: SessionPolicy["workspace"],
  landing: SessionPolicy["landing"],
): SessionPolicy => ({ tracking: "one-shot", workspace, landing });
