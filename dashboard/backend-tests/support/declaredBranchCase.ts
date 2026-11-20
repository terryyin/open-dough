// A Default main launch of the Done capture family that identifies one of the
// checkout's worktrees as its own branch.
import { realpathSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { recordSessionBranchEntry } from "../../server/sessionBranchEntry.ts";
import { aDefaultLaunch, type Checkout, source } from "./doneCaptureCase.ts";

// A blank launch naming its repository as Git resolves it, so a worktree of
// the checkout reports the same repository.
export const aDeclaringLaunch = (
  checkout: Checkout,
  facts: { sessionId?: string } = {},
) =>
  aDefaultLaunch(checkout, {
    ...facts,
    gitDirectory: realpathSync(path.join(checkout.integration, ".git")),
  });

// The kept launch `record` identifies `workspace` on `branch` as its own and
// answers the entry kept.
export const identifyBranch = (
  checkout: Checkout,
  record: LaunchRecord,
  request: { workspace: string; branch: string },
) =>
  recordSessionBranchEntry(
    makeMe.aPublishedSource
      .with({
        id: source,
        label: "Open Dough",
        repository: checkout.integration,
      })
      .please(),
    record,
    request,
  );
