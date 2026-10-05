import type { submitCompletion } from "../server/completionReporting.ts";
// Real preview/launch/installed report child/store/polling/rendering. Only native transport is fake.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexStart.ts";
import { machineSessions } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { expectInstalledReportingScript } from "./support/reportingInputAssertions.ts";
import { keepFinalReport } from "./support/retainedReport.ts";
import {
  buttonsAddedSince,
  messagePartOf,
  rememberButtons,
} from "./support/sessionMessagePart.ts";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";

type CompletionReceipt = Awaited<ReturnType<typeof submitCompletion>>;
const exec = promisify(execFile);
// The saved conversation's own final report, as Codex keeps it.
const nativeReport = "The saved conversation's final report.";

test("installed attention report stays open, durable and readable through stage change, retirement, restart, Mark as read and Mark as done", async ({
  page,
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  test.setTimeout(120000);
  if (native === undefined) throw new Error("Missing native fixture");
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const queued = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await queued.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("codex");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() =>
      existsSync(
        path.join(dashboard.home, ".open-dough/dashboard/agent-launches.json"),
      )
        ? stored(dashboard.home).length
        : 0,
    )
    .toBe(1);
  await expect
    .poll(() => stored(dashboard.home)[0]?.firstInput?.state)
    .toBe("confirmed");
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
  // Reports through the installed command, as the session would.
  const report = async (outcome: "completed" | "unfinished") =>
    JSON.parse(
      (
        await exec(
          "bash",
          [
            "-c",
            `${context.command} --outcome ${outcome} --message-file '${message}'`,
          ],
          { cwd: origin.machine },
        )
      ).stdout,
    ) as CompletionReceipt;
  // The native calls since `from` that interrupt, rename, or instruct the
  // session.
  const steering = ["turn/interrupt", "thread/name/set", "turn/start"];
  const nativeSince = (from: number, methods: readonly string[] = steering) =>
    native.calls.slice(from).filter((call) => methods.includes(call.method));
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
  await expect(messagePartOf(queued).text).toHaveText(text, { timeout: 20000 });
  await expect(queued.locator(".session-attention-message script")).toHaveCount(
    0,
  );
  await expect(queued.locator(".session-state")).toHaveText("Working");
  await expect(queued.locator(".session-unread-report")).toHaveText(
    "Unread report: Completed with attention",
  );
  await expect(
    queued.getByRole("button", { name: "Mark as read" }),
  ).toBeVisible();
  expect(nativeSince(before)).toEqual([]);
  const post = (body: unknown, headers = { Origin: dashboard.origin }) =>
    rawRequest({
      url: `${dashboard.baseURL}/__agent-launch/completion`,
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  const valid = {
    source: "open-dough",
    host: "codex",
    reference: context.reference,
    outcome: "unfinished",
    message: "Required retirement is held; resolve ownership.",
  };
  for (const [change, status] of [
    [{ source: "unknown-project" }, 404],
    [{ source: "doughnut" }, 404],
    [{ host: "claude" }, 404],
    [{ reference: "00000000-0000-4000-8000-000000000000" }, 404],
    [{ session: "another-session" }, 409],
    [{ message: "" }, 400],
    [{ outcome: "quiet" }, 400],
    [{ extra: true }, 400],
  ] as const) {
    expect((await post({ ...valid, ...change })).status).toBe(status);
  }
  expect((await post(valid, { Origin: "https://elsewhere.test" })).status).toBe(
    403,
  );
  expect(stored(dashboard.home)[0]?.completion?.message).toBe(text);
  expect((await report("unfinished")).outcome).toBe("unfinished");
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  await expect(queued).toContainText("Unfinished work", { timeout: 20000 });
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  published.advanceTo(revision);
  await page.reload();
  const claimed = parts(page).taken.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await expect(messagePartOf(claimed).text).toHaveText(text);
  rmSync(workspace, { recursive: true, force: true });
  // The prepared installed copy remains callable after workspace removal.
  const retainedReceipt = (await report("unfinished")).receipt;
  await expect(messagePartOf(claimed).text).toHaveText(text);
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    github: dashboard.github,
    codexProtocol: native,
    port,
  });
  try {
    await page.reload();
    await expect(messagePartOf(claimed).text).toHaveText(text);
    expect(stored(restarted.home)[0]?.completion?.receipt).toBe(
      retainedReceipt,
    );
    keepFinalReport(native, workspace, nativeReport);
    // The final report is Codex's own; the message stays on the entry.
    await claimed.getByRole("button", { name: "Read final report" }).click();
    const panel = page.getByRole("region", { name: "Final report" });
    await expect(panel.locator(".session-final-report")).toHaveText(
      nativeReport,
    );
    await expect(panel).not.toContainText("Reminder: inspect the migration");
    await expect(
      panel.getByRole("button", { name: "Mark as read" }),
    ).toHaveCount(0);
    // Read on the entry, the session stays open and the panel gains no
    // control; Mark as done then closes it as any session: renamed, and its
    // observed in-progress turn interrupted.
    native.observations.set(native.threadId, {
      status: { type: "active", activeFlags: [] },
      turns: [{ id: "observed-turn", status: "inProgress" }],
    });
    const nativeBeforeDone = native.calls.length;
    await rememberButtons(panel);
    await messagePartOf(claimed).markRead.click();
    await expect(messagePartOf(claimed).markRead).toHaveCount(0);
    await expect
      .poll(() => stored(restarted.home)[0]?.reportRead)
      .toBe(retainedReceipt);
    expect(stored(restarted.home)[0]?.doneAt).toBeUndefined();
    expect(await buttonsAddedSince(panel)).toEqual([]);
    await panel.getByRole("button", { name: "Mark as done" }).click();
    await expect(panel).toHaveCount(0);
    await expect(claimed.locator(".session-attention-message")).toHaveCount(0);
    expect(stored(restarted.home)[0]?.doneAt).toBeDefined();
    expect(stored(restarted.home)[0]?.doneProblem).toBeUndefined();
    const doneName = `done-${stored(restarted.home)[0]?.session.name ?? ""}`;
    await machineSessions(restarted);
    await page.reload();
    const recent = parts(page)
      .recentSessions.getByRole("article")
      .filter({ hasText: native.threadId });
    await expect(recent.locator(".session-state")).toHaveText("Done");
    await expect(recent).toContainText(`Named ${doneName}`);
    // Done, the message is collapsed under its label until expanded.
    const heading = recent.getByRole("button", { name: "Unfinished work" });
    await expect(heading).toHaveAttribute("aria-expanded", "false");
    await heading.click();
    await expect(messagePartOf(recent).text).toHaveText(text);
    await recent.getByRole("button", { name: "Read final report" }).click();
    await expect(panel.locator(".session-final-report")).toHaveText(
      nativeReport,
    );
    expect(
      nativeSince(nativeBeforeDone, [...steering, "thread/resume"]),
    ).toEqual([
      {
        method: "thread/name/set",
        params: { threadId: native.threadId, name: doneName },
      },
      {
        method: "turn/interrupt",
        params: { threadId: native.threadId, turnId: "observed-turn" },
      },
    ]);
  } finally {
    await restarted.close();
  }
});
