// An unresolved ad hoc launch is recovered outside every card
// (../src/StartupRecovery.tsx): a blank Codex session whose persistence the
// native connection left unconfirmed is listed under Startup recovery as the
// project's ad hoc session, with no card or story made for it and no card
// protected. Continuing it from the page runs that same attempt under the
// existing blank-intent recovery: the recorded conversation is confirmed
// without any input submitted.

import { attempts, launch } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { recoveryOf } from "./responsiveRecovery.ts";
import { expect, stored, test } from "./support/codexLaunch.ts";

const request = { source: "open-dough", host: "codex", workflow: "ad-hoc" };
test.use({ projectFolders: ["open-dough"] });
let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test("an unconfirmed blank ad hoc session is recovered under Startup recovery with no card, and continuing it submits no input", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.beforeRead = (includeTurns) => {
    if (includeTurns) native.failConnection();
  };
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  const [uncertain] = await attempts(dashboard);
  expect(stored(dashboard.home)[0]?.firstInput).toEqual({
    state: "awaiting",
    intent: "blank",
  });

  await openTakenBacklog(page, journey);
  const { stages } = parts(page);
  const articles = await stages.getByRole("article").count();
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    "Ad hoc session · session start in Codex",
  );
  await expect(recovery).toContainText("Startup needs reconciliation");
  const nativeAdvice =
    "Check the dashboard history and native Codex conversations before continuing; a recorded conversation is resumed, never submitted again.";
  await expect(recovery.locator('[id$="-check"]')).toHaveText(nativeAdvice);
  await expect(
    recovery.getByRole("button", {
      name: "Continue session start of Ad hoc session",
    }),
  ).toHaveAccessibleDescription(nativeAdvice);
  await expect(
    recovery.getByRole("button", { name: "Recheck Ad hoc session" }),
  ).toBeEnabled();
  await expect(stages.getByRole("article")).toHaveCount(articles);
  await expect(stages.getByRole("article", { name: /ad hoc/i })).toHaveCount(0);
  await expect(stages).not.toContainText("Startup needs reconciliation");

  delete native.beforeRead;
  await recovery
    .getByRole("button", { name: "Continue session start of Ad hoc session" })
    .click();
  await expect(recoveryOf(page)).toHaveCount(0, { timeout: 30_000 });
  // The item leaves once the attempt runs again, before it settles.
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("launched");
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({
      id: uncertain?.id,
      acceptedAt: uncertain?.acceptedAt,
      request,
      outcome: expect.objectContaining({ kind: "launched" }),
    }),
  ]);
  expect(stored(dashboard.home)).toHaveLength(1);
  expect(stored(dashboard.home)[0]?.firstInput).toMatchObject({
    state: "not-requested",
    intent: "blank",
  });
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(native.calls.filter((call) => call.method === "turn/start")).toEqual(
    [],
  );
});
