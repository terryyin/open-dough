// An older install has no landing-capture script. Its instruction names that
// gap, and completion still settles without a landing.
import { unlinkSync } from "node:fs";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { reportingContext } from "../../server/completionReporting.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { reportingInstruction } from "../../server/reportingInstruction.ts";
import { reportingHome } from "../support/installedReporting.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();

test("an installation without landing capture still reports completion and explains the evidence gap", async () => {
  const { workspace } = reportingHome("older-install");
  const folder = { path: workspace, shown: workspace };
  unlinkSync(
    installedSkillPath(
      "codex",
      folder,
      "dough-execute-plan",
      "scripts",
      "dashboard-landing.mjs",
    ),
  );
  const accepted = makeMe.anAcceptedAttempt
    .refining({
      identity: "SEED-413#gap",
      title: "Older install",
      host: "codex",
    })
    .reportingTo(dashboardOrigin)
    .please();
  const prepared = await reportingContext(accepted, folder);
  if (prepared === undefined) throw new Error("No reporting prepared");
  const request = accepted.request;
  if (request.workflow === "ad-hoc")
    throw new Error("Expected a story launch.");
  expect(prepared.reporting).not.toHaveProperty("landingContext");
  expect(prepared).not.toHaveProperty("landingRepository");
  expect(
    reportingInstruction({ ...request, reporting: prepared.reporting }),
  ).toContain("cannot capture a landing comparison");
  await keepAttempt({ ...accepted, reporting: prepared.reporting });
  const record = makeMe.aLaunchRecord
    .refining({ identity: "SEED-413#gap", title: "Older install" })
    .inCodexSession({ sessionId: "older-install" })
    .reportingThrough(prepared.reporting)
    .please();
  await bindRecord(source.id, record);
  const receipt = await deliverCompletion(
    makeMe.aCompletionSubmission
      .reportingFor({ host: "codex", reference: accepted.id })
      .please(),
    dashboardOrigin,
    { reported: () => undefined },
  );
  expect(receipt.outcome).toBe("completed");
  const kept = await keptSession(source.id, record.session);
  expect(kept?.request.reporting?.landingContext).toBeUndefined();
  expect(kept?.landing).toBeUndefined();
  expect(kept?.completion?.outcome).toBe("completed");
});
