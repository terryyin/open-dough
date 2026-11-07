// Running Cursor sessions demand and feedback from synthetic runner answers —
// no Cursor runner, fake-cursor, or dashboardServer.

import { setPageVisibility } from "../tests/autoRefreshJourney.ts";
import {
  askGapMs,
  cursorRunnerSessionsEndpoint,
} from "../src/cursorRunnerSessions.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import {
  emptyMachineAnswer,
  putFrontendMachine,
  type FrontendServiceState,
} from "../tests/support/frontendServiceState.ts";
import { sessionsSidebarParts } from "../tests/sessionsSidebarPage.ts";
import { trackCursorSessionsDemand } from "../tests/support/cursorSessionsDemand.ts";
import { parts } from "../tests/dashboardPage.ts";

const instruction = "hold this session";
const slowerThanAskGapMs = askGapMs + 200;

const heldRecord = {
  request: {
    source: "open-dough",
    host: "cursor" as const,
    workflow: "ad-hoc" as const,
    title: instruction,
    instruction,
  },
  session: {
    host: "cursor" as const,
    sessionId: "12345678-1234-4123-8123-123456789abc",
    name: "Held Cursor",
    continuation: {
      workspace: "/Users/test/git/open-dough",
      args: ["agent", "resume"],
    },
  },
  launchedAt: "2026-10-01T00:00:00.000Z",
};

const heldSessions = {
  runner: "running" as const,
  sessions: [{ record: heldRecord, label: "working" as const }],
};

function holdCursorSession(frontendServices: FrontendServiceState) {
  putFrontendMachine(frontendServices, {
    ...emptyMachineAnswer(),
    records: [
      {
        ...heldRecord,
        sessionState: {
          kind: "available",
          availability: "loaded",
          activity: "working",
        },
      },
    ],
  });
}

async function openRunningList(
  page: Parameters<typeof sessionsSidebarParts>[0],
) {
  const { sidebar, button } = sessionsSidebarParts(page);
  const region = sidebar.getByRole("region", {
    name: "Running Cursor sessions",
  });
  const header = region.getByRole("button", {
    name: "Running Cursor sessions",
  });
  await button.click();
  await header.click();
  return { sidebar, region, header };
}

test("slow Cursor sessions answers still publish under at most one owned read, and collapse or a hidden page ends or pauses that demand", async ({
  page,
  frontendServices,
}) => {
  holdCursorSession(frontendServices);
  await page.route(
    (url) => url.pathname === cursorRunnerSessionsEndpoint,
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, slowerThanAskGapMs));
      await route.fulfill({ json: heldSessions });
    },
  );
  await openFrontendTakenBacklog(page);
  await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
  const demand = trackCursorSessionsDemand(page);
  const shownTerminal = page.getByRole("region", { name: "Terminal" });
  const { sidebar, region, header } = await openRunningList(page);
  await expect(region).toContainText("The Cursor runner is running.");
  const row = region.getByRole("button", { name: /Open Dough/ });
  await expect(row).toContainText("working");
  expect(demand.peak()).toBe(1);
  expect(demand.started()).toBeGreaterThanOrEqual(1);

  const afterPublish = demand.started();
  await expect.poll(() => demand.started()).toBeGreaterThan(afterPublish);
  expect(demand.peak()).toBe(1);

  await setPageVisibility(page, "hidden");
  const whileHidden = demand.started();
  await page.waitForTimeout(slowerThanAskGapMs * 3);
  expect(demand.started()).toBe(whileHidden);
  await setPageVisibility(page, "visible");
  await expect.poll(() => demand.started()).toBeGreaterThan(whileHidden);
  await expect(region).toContainText("The Cursor runner is running.");
  await expect(row).toContainText("working");
  expect(demand.peak()).toBe(1);

  await header.click();
  await expect(region.locator(".running-cursor-body")).toHaveCount(0);
  await expect.poll(() => demand.outstanding()).toBe(0);
  const afterCollapse = demand.started();
  await page.waitForTimeout(slowerThanAskGapMs * 3);
  expect(demand.started()).toBe(afterCollapse);

  await expect(shownTerminal).toHaveCount(0);
  await expect(
    sidebar.getByRole("button", { name: instruction, exact: true }),
  ).toBeVisible();
});

test("while expanded, the list says it is reading, then follows each later read: unreachable, restored, and running with no held sessions", async ({
  page,
  frontendServices,
}) => {
  holdCursorSession(frontendServices);
  const replies = {
    held: heldSessions,
    unreachable: { runner: "unreachable", sessions: [] },
    empty: { runner: "running", sessions: [] },
  };
  let reply: keyof typeof replies = "held";
  let release: () => void = () => undefined;
  const reading = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => url.pathname === cursorRunnerSessionsEndpoint,
    async (route) => {
      await reading;
      await route.fulfill({ json: replies[reply] });
    },
  );
  try {
    await openFrontendTakenBacklog(page);
    await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
    const shownTerminal = page.getByRole("region", { name: "Terminal" });
    const { sidebar, region } = await openRunningList(page);
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(region).toContainText("Reading the Cursor runner…");
    await expect(region.getByRole("listitem")).toHaveCount(0);
    release();
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(row).toContainText("working");

    reply = "unreachable";
    await expect(region).toContainText("The Cursor runner cannot be reached.");
    await expect(region.getByRole("listitem")).toHaveCount(0);
    await expect(
      sidebar.getByRole("button", { name: instruction, exact: true }),
    ).toBeVisible();

    reply = "held";
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(row).toContainText("working");

    reply = "empty";
    await expect(region.getByRole("listitem")).toHaveCount(0);
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(region).not.toContainText("cannot be reached");

    await expect(shownTerminal).toHaveCount(0);
  } finally {
    release();
  }
});
