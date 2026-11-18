// Completion and refusal evidence originate from the actual product operations.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { completionSchema } from "../../src/completionReport.ts";
import { context } from "./oneShotLanding.ts";
import { reportingChild, quote } from "./completionRecovery.ts";

export async function retainedLandingEvidence(
  original: LaunchRecord,
  cwd: string,
  submission: Record<string, string>,
) {
  const { reporting } = context(original);
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
  return completion;
}
