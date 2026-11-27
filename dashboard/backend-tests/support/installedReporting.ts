// A launch's installed reporting script, run in process over a private
// machine home. Its sender reaches production completion admission and
// delivery through the receiver bridge beside the installed publisher, so
// what the script retains is exactly what the receiver records.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { onTestFinished, vi } from "vitest";
import { reportingContext } from "../../server/completionReporting.ts";
import type { ReportedDone } from "../../server/doneMarks.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type { LaunchAttemptRecord } from "../../src/agentLaunch.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { ReportingContext } from "../../src/launchRequest.ts";
import {
  bridgeToReceiver,
  installPublisherScripts,
  type Reporter,
} from "./installedPublisher.ts";

// The installed reporting script and its arguments, as the host's shell
// splits a launch's reporting command `node <script> ...argv`.
export function reportingInvocation(command: string) {
  const [, script = "", ...argv] = Array.from(
    command.matchAll(/'((?:[^']|'\\'')*)'/g),
    ([, part = ""]) => part.replaceAll("'\\''", "'"),
  );
  return { script, argv };
}

// Reports through the installed reporting script at `script`, as its
// reporting command runs it with `argv`, answering its printed result. With
// `lostReceipt`, the delivery happens but its receipt never reaches the script.
export async function reportInstalled(
  script: string,
  argv: string[],
  doneMarks: ReportedDone,
  { lostReceipt = false } = {},
) {
  bridgeToReceiver(doneMarks, lostReceipt);
  const reporter = (await import(pathToFileURL(script).href)) as Reporter;
  return reporter.reportCompletion(argv);
}

// A private machine home under a fresh `name`d root, on the production
// project catalog, with its dashboard directory and a workspace holding the
// installed reporting scripts where a Codex launch workspace has them.
export function reportingHome(name: string) {
  const root = mkdtempSync(path.join(tmpdir(), `${name}-`));
  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });
  vi.stubEnv("HOME", path.join(root, "home"));
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  onTestFinished(mountProjectConfiguration("production"));
  const workspace = path.join(root, "workspace");
  installPublisherScripts(
    installedSkillPath(
      "codex",
      { path: workspace, shown: workspace },
      "dough-execute-plan",
      "scripts",
    ),
  );
  const dashboard = path.join(root, "home", ".open-dough", "dashboard");
  return { root, workspace, dashboard };
}

// Keeps the `accepted` Codex attempt with the reporting the dashboard
// prepares in `workspace`, and binds this project's launch record that
// `recordFor` composes for that reporting. Answers the record and the
// installed reporting script with its arguments.
export async function keptReportingLaunch<Bound extends LaunchRecord>(
  workspace: string,
  accepted: LaunchAttemptRecord,
  recordFor: (reporting: ReportingContext) => Bound,
) {
  const prepared = await reportingContext(accepted, {
    path: workspace,
    shown: workspace,
  });
  if (prepared === undefined) throw new Error("No reporting prepared");
  const { reporting } = prepared;
  await keepAttempt({ ...accepted, reporting });
  const record = recordFor(reporting);
  await bindRecord("open-dough", record);
  return { record, ...reportingInvocation(reporting.command) };
}
