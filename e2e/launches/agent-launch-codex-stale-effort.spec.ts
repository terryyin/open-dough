// An ad hoc launch explains stale Codex effort before creation and allows
// a deliberate retry with the native defaults.
import path from "node:path";
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import { takenBacklogStories } from "../../dashboard/test-support/launchStoryCardPage.ts";
import { expectSettledPage } from "../../dashboard/test-support/dashboardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import {
  expectServedHomesReach,
  routeServedHomesToPublication,
} from "../../dashboard/test-support/support/fixtureOriginRoute.ts";

// The launch needs a checkout even though its Board has its own publication.
test.use({ projectFolders: ["open-dough"] });

test("stale explicit effort is explained and a deliberate default retry sends neither override", async ({
  page,
  dashboard,
  launchJourney,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  // This ad hoc launch uses the installed checkout, but its Board shows
  // the journey's separate Taken history.
  await publishCommittedOrigin(page, {
    repoDir: launchJourney.origin,
    revision: launchJourney.taken,
    repository: defaultRepository,
  });
  routeServedHomesToPublication(dashboard.github, defaultRepository);
  expectServedHomesReach(
    dashboard.github,
    defaultRepository,
    launchJourney.taken,
  );
  await page.goto("/");
  await expectSettledPage(page, takenBacklogStories);
  const open = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  const dialog = page.getByRole("dialog");
  await open.click();
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await dialog.getByLabel("Model", { exact: true }).selectOption("native-sol");
  await dialog
    .getByLabel("Reasoning effort", { exact: true })
    .selectOption("ultra");
  native.models = native.models.map((item) => ({
    ...item,
    supportedReasoningEfforts: item.supportedReasoningEfforts.filter(
      (item) => item.reasoningEffort !== "ultra",
    ),
  }));
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".start-session-answer")).toContainText(
    "no longer supported",
  );
  expect(native.calls.filter((c) => c.method === "thread/start")).toEqual([]);
  native.catalogError = { code: -32000, message: "Unavailable" };
  await open.click();
  await expect(
    dialog.getByRole("button", { name: "Retry model choices" }),
  ).toBeVisible();
  await expect(
    dialog.getByLabel("Reasoning effort", { exact: true }),
  ).toHaveValue("");
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue("");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() => native.calls.filter((c) => c.method === "thread/start").length)
    .toBe(1);
  expect(
    native.calls.filter((c) => c.method === "thread/start")[0]?.params,
  ).toEqual({ cwd: path.join(dashboard.home, "git", "open-dough") });
});
