import { launchResultSchema } from "../../dashboard/src/launchOutcome.ts";
import type { submitCompletion } from "../../dashboard/server/completionReporting.ts";
// Real HTTP launch and the installed attention command; no browser page.
// agent-completion-attention-page.spec.ts owns the card observations: the
// card, the column, the final report, Mark as read, Mark as done, and the
// Done entry. Refused deliveries stay in
// ../../dashboard/backend-tests/sessions/agent-completion-identity.spec.ts.
import { execFile } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexStart.ts";
import { launch } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  queuedIdentity,
  queuedTitle,
} from "../../dashboard/test-support/support/startOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectInstalledReportingScript } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import {
  startDashboardServer,
  sharedDashboardBuild,
} from "../../dashboard/test-support/support/dashboardServer.ts";

type CompletionReceipt = Awaited<ReturnType<typeof submitCompletion>>;
const exec = promisify(execFile);
const steering = ["turn/interrupt", "thread/name/set", "turn/start"];

test("installed attention report stays open through a later unfinished report, workspace removal, and dashboard restart", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  const accepted = await launch(
    dashboard,
    makeMe.aLaunchRequest
      .executing({
        identity: queuedIdentity,
        title: queuedTitle,
        host: "codex",
      })
      .please(),
  );
  expect(accepted.status).toBe(200);
  expect(launchResultSchema.parse(JSON.parse(accepted.body)).kind).toBe(
    "launched",
  );
  const record = stored(dashboard.home)[0];
  if (record?.request.reporting === undefined)
    throw new Error("No actual reporting context");
  const context = record.request.reporting;
  const input = native.calls.find((call) => call.method === "turn/start")
    ?.params["input"];
  expect(JSON.stringify(input)).toContain(context.command);
  expect(context.origin).toBe(dashboard.origin);
  const workspace = record.start?.workspace;
  if (workspace === undefined) throw new Error("No selected workspace");
  expectInstalledReportingScript(workspace);
  const text =
    "Publication finished. Reminder: inspect the migration before release.\n<script>must remain text</script>";
  const message = path.join(origin.machine, "attention.txt");
  writeFileSync(message, text);
  const report = async (outcome: "completed" | "unfinished") => {
    const command = `${context.command} --outcome ${outcome} --message-file '${message}'`;
    const child = await exec("bash", ["-c", command], { cwd: origin.machine });
    return JSON.parse(child.stdout) as CompletionReceipt;
  };
  const nativeSince = (from: number) =>
    native.calls.slice(from).filter((call) => steering.includes(call.method));
  const before = native.calls.length;
  const receipt = await report("completed");
  expect(receipt).toMatchObject({
    reference: context.reference,
    outcome: "completed",
    message: text,
    state: "recorded",
    session: { host: "codex", sessionId: native.threadId },
  });
  expect(stored(dashboard.home)[0]?.completion).toMatchObject({
    receipt: receipt.receipt,
    message: text,
  });
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  expect(nativeSince(before)).toEqual([]);
  const unfinished = await report("unfinished");
  expect(unfinished.outcome).toBe("unfinished");
  expect(stored(dashboard.home)[0]?.completion).toMatchObject({
    outcome: "unfinished",
    message: text,
  });
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  rmSync(workspace, { recursive: true, force: true });
  const retained = await report("unfinished");
  expect(retained.receipt).toEqual(expect.any(String));
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    github: dashboard.github,
    codexProtocol: native,
    port,
  });
  try {
    expect(stored(restarted.home)[0]?.completion?.receipt).toBe(
      retained.receipt,
    );
  } finally {
    await restarted.close();
  }
});
