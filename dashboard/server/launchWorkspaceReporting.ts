// Required reporting helpers in a launch workspace's selected-host
// installation. Compatibility is capability completeness for what this
// launch will copy — not VERSION equality with the main checkout.
import { access } from "node:fs/promises";
import path from "node:path";
import {
  sendsFirstInput,
  type AgentLaunchRequest,
  type LaunchAttemptRecord,
} from "../src/agentLaunch.ts";
import { installedSkillPath } from "./launchHosts.ts";
import type { ProjectFolder } from "./projectFolders.ts";

export type MissingReportingSupport = {
  readonly helper: string;
  readonly path: string;
};

export type ReportingSupport =
  | { readonly kind: "absent" }
  | { readonly kind: "incomplete"; readonly missing: MissingReportingSupport }
  | { readonly kind: "ready" };

// Thrown when reporting preparation finds a launch workspace whose installed
// helpers are incomplete for the path it would copy. Callers must settle this
// as a definite failed launch, never through the uncertain catch-all.
export class IncompleteReportingSupport extends Error {
  readonly missing: MissingReportingSupport;

  constructor(missing: MissingReportingSupport) {
    super(
      `Missing installed reporting helper ${missing.helper} at ${missing.path}`,
    );
    this.name = "IncompleteReportingSupport";
    this.missing = missing;
  }
}

async function present(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

// Whether this attempt would prepare reporting from a launch-workspace install.
export function preparesReporting(
  attempt: LaunchAttemptRecord,
): attempt is LaunchAttemptRecord & { reportingOrigin: string } {
  return (
    attempt.reportingOrigin !== undefined &&
    !(
      attempt.request.workflow === "ad-hoc" && !sendsFirstInput(attempt.request)
    )
  );
}

// When the completion script is absent, reporting preparation is skipped
// entirely (existing behavior). When it is present, every helper that path
// copies must also be present: landing is optional, but a landing module
// requires its sibling first-landing expectation.
export async function reportingSupport(
  host: AgentLaunchRequest["host"],
  folder: ProjectFolder,
): Promise<ReportingSupport> {
  const completion = installedSkillPath(
    host,
    folder,
    "dough-execute-plan",
    "scripts",
    "dashboard-completion.mjs",
  );
  if (!(await present(completion))) return { kind: "absent" };
  const scripts = path.dirname(completion);
  const entry = path.join(scripts, "ci-direct-entry.mjs");
  if (!(await present(entry)))
    return {
      kind: "incomplete",
      missing: { helper: "ci-direct-entry.mjs", path: entry },
    };
  const landing = path.join(scripts, "dashboard-landing.mjs");
  if (!(await present(landing))) return { kind: "ready" };
  const expectation = path.join(scripts, "first-landing-expectation.mjs");
  if (!(await present(expectation)))
    return {
      kind: "incomplete",
      missing: { helper: "first-landing-expectation.mjs", path: expectation },
    };
  return { kind: "ready" };
}

export async function missingReportingSupport(
  host: AgentLaunchRequest["host"],
  folder: ProjectFolder,
): Promise<MissingReportingSupport | undefined> {
  const support = await reportingSupport(host, folder);
  return support.kind === "incomplete" ? support.missing : undefined;
}

export function incompleteReportingExplanation(
  missing: MissingReportingSupport,
  workspaceShown: string,
): string {
  return `This launch workspace (${workspaceShown}) is missing required Open Dough reporting support: ${missing.helper} (expected at ${missing.path}). Update that worktree's Open Dough installation to restore the helper, then Continue.`;
}
