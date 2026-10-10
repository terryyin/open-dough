// Queued closure and accepted capture are produced by the installed workflow.
// GitHub and native protocol fixtures supply only their external boundaries.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { stored } from "./codexStart.ts";
import { oneShot, requestFor } from "./oneShotLaunch.ts";
import { context, git, scripts } from "./oneShotLanding.ts";
import { captureReviewRun, retireReviewRun } from "./oneShotReview.ts";
import { quote, reportingChild } from "./completionRecovery.ts";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { doneRecordPath } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

export async function completedExecution(
  dashboard: DashboardServer,
  origin: StartOrigin,
  outcome: "completed" | "unfinished",
) {
  // Earlier unpublished and pending default-checkout content, deliberately
  // joined into this reviewed one-shot result before publication.
  writeFileSync(
    path.join(origin.project, "earlier.txt"),
    "earlier local commit\n",
  );
  git(origin.project, "add", "earlier.txt");
  git(
    origin.project,
    "commit",
    "-m",
    "Earlier unpublished default-checkout work",
  );
  const earlier = git(origin.project, "rev-parse", "HEAD");
  writeFileSync(
    path.join(origin.project, "pending.txt"),
    "pending default-checkout work\n",
  );
  const answer = await launch(dashboard, {
    ...requestFor("execution", oneShot("isolated", "auto-land")),
    host: "codex",
  });
  expect(JSON.parse(answer.body)).toMatchObject({ kind: "launched" });
  const record = stored(dashboard.home).at(-1);
  if (record === undefined) throw new Error("No real execution launch");
  const run = { record, ...context(record) };
  const { workspace } = run.established;
  expect(run.established.startingRevision).not.toBe(earlier);
  expect(git(origin.project, "status", "--porcelain")).toContain("pending.txt");
  git(origin.project, "add", "pending.txt");
  git(origin.project, "commit", "-m", "Join the earlier pending content");
  git(workspace, "merge", "--no-edit", "main");
  writeFileSync(
    path.join(workspace, "result.txt"),
    "queued execution result\n",
  );

  // The installed backlog owns completion and catalog creation. The skill's
  // wrap-up removes the spent story section and plan resolved by read-state.
  const cli = path.join(
    scripts(workspace, "dough-product-backlog"),
    "product-backlog.mjs",
  );
  const call = (...args: string[]) =>
    execFileSync(process.execPath, [cli, ...args], {
      cwd: workspace,
      encoding: "utf8",
      stdio: "pipe",
    });
  const href = "seeds/A.md#a";
  const state = JSON.parse(call("read-state", "--link", href)) as {
    approach: { plan: string };
  };
  call("complete", "--identity", queuedIdentity);
  const seed = path.join(workspace, ".planning/seeds/A.md");
  const plan = path.resolve(path.dirname(seed), state.approach.plan);
  expect(readFileSync(seed, "utf8")).toContain('<a id="a"></a>');
  rmSync(seed);
  rmSync(path.dirname(plan), { recursive: true });
  git(workspace, "add", "-A");
  git(
    workspace,
    "commit",
    "-m",
    "Complete the queued story and close its spent records",
  );
  expect(
    readFileSync(path.join(workspace, ".planning/PRODUCT-BACKLOG.md"), "utf8"),
  ).not.toContain(queuedIdentity);
  const donePath = `.planning/${doneRecordPath(queuedIdentity)}`;
  expect(existsSync(path.join(workspace, donePath))).toBe(true);
  expect(existsSync(seed)).toBe(false);
  expect(existsSync(plan)).toBe(false);
  const receipt = captureReviewRun(run, origin);
  expect(receipt.base).toBe(run.established.startingRevision);
  expect(git(origin.origin, "show", `${receipt.revision}:earlier.txt`)).toBe(
    "earlier local commit",
  );
  expect(git(origin.origin, "show", `${receipt.revision}:pending.txt`)).toBe(
    "pending default-checkout work",
  );
  expect(
    git(
      origin.origin,
      "ls-tree",
      "--name-only",
      receipt.revision,
      ".planning/seeds/A.md",
      ".planning/slice-plans/A",
    ),
  ).toBe("");
  retireReviewRun(run, origin, receipt.revision);
  const message = path.join(origin.machine, "attention.txt");
  writeFileSync(message, "Landed; check the next release before continuing.");
  const completion = await reportingChild(
    `${run.reporting.command} --outcome ${outcome}${outcome === "unfinished" ? ` --message-file ${quote(message)}` : ""}`,
    origin.machine,
  );
  expect(completion.ok, completion.stderr).toBe(true);
  const report = completionReceiptSchema.parse(JSON.parse(completion.stdout));
  expect(report).toMatchObject({
    state: "recorded",
    reference: receipt.reference,
    outcome,
  });
  const saved = stored(dashboard.home).find(
    (each) => each.request.reporting?.reference === receipt.reference,
  );
  expect(saved?.landing).toMatchObject({
    base: receipt.base,
    revision: receipt.revision,
  });
  expect(saved?.doneAt === undefined).toBe(outcome === "unfinished");
  return { run, receipt, donePath, report };
}
