// A kept blank Default main launch that then identified an existing worktree
// as its branch, through the production branch entry.
import { realpathSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { recordSessionBranchEntry } from "../../server/sessionBranchEntry.ts";
import {
  aDefaultLaunch,
  type Checkout,
  keep,
  source,
} from "./doneCaptureCase.ts";

export async function aLaunchDeclaring(
  checkout: Checkout,
  { workspace, branch }: { workspace: string; branch: string },
) {
  const record = aDefaultLaunch(checkout, {
    gitDirectory: realpathSync(path.join(checkout.integration, ".git")),
  }).please();
  keep(record);
  const project = makeMe.aPublishedSource
    .with({ id: source, label: "Open Dough", repository: checkout.integration })
    .please();
  const entry = await recordSessionBranchEntry(project, record, {
    workspace,
    branch,
  });
  return { record, entry };
}
