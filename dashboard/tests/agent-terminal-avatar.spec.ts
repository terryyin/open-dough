// The terminal panel's header shows the portrait of the agent the session's
// kept record names (its start's or preparation's `agent`), to the left of
// the title and session rows and proportionate to both, named and titled by the
// agent; with no recorded agent, or no portrait for it, there is none, and
// the rows are as before. No developer identity shows in the panel. The
// session is an ad hoc one on the committed origin of
// ./agent-launch-ad-hoc-terminal.spec.ts, given its agent by rewriting the
// machine's kept launch store, which the dashboard server reads on every
// request. An Odd-e nerds member's cartoon is answered by the test, since
// the cartoons are never in the repository. The synthetic `claude`
// (./fixtures/fake-claude) is attached; the real one is never reached.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { parts, sessionNamedBy } from "./dashboardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { expectServed } from "./agentPortrait.ts";
import { avatarPng } from "./avatarAnswers.ts";
import { expectTerminalPreviewFits } from "./terminalPortraitPreview.ts";
import { box } from "./pageLayout.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

type Kept = Record<string, unknown>;

// Replaces what the kept record of the project's one session establishes.
function establish(home: string, established: Kept) {
  const file = path.join(
    home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  const store = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    Kept[]
  >;
  store["open-dough"] = (store["open-dough"] ?? []).map((record) => ({
    ...record,
    start: undefined,
    preparation: undefined,
    ...established,
  }));
  writeFileSync(file, JSON.stringify(store));
}

test("the header shows the recorded agent's portrait left of its two rows, proportionate to both, named by the agent, and none without an agent or a portrait", async ({
  page,
  dashboard,
}) => {
  const where = {
    workspace: path.join(dashboard.home, "agent-workspace"),
    branch: "claude/agent-workspace",
    remote: "origin",
    target: "main",
  };
  mkdirSync(where.workspace);
  dashboard.claudeScenario("launched");
  await page.route(
    /\/agent-avatars\/odd-e-nerds\/cartoon\/stanly\.webp$/,
    (route) => route.fulfill(avatarPng(40)),
  );
  await page.route(
    /\/agent-avatars\/odd-e-nerds\/cartoon\/ruuf\.webp$/,
    (route) => route.fulfill({ status: 404 }),
  );
  await openTakenBacklog(page, journey);
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  const names = panel.locator(".side-panel-names");
  const heading = panel.getByRole("heading", { level: 2 });
  const sessionRow = names.locator("p");
  const portrait = panel.locator(".agent-portrait");
  const { recentlyDone } = parts(page);
  const entry = recentlyDone.getByRole("article");

  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  await page
    .getByRole("dialog", {
      name: "Start a session in Open Dough in Claude Code",
    })
    .getByRole("button", { name: "Start" })
    .click();
  await expect(entry).toHaveCount(1);
  const sessionId = await sessionNamedBy(entry);
  const title =
    (await entry.getByRole("heading", { level: 3 }).textContent()) ?? "";
  const storeFile = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  await expect.poll(() => existsSync(storeFile)).toBe(true);

  // The rows as an ad hoc session without an agent shows them.
  const expectRowsUnchanged = async () => {
    await expect(heading).toHaveText(title);
    await expect(sessionRow).toHaveText(`Ad hoc session ${sessionId}`);
  };

  // Gives the session's record what it establishes, then opens its terminal
  // on the reloaded page.
  const reopenEstablishing = async (established: Kept) => {
    establish(dashboard.home, established);
    await expect
      .poll(() => recordsOf(dashboard, "open-dough"))
      .toEqual([expect.objectContaining(established)]);
    await page.reload();
    await entry.getByRole("button", { name: "Open terminal" }).click();
    await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
  };

  // The portrait sits left of the title and session rows, from the top of
  // the title, square and capped to stay proportionate to the two rows.
  const expectBesideBothRows = async (shown: Locator) => {
    const portraitBox = await box(shown);
    const titleBox = await box(heading);
    const rowBox = await box(sessionRow);
    const rowsHeight = rowBox.y + rowBox.height - titleBox.y;
    expect(portraitBox.y).toBeCloseTo(titleBox.y, 0);
    expect(portraitBox.height).toBeCloseTo(Math.min(rowsHeight, 44), 0);
    expect(portraitBox.width).toBeCloseTo(portraitBox.height, 0);
    expect(portraitBox.x + portraitBox.width).toBeLessThanOrEqual(titleBox.x);
    expect(portraitBox.x + portraitBox.width).toBeLessThanOrEqual(rowBox.x);
  };

  await test.step("an ad hoc session with no agent shows no portrait and its two rows", async () => {
    await expect(panel).toHaveCount(1);
    await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
    await expect(portrait).toHaveCount(0);
    await expect(panel.getByRole("img")).toHaveCount(0);
    await expectRowsUnchanged();
  });

  await test.step("a preparation by Yui-chan shows Yui's atlas tile, proportionate to both rows, named and titled Yui-chan", async () => {
    await reopenEstablishing({
      preparation: {
        identity: "SEED-001#story",
        ...where,
        agent: "Yui-chan",
      },
    });
    const yui = panel.getByRole("img", { name: "Yui-chan", exact: true });
    await expect(yui).toBeVisible();
    await expect(yui).toHaveAttribute("title", "Yui-chan");
    await expect(yui).toHaveCSS(
      "background-image",
      /\/agent-avatars\/atlas-1\.webp"\)$/,
    );
    await expect(yui).toHaveCSS("background-position", "0% 12.5%");
    const image = await yui.evaluate(
      (element) =>
        /url\("(.*?)"\)/.exec(getComputedStyle(element).backgroundImage)?.[1] ??
        "",
    );
    await expectServed(panel, image, "image/webp");
    await expectBesideBothRows(yui);
    await expectTerminalPreviewFits(yui, panel);
    await expectRowsUnchanged();
    // The agent is the only identity in the panel: no developer avatar or
    // name beside it.
    await expect(panel.getByRole("img")).toHaveCount(1);
    await expect(panel.locator("img")).toHaveCount(0);
    await expect(panel.locator(".terminal-identity")).toHaveText(
      `${title}Ad hoc session ${sessionId}`,
    );
  });

  await test.step("a start by an Odd-e nerds member whose cartoon is served shows that cartoon", async () => {
    await reopenEstablishing({
      start: {
        identity: "SEED-001#story",
        publisherId: "a1b2c3",
        ...where,
        mode: "story-branch",
        publishedSha: "b2".repeat(20),
        agent: "stanly-chan",
      },
    });
    const stanly = panel.getByRole("img", { name: "stanly-chan", exact: true });
    await expect(stanly).toBeVisible();
    await expect(stanly).toHaveAttribute("title", "stanly-chan");
    await expect(stanly).toHaveCSS("background-image", /\/stanly\.webp"\)$/);
    await expectBesideBothRows(stanly);
    await expectRowsUnchanged();
  });

  await test.step("a start by a member whose cartoon is not served shows no portrait and its two rows", async () => {
    const asked = page.waitForResponse(/\/cartoon\/ruuf\.webp$/);
    await reopenEstablishing({
      start: {
        identity: "SEED-001#story",
        publisherId: "a1b2c3",
        ...where,
        mode: "story-branch",
        publishedSha: "b2".repeat(20),
        agent: "ruuf-chan",
      },
    });
    expect((await asked).status()).toBe(404);
    await expectRowsUnchanged();
    await expect(portrait).toHaveCount(0);
    await expect(panel.getByRole("img")).toHaveCount(0);
  });
});
