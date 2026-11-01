// The Sessions sidebar's title row status: beside the Sessions heading, while
// the sidebar is open, display-only figures say how many open sessions are
// active and how many need attention (waiting), by the same reading the list
// groups by, and this machine's CPU usage and free disk from the server's
// shared host sample; each is an icon and its number or amount, with its
// wording as its name and tooltip; zeros stay; the next sessions reading
// updates them without a reload; an unread host figure says it is
// unavailable without hiding the others; a hidden page asks no host status.
// The page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude).

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { expectReadableContrast } from "./accessibleReading.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { setPageVisibility } from "./autoRefreshJourney.ts";
import { givePageItsTurns } from "./pageRequestNotes.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import {
  cpuShown,
  freeDiskShown,
  hostStatusEndpoint,
  type HostStatus,
} from "../src/hostStatus.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import type { Locator, Page, Request } from "@playwright/test";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const story = (index: number) => ({
  identity: `SEED-902#status-${index}`,
  title: `Status story ${index}`,
});

// The title row's figures, inside the open Sessions sidebar.
function statusParts(page: Page) {
  const { sidebar } = sessionsSidebarParts(page);
  const titleRow = sidebar.locator(".sessions-sidebar-title-row");
  return {
    heading: sidebar.getByRole("heading", { level: 2, name: "Sessions" }),
    figures: titleRow.getByRole("img"),
    active: titleRow.getByRole("img", { name: /^\d+ active sessions?$/ }),
    waiting: titleRow.getByRole("img", {
      name: /^\d+ sessions? needs? attention$/,
    }),
    cpu: titleRow.getByRole("img", { name: /^CPU / }),
    disk: titleRow.getByRole("img", {
      name: /( free|^Free disk unavailable)$/,
    }),
  };
}

const isHostRead = (request: Request) =>
  request.method() === "GET" &&
  new URL(request.url()).pathname === hostStatusEndpoint;

// The page's host status reads as they are sent, and what each answered.
function noteHostReads(page: Page) {
  const asked: Request[] = [];
  const answers: HostStatus[] = [];
  page.on("request", (request) => {
    if (isHostRead(request)) asked.push(request);
  });
  page.on("response", async (response) => {
    if (isHostRead(response.request()))
      answers.push((await response.json()) as HostStatus);
  });
  return { asked: () => asked.length, answers };
}

// The figure is display-only: an icon and its number, with this wording as
// its accessible name and tooltip, and no other visible words.
async function expectFigure(
  figure: Locator,
  count: number | string,
  words: string,
): Promise<void> {
  await expect(figure).toHaveAccessibleName(words);
  await expect(figure).toHaveAttribute("title", words);
  await expect(figure).toHaveText(String(count));
  await expect(figure.locator("svg")).toBeVisible();
  await expect(figure.getByRole("button")).toHaveCount(0);
  await expect(figure.getByRole("link")).toHaveCount(0);
}

