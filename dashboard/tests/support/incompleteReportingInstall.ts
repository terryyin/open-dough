// Shared incomplete launch-workspace install setup for reporting-support proofs.
import { unlinkSync } from "node:fs";
import path from "node:path";
import { installedSkillPath } from "../../server/launchHosts.ts";

export const scriptsOf = (workspace: string) =>
  installedSkillPath(
    "claude",
    { path: workspace, shown: workspace },
    "dough-execute-plan",
    "scripts",
  );

export function stripHelper(workspace: string, helper: string): string {
  const file = path.join(scriptsOf(workspace), helper);
  unlinkSync(file);
  return file;
}

export function plantIncompleteInstall(workspace: string): string {
  // Landing remains; its required sibling does not — the settled incomplete case.
  return stripHelper(workspace, "first-landing-expectation.mjs");
}
