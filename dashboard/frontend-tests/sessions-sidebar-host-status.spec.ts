// Synthetic host-status figures in the Sessions sidebar title row — no real
// host sampling or session launches.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../tests/dashboardTest.ts";
import { watchRecordReads } from "../tests/sessionStatePace.ts";
import type { Locator } from "@playwright/test";
import { unreadSessions } from "../tests/support/sessionHostStatus.ts";
import { sessionsSidebarParts } from "../tests/sessionsSidebarPage.ts";
import {
  emptyMachineAnswer,
  putFrontendHostStatus,
  putFrontendMachine,
} from "../tests/support/frontendServiceState.ts";

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

function statusParts(page: Parameters<typeof sessionsSidebarParts>[0]) {
  const { sidebar } = sessionsSidebarParts(page);
  const titleRow = sidebar.locator(".sessions-sidebar-title-row");
  return {
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

test.describe("the Sessions sidebar's title row status", () => {
  test("an unread host figure says it is unavailable while the other figures still show", async ({
    page,
    frontendServices,
  }) => {
    await pausePageClockAt(page, new Date());
    // One waiting session so active/waiting counts still render beside host figures.
    putFrontendMachine(frontendServices, {
      ...emptyMachineAnswer(),
      records: [
        {
          request: {
            source: "open-dough",
            host: "claude",
            workflow: "ad-hoc",
            title: "Status story",
            instruction: "Status story",
          },
          session: {
            host: "claude",
            sessionId: "status-session-7",
            shortId: "status7",
            name: "Status story",
          },
          launchedAt: "2026-10-01T00:00:00.000Z",
          sessionState: {
            kind: "available",
            availability: "loaded",
            activity: "waiting",
          },
        },
      ],
    });
    putFrontendHostStatus(frontendServices, {
      cpuPercent: 24,
      freeBytes: null,
    });
    const { passOnePace } = await watchRecordReads(page);
    await openFrontendTakenBacklog(page);
    const sidebar = sessionsSidebarParts(page);
    const { figures, active, waiting, cpu, disk } = statusParts(page);
    await sidebar.button.click();
    await expect(sidebar.entries).toHaveCount(1);
    await test.step("free disk unread: it says so, invents no amount, and CPU and the counts still show", async () => {
      await expect(figures).toHaveCount(4);
      await expectFigure(disk, "—", "Free disk unavailable");
      await expectFigure(cpu, "24%", "CPU 24%");
      await expectFigure(active, 0, "0 active sessions");
      await expectFigure(waiting, 1, "1 session needs attention");
    });
    await test.step("the next host read one check interval later changes both figures to its values", async () => {
      putFrontendHostStatus(frontendServices, {
        cpuPercent: 61.4,
        freeBytes: 1_234_000_000_000,
      });
      await passOnePace();
      await expectFigure(cpu, "61%", "CPU 61%");
      await expectFigure(disk, "1.2 TB", "1.2 TB free");
    });
    await test.step("CPU unread alone: it says so while free disk shows", async () => {
      putFrontendHostStatus(frontendServices, {
        cpuPercent: null,
        freeBytes: 110_000_000_000,
      });
      await passOnePace();
      await expectFigure(cpu, "—", "CPU unavailable");
      await expectFigure(disk, "110 GB", "110 GB free");
    });
    await test.step("the host status unanswered: both host figures say unavailable and the counts still show", async () => {
      putFrontendHostStatus(frontendServices, undefined);
      await passOnePace();
      await expectFigure(cpu, "—", "CPU unavailable");
      await expectFigure(disk, "—", "Free disk unavailable");
      await expectFigure(waiting, 1, "1 session needs attention");
    });
  });

  test("with the machine's sessions unread, the host figures still show from the host read", async ({
    page,
    frontendServices,
  }) => {
    await pausePageClockAt(page, new Date());
    await unreadSessions(page);
    putFrontendHostStatus(frontendServices, {
      cpuPercent: 37,
      freeBytes: 52_000_000_000,
    });
    await openFrontendTakenBacklog(page);
    const sidebar = sessionsSidebarParts(page);
    const { figures, active, waiting, cpu, disk } = statusParts(page);
    await sidebar.button.click();
    await expectFigure(cpu, "37%", "CPU 37%");
    await expectFigure(disk, "52 GB", "52 GB free");
    await expect(active).toHaveCount(0);
    await expect(waiting).toHaveCount(0);
    await expect(figures).toHaveCount(2);
  });
});
