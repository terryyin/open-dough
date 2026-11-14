// After the page has read offers, a Host switch re-reads through
// `rereadOffers` marked fresh (`../../dashboard/src/machineSessionsReads.ts`): under a
// long reuse window the dialog shows what the Codex installation offers
// after that read, without waiting for the next 15-second poll. Regular polls
// stay unmarked, including the one the page schedules once that fresh read
// has settled. Story launch and Start session share that path.

import { cpSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { installedSkillPath } from "../../dashboard/server/launchHosts.ts";
import { agentLaunchEndpoint } from "../../dashboard/src/launchRequest.ts";
import { sessionsFreshHeader } from "../../dashboard/src/machineSessionsRevision.ts";
import { checkIntervalMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import { unattachedNotOffered } from "../../dashboard/src/sessionPolicyWords.ts";
import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/tests/dashboardTest.ts";
import {
  installRefinementSkill,
  openTakenBacklog,
  showOptions,
  startSession,
  startSessionDialog,
} from "../../dashboard/tests/launchStoryCardPage.ts";
import { notRefinedStory } from "../../dashboard/tests/launchJourney.ts";
import { codexSkill } from "../../dashboard/tests/support/codexLaunch.ts";
import { radio } from "../../dashboard/tests/support/sessionDialog.ts";
import { repoRoot } from "../../dashboard/tests/support/repositoryRoot.ts";

test.use({
  projectFolders: ["open-dough"],
  extraEnv: { DOUGH_SESSIONS_REUSE_MS: "60000" },
});

type SessionsAnswer = {
  readonly unchanged?: true;
  readonly sessionPolicies?: readonly {
    readonly source: string;
    readonly workflow: string;
    readonly host: string;
  }[];
};

// Each sessions GET the page asks, in order: whether it was marked fresh,
// and the answer once its response body arrived.
type SessionsAsk = {
  readonly fresh: boolean;
  answer?: SessionsAnswer | undefined;
};

function sessionsGets(page: Page) {
  const asks: SessionsAsk[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") return;
    let pathname: string;
    try {
      pathname = new URL(request.url()).pathname;
    } catch {
      return;
    }
    if (pathname !== agentLaunchEndpoint) return;
    const ask: SessionsAsk = {
      fresh: request.headers()[sessionsFreshHeader] !== undefined,
    };
    asks.push(ask);
    void request
      .response()
      .then((response) => response?.json())
      .then((answer: SessionsAnswer | undefined) => {
        ask.answer = answer;
      })
      .catch(() => undefined);
  });
  return asks;
}

// Whether a full answer offers Open Dough's Codex Start session its choices.
const offersCodexStartSession = (answer: SessionsAnswer | undefined) =>
  answer?.sessionPolicies?.some(
    (policy) =>
      policy.source === "open-dough" &&
      policy.workflow === "ad-hoc" &&
      policy.host === "codex",
  ) === true;

// The project's Codex installation of the real execution skill, which ships
// the start, policy and formatter that establish a session with no story.
function installCodexSessionStart(home: string) {
  const project = path.join(home, "git", "open-dough");
  cpSync(
    path.join(repoRoot, "Distribution", "src", "skills", "dough-execute-plan"),
    installedSkillPath(
      "codex",
      { path: project, shown: project },
      "dough-execute-plan",
    ),
    { recursive: true },
  );
}

test("story launch Host switch shows Codex options observed after the switch without waiting for the poll", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  await pausePageClockAt(page, new Date());
  const asks = sessionsGets(page);
  installRefinementSkill(dashboard.home);
  codexSkill(dashboard.home, "--option-a", "Option A");
  const { refine, refinementDialog } = await openTakenBacklog(
    page,
    launchJourney,
  );

  await expect.poll(() => asks.some((ask) => !ask.fresh)).toBe(true);
  const beforeChange = asks.length;

  codexSkill(dashboard.home, "--option-b", "Option B");
  await refine(notRefinedStory).click();
  await refinementDialog
    .getByRole("combobox", { name: "Host" })
    .selectOption("codex");
  // The dialog's accessible name follows its Host.
  const codexDialog = page.getByRole("dialog", {
    name: "Start refinement in Codex",
  });
  await expect(codexDialog).toBeVisible();
  await showOptions(codexDialog);
  await expect(
    codexDialog.getByRole("checkbox", { name: "Option B", exact: true }),
  ).toBeVisible();
  await expect(
    codexDialog.getByRole("checkbox", { name: "Option A", exact: true }),
  ).toHaveCount(0);

  const afterSwitch = asks.slice(beforeChange);
  expect(afterSwitch.some((ask) => ask.fresh)).toBe(true);
});

// Start session shares the fresh Host-switch re-read: its offer follows the
// Codex installation made after the page's read. Once that read has
// answered and the dialog shows its offer, the page arms its next regular
// poll; advancing the clock then makes that poll, and it is unmarked.
test("Start session Host switch shows the Codex offer installed after the page's read; the regular poll after it stays unmarked", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  await pausePageClockAt(page, new Date());
  const asks = sessionsGets(page);
  installRefinementSkill(dashboard.home);
  await openTakenBacklog(page, launchJourney);

  // The page's reads so far are regular, and answered without the offer.
  await expect
    .poll(() => asks.some((ask) => ask.answer?.sessionPolicies !== undefined))
    .toBe(true);
  expect(asks.every((ask) => !ask.fresh)).toBe(true);
  expect(asks.some((ask) => offersCodexStartSession(ask.answer))).toBe(false);

  installCodexSessionStart(dashboard.home);
  await startSession(page, "Open Dough").click();
  const beforeSwitch = asks.length;
  await startSessionDialog(page, "Open Dough")
    .getByRole("combobox", { name: "Host" })
    .selectOption("codex");
  const codexDialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Codex",
  });
  await expect(codexDialog).toBeVisible();

  // The fresh re-read answered with the offer, and the dialog shows it.
  await expect
    .poll(() =>
      asks
        .slice(beforeSwitch)
        .some((ask) => ask.fresh && offersCodexStartSession(ask.answer)),
    )
    .toBe(true);
  await expect(
    radio(codexDialog, "Workspace", "Isolated workspace"),
  ).toBeEnabled();
  await expect(codexDialog).not.toContainText(unattachedNotOffered);

  const settled = asks.length;
  await page.clock.runFor(checkIntervalMs);
  await expect.poll(() => asks.length).toBeGreaterThan(settled);
  expect(asks.slice(settled).every((ask) => !ask.fresh)).toBe(true);
  await expect(codexDialog).toBeVisible();
});