test.describe("the Sessions sidebar's title row status", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("counts active and waiting open sessions by the attention grouping, and follows the next sessions reading", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = await watchRecordReads(page);
    const sessions: string[] = [];
    for (const [index, change] of (
      ["working", "blocked", "done-live"] as const
    ).entries()) {
      const { sessionId } = await launched(dashboard, "doughnut", story(index));
      dashboard.claudeSessionBecomes(sessionId, change);
      sessions.push(sessionId);
    }
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { button, entries } = sessionsSidebarParts(page);
    const { heading, figures, active, waiting } = statusParts(page);
    await settled();
    await button.click();
    await expect(entries).toHaveCount(3);
    await passOnePace();

    await test.step("Working, Needs input, and Ready for review: one active, two waiting, beside the Sessions heading", async () => {
      await expect(heading).toHaveText("Sessions");
      await expect(figures).toHaveCount(4);
      await expectFigure(active, 1, "1 active session");
      await expectFigure(waiting, 2, "2 sessions need attention");
      await expectReadableContrast(active);
      await expectReadableContrast(waiting);
    });

    await test.step("a working session that needs input moves to waiting at the next reading, without a reload", async () => {
      dashboard.claudeSessionBecomes(sessions[0] ?? "?", "blocked");
      await passOnePace();
      await expectFigure(active, 0, "0 active sessions");
      await expectFigure(waiting, 3, "3 sessions need attention");
    });

    await test.step("a new working session adds to active at the next reading", async () => {
      await launched(dashboard, "doughnut", story(3));
      await passOnePace();
      await expect(entries).toHaveCount(4);
      await expectFigure(active, 1, "1 active session");
      await expectFigure(waiting, 3, "3 sessions need attention");
    });
  });

  test("keeps a zero waiting count visible, and shows the figures only while the sidebar is open", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    for (const index of [4, 5]) {
      const { sessionId } = await launched(dashboard, "doughnut", story(index));
      dashboard.claudeSessionBecomes(sessionId, "working");
    }
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { button, entries } = sessionsSidebarParts(page);
    const { figures, active, waiting } = statusParts(page);
    // Any status figure the page offers, inside the sidebar or not, host
    // figures included; with no session needing attention, the banner's
    // badge offers none either.
    const shownAnywhere = page.getByRole("img", {
      name: /^(\d+ (active sessions?|sessions? needs? attention)|CPU .*|.* free|Free disk unavailable)$/,
    });
    await settled();

    await test.step("closed, the sidebar shows no figures", async () => {
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(shownAnywhere).toHaveCount(0);
    });

    await test.step("opened, two Working sessions read two active and zero waiting", async () => {
      await button.click();
      await expect(entries).toHaveCount(2);
      await expect(figures).toHaveCount(4);
      await expectFigure(active, 2, "2 active sessions");
      await expectFigure(waiting, 0, "0 sessions need attention");
    });

    await test.step("closed again, the figures leave", async () => {
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(shownAnywhere).toHaveCount(0);
    });
  });
  test("shows the host's CPU usage and free disk from the page's host read, only while the sidebar is open", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { sessionId } = await launched(dashboard, "doughnut", story(6));
    dashboard.claudeSessionBecomes(sessionId, "working");
    const reads = noteHostReads(page);
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { button, entries } = sessionsSidebarParts(page);
    const { figures, active, cpu, disk } = statusParts(page);
    await settled();

    await test.step("closed, the page asks no host status and shows no host figure", async () => {
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await page.clock.runFor(checkIntervalMs);
      await givePageItsTurns(page);
      expect(reads.asked()).toBe(0);
      await expect(cpu).toHaveCount(0);
      await expect(disk).toHaveCount(0);
    });

    await test.step("opened, the title row shows the CPU usage and free disk the host read answered, beside the counts", async () => {
      await button.click();
      await expect(entries).toHaveCount(1);
      await expect.poll(() => reads.answers.length).toBe(1);
      const [answer] = reads.answers;
      if (answer === undefined) throw new Error("No host status answer");
      expect(answer.cpuPercent).not.toBeNull();
      expect(answer.freeBytes).not.toBeNull();
      const cpuFigure = cpuShown(answer.cpuPercent);
      const diskFigure = freeDiskShown(answer.freeBytes);
      expect(cpuFigure.words).toMatch(/^CPU \d{1,3}%$/);
      expect(diskFigure.words).toMatch(/^\d+(\.\d)? (KB|MB|GB|TB|PB) free$/);
      await expect(figures).toHaveCount(4);
      await expectFigure(active, 1, "1 active session");
      await expectFigure(cpu, cpuFigure.shown, cpuFigure.words);
      await expectFigure(disk, diskFigure.shown, diskFigure.words);
      await expectReadableContrast(cpu);
      await expectReadableContrast(disk);
    });

    await test.step("closed again, the host figures leave and the page stops asking", async () => {
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(cpu).toHaveCount(0);
      await expect(disk).toHaveCount(0);
      const before = reads.asked();
      await page.clock.runFor(checkIntervalMs * 2);
      await givePageItsTurns(page);
      expect(reads.asked()).toBe(before);
    });
  });

  test("an unread host figure says it is unavailable while the other figures still show", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { sessionId } = await launched(dashboard, "doughnut", story(7));
    dashboard.claudeSessionBecomes(sessionId, "blocked");
    let answer: HostStatus | undefined = { cpuPercent: 24, freeBytes: null };
    await page.route(
      (url) => url.pathname === hostStatusEndpoint,
      (route) =>
        answer === undefined
          ? route.fulfill({ status: 503, json: { error: "Ask again." } })
          : route.fulfill({ json: answer }),
    );
    const { passOnePace } = await watchRecordReads(page);
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { button, entries } = sessionsSidebarParts(page);
    const { figures, active, waiting, cpu, disk } = statusParts(page);
    await settled();
    await button.click();
    await expect(entries).toHaveCount(1);

    await test.step("free disk unread: it says so, invents no amount, and CPU and the counts still show", async () => {
      await expect(figures).toHaveCount(4);
      await expectFigure(disk, "—", "Free disk unavailable");
      await expectFigure(cpu, "24%", "CPU 24%");
      await expectFigure(active, 0, "0 active sessions");
      await expectFigure(waiting, 1, "1 session needs attention");
    });

    await test.step("the next host read one check interval later changes both figures to its values", async () => {
      answer = { cpuPercent: 61.4, freeBytes: 1_234_000_000_000 };
      await passOnePace();
      await expectFigure(cpu, "61%", "CPU 61%");
      await expectFigure(disk, "1.2 TB", "1.2 TB free");
    });

    await test.step("CPU unread alone: it says so while free disk shows", async () => {
      answer = { cpuPercent: null, freeBytes: 110_000_000_000 };
      await passOnePace();
      await expectFigure(cpu, "—", "CPU unavailable");
      await expectFigure(disk, "110 GB", "110 GB free");
    });

    await test.step("the host status unanswered: both host figures say unavailable and the counts still show", async () => {
      answer = undefined;
      await passOnePace();
      await expectFigure(cpu, "—", "CPU unavailable");
      await expectFigure(disk, "—", "Free disk unavailable");
      await expectFigure(waiting, 1, "1 session needs attention");
    });
  });

  test("with the machine's sessions unread, the host figures still show from the host read", async ({
    page,
  }) => {
    await pausePageClockAt(page, new Date());
    await page.route(
      (url) => url.pathname === agentLaunchEndpoint,
      (route) =>
        route.request().method() === "GET"
          ? route.fulfill({ status: 503, json: { error: "Ask again." } })
          : route.continue(),
    );
    await page.route(
      (url) => url.pathname === hostStatusEndpoint,
      (route) =>
        route.fulfill({
          json: { cpuPercent: 37, freeBytes: 52_000_000_000 },
        }),
    );
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { button } = sessionsSidebarParts(page);
    const { figures, active, waiting, cpu, disk } = statusParts(page);
    await settled();
    await button.click();
    await expectFigure(cpu, "37%", "CPU 37%");
    await expectFigure(disk, "52 GB", "52 GB free");
    await expect(active).toHaveCount(0);
    await expect(waiting).toHaveCount(0);
    await expect(figures).toHaveCount(2);
  });

  test("a hidden page asks no host status; seen again, it asks at once and keeps the steady pace", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { sessionId } = await launched(dashboard, "doughnut", story(8));
    dashboard.claudeSessionBecomes(sessionId, "working");
    const reads = noteHostReads(page);
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { button } = sessionsSidebarParts(page);
    const { cpu } = statusParts(page);
    await settled();
    await button.click();
    await expect.poll(() => reads.answers.length).toBe(1);
    await expect(cpu).toHaveCount(1);

    await test.step("visible and open, one host read per check interval", async () => {
      await page.clock.runFor(checkIntervalMs - 1);
      await givePageItsTurns(page);
      expect(reads.asked()).toBe(1);
      await page.clock.runFor(1);
      await expect.poll(() => reads.asked()).toBe(2);
      await expect.poll(() => reads.answers.length).toBe(2);
    });

    await test.step("hidden, no host read across several intervals", async () => {
      await setPageVisibility(page, "hidden");
      await page.clock.runFor(checkIntervalMs * 3);
      await givePageItsTurns(page);
      expect(reads.asked()).toBe(2);
    });

    await test.step("seen again, a host read at once", async () => {
      await setPageVisibility(page, "visible");
      await expect.poll(() => reads.asked()).toBe(3);
    });
  });
});
