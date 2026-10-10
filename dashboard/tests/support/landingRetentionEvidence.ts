// Mark and attention evidence originate from the actual product operations.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { completionSchema } from "../../src/completionReport.ts";
import { storyReviewMarkEndpoint } from "../../src/storyReview.ts";
import { context, git } from "./oneShotLanding.ts";
import { reportingChild, quote } from "./completionRecovery.ts";

export async function retainedLandingEvidence(
  receiver: DashboardServer,
  original: LaunchRecord,
  cwd: string,
  submission: Record<string, string>,
) {
  const { established, reporting } = context(original);
  const marked = await fetch(`${reporting.origin}${storyReviewMarkEndpoint}`, {
    method: "POST",
    headers: { Origin: reporting.origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "open-dough",
      identity: established.identity,
      tree: git(established.workspace, "rev-parse", "HEAD^{tree}"),
      baseline: established.startingRevision,
    }),
  });
  expect(await marked.json()).toMatchObject({ kind: "marked" });
  const message = path.join(cwd, "retention-attention.txt");
  writeFileSync(
    message,
    "Accepted publication has a recoverable review evidence gap.",
  );
  const completed = await reportingChild(
    `${reporting.command} --outcome completed --message-file ${quote(message)}`,
    cwd,
  );
  expect(completed.ok, completed.stderr).toBe(true);
  const completion = completionSchema.parse(JSON.parse(completed.stdout));
  const file = path.join(
    receiver.home,
    ".open-dough/dashboard/review-marks.json",
  );
  const mark = readFileSync(file, "utf8");
  const markedRefs = git(
    established.workspace,
    "for-each-ref",
    "refs/open-dough/reviewed",
    "--format=%(refname) %(objectname)",
  );
  for (const changed of [
    { reference: randomUUID() },
    { identity: "SEED-B#b" },
    { source: "elsewhere" },
  ]) {
    const report: Record<string, string> = { ...submission, ...changed };
    delete report["origin"];
    const refused = await fetch(`${reporting.origin}/__agent-launch/landing`, {
      method: "POST",
      headers: { Origin: reporting.origin, "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });
    expect([404, 409]).toContain(refused.status);
  }
  return { completion, mark, file, markedRefs };
}
