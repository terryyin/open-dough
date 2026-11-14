// Codex Recheck rereads startup evidence without requesting native verification
// (a direct verification request:
// ../../dashboard/backend-tests/launches/agent-launch-codex-verify-boundary.spec.ts).
import { agentVerifyEndpoint } from "../../dashboard/src/agentLaunch.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { openTakenBacklog } from "../../dashboard/tests/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../dashboard/tests/launchJourney.ts";
import { attempts, launch } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { test, expect } from "../../dashboard/tests/support/codexLaunch.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

const request = makeMe.aLaunchRequest
  .refining({
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  })
  .please();
const subject = `${notRefinedStory} (${notRefinedIdentity})`;
test.use({ projectFolders: ["open-dough"] });

test("Recheck rereads evidence and published state without verifying a Codex start", async ({
  dashboard,
  page,
  codexProtocol,
  launchJourney,
}) => {
  if (codexProtocol === undefined) throw new Error("Missing launch fixture.");
  await openTakenBacklog(page, launchJourney);
  const native = codexProtocol;
  native.refuseInput = true;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
    reason: "unconfirmed",
  });
  const [before] = await attempts(dashboard);
  await page.reload();
  const recovery = parts(page).startupRecovery;
  const recheck = recovery.getByRole("button", { name: `Recheck ${subject}` });
  await expect(recheck).toBeEnabled();
  const verifications: string[] = [];
  page.on("request", (sent) => {
    if (new URL(sent.url()).pathname === agentVerifyEndpoint)
      verifications.push(sent.url());
  });
  const reread = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/__agent-launch",
  );
  const published = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === "/__authenticated-read" &&
      !url.searchParams.has("revision")
    );
  });
  await recheck.click();
  await Promise.all([reread, published]);
  expect(verifications).toEqual([]);
  await expect(recovery).not.toContainText("offers no session listing");
  await expect(
    recovery.getByRole("button", {
      name: `Continue refinement start of ${subject}`,
    }),
  ).toBeEnabled();
  expect(await attempts(dashboard)).toEqual([before]);
  expect(
    codexProtocol.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(
    codexProtocol.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
});
