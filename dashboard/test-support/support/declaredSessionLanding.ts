// The branch-entry boundary supplies the installed publisher's landing context.
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { z } from "zod";
import { landingReceiptSchema } from "../../src/launchLanding.ts";
import { sessionBranchEntrySchema } from "../../src/sessionBranchResult.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { quote, reportingChild } from "./completionRecovery.ts";
import { rawRequest } from "./rawHttp.ts";
import { publishSessionLanding } from "./startSessionLandingContext.ts";

const declarationSchema = z.object({
  session: z.string(),
  branchEntry: sessionBranchEntrySchema,
  landingContext: z.string(),
});
type Declaration = z.infer<typeof declarationSchema>;

export async function declareThroughSession(
  dashboard: DashboardServer,
  session: string,
  workspace: string,
  branch: string,
) {
  const response = await rawRequest({
    url: `${dashboard.origin}/__agent-launch/branch-entry`,
    method: "POST",
    headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "open-dough",
      host: "claude",
      session,
      workspace,
      branch,
    }),
  });
  expect(response.status, response.body).toBe(200);
  return declarationSchema.parse(JSON.parse(response.body));
}

export function declaredLandingReference(file: string) {
  return z
    .object({ reference: z.uuid() })
    .parse(JSON.parse(readFileSync(file, "utf8"))).reference;
}

export function publishDeclaredSessionLanding(
  handoff: Declaration,
  base: string,
  origin: StartOrigin,
  home: string,
) {
  const { branchEntry, landingContext } = handoff;
  if (branchEntry.trunk === undefined)
    throw new Error("Missing the branch's trunk target.");
  return publishSessionLanding(
    {
      workspace: branchEntry.workspace,
      branch: branchEntry.branch,
      previouslyPublishedBase: base,
      remote: branchEntry.trunk.remote,
      targetRef: branchEntry.trunk.target,
      landingContext,
    },
    declaredLandingReference(landingContext),
    origin,
    home,
    { declared: true },
  );
}

export async function retryDeclaredLanding(file: string, cwd: string) {
  const directory = path.dirname(file);
  const pending = z
    .object({ pending: z.string() })
    .parse(
      JSON.parse(
        readFileSync(path.join(directory, "landing-current.json"), "utf8"),
      ),
    ).pending;
  const script = quote(path.join(directory, "dashboard-completion.mjs"));
  const retry = await reportingChild(
    `node ${script} --operation landing --retry ${quote(pending)}`,
    cwd,
  );
  expect(retry.ok, retry.stderr).toBe(true);
  return landingReceiptSchema.parse(JSON.parse(retry.stdout));
}
