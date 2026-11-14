// Synthetic host-status figures in the Sessions sidebar title row — no real
// host sampling or session launches.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../tests/dashboardTest.ts";
import { watchRecordReads } from "../tests/sessionStatePace.ts";
import { sessionsSidebarParts } from "../tests/sessionsSidebarPage.ts";
import {
  expectFigure,
  sessionsSidebarFigures,
} from "../tests/sessionsSidebarFigures.ts";
import {
  putFrontendHostStatus,
  putFrontendMachine,
} from "../tests/support/frontendServiceState.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

test.describe("the Sessions sidebar's title row status", () => {
  test("an unread host figure says it is unavailable while the other figures still show", async ({
    page,
    frontendServices,
  }) => {
    await pausePageClockAt(page, new Date());
    // One waiting session so active/waiting counts still render beside host figures.
    putFrontendMachine(
      frontendServices,
      makeMe.aMachineAnswer
        .observing(
          makeMe.anObservedLaunch
            .of(
              makeMe.aLaunchRecord
                .adHoc({ instruction: "Status story", title: "Status story" })
                .inClaudeSession({
                  sessionId: "status-session-7",
                  shortId: "status7",
                })
                .launchedAt("2026-10-01T00:00:00.000Z")
                .please(),
            )
            .withSessionState(makeMe.aSessionState.loaded("waiting").please())
            .please(),
        )
        .please(),
    );
    putFrontendHostStatus(
      frontendServices,
      makeMe.aHostStatus.with({ cpuPercent: 24, freeBytes: null }).please(),
    );
    const { passOnePace } = await watchRecordReads(page);
    await openFrontendTakenBacklog(page);
    const sidebar = sessionsSidebarParts(page);
    const { figures, active, waiting, cpu, disk } =
      sessionsSidebarFigures(page);
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
      putFrontendHostStatus(
        frontendServices,
        makeMe.aHostStatus
          .with({ cpuPercent: 61.4, freeBytes: 1_234_000_000_000 })
          .please(),
      );
      await passOnePace();
      await expectFigure(cpu, "61%", "CPU 61%");
      await expectFigure(disk, "1.2 TB", "1.2 TB free");
    });
    await test.step("CPU unread alone: it says so while free disk shows", async () => {
      putFrontendHostStatus(
        frontendServices,
        makeMe.aHostStatus
          .with({ cpuPercent: null, freeBytes: 110_000_000_000 })
          .please(),
      );
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
    putFrontendMachine(frontendServices, undefined);
    putFrontendHostStatus(
      frontendServices,
      makeMe.aHostStatus
        .with({ cpuPercent: 37, freeBytes: 52_000_000_000 })
        .please(),
    );
    await openFrontendTakenBacklog(page);
    const sidebar = sessionsSidebarParts(page);
    const { figures, active, waiting, cpu, disk } =
      sessionsSidebarFigures(page);
    await sidebar.button.click();
    await expectFigure(cpu, "37%", "CPU 37%");
    await expectFigure(disk, "52 GB", "52 GB free");
    await expect(active).toHaveCount(0);
    await expect(waiting).toHaveCount(0);
    await expect(figures).toHaveCount(2);
  });
});
