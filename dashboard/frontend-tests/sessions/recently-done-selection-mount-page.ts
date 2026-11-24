// The Recently done selection cases' frame: three projects, Pygardon's
// published done story, its linked, Taken and Doughnut ad hoc Done rows, and
// a Pygardon done catalog the case answers, holds or fails.
import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import type { DoneCatalog } from "../../src/authenticatedDoneRead.ts";
import {
  mountSessions,
  type DoneCatalogs,
} from "./recently-done-sidebar-mount-page.ts";

export const linked = {
  identity: "SEED-501#finished-in-pygardon",
  title: "Pygardon finished story",
};
export const adHocTitle = "Doughnut ad hoc session";
export const takenTitle = "Pygardon's taken story session";

const linkedRecord = makeMe.aLaunchRecord
  .executing({ ...linked, source: "pygardon" })
  .inClaudeSession({ sessionId: "linked-done" })
  .launchedAt(minutesAgo(90))
  .markedDoneAt(minutesAgo(1))
  .please();
const takenRecord = makeMe.aLaunchRecord
  .executing({
    identity: "slice-plans/303-taken",
    title: takenTitle,
    source: "pygardon",
  })
  .inClaudeSession({ sessionId: "taken-elsewhere" })
  .launchedAt(minutesAgo(80))
  .markedDoneAt(minutesAgo(3))
  .please();
const adHocRecord = makeMe.aLaunchRecord
  .adHoc({
    instruction: "Tidy Doughnut's notes",
    title: adHocTitle,
    source: "doughnut",
  })
  .inClaudeSession({ sessionId: "ad-hoc-done" })
  .launchedAt(minutesAgo(60))
  .markedDoneAt(minutesAgo(4))
  .please();

export const report = {
  title: "Open Dough reported session",
  message: "Landed the reported change on main.",
};
const reportRecord = makeMe.aLaunchRecord
  .executing({ identity: "SEED-301#queued", title: report.title })
  .inClaudeSession({ sessionId: "reported-session" })
  .completedWith({ message: report.message })
  .launchedAt(minutesAgo(70))
  .markedDoneAt(minutesAgo(2))
  .please();

const pygardonDone = makeMe.aDoneCatalog
  .holding([
    makeMe.aDoneRecord
      .completed({ ...linked, completedAt: minutesAgo(1) })
      .please(),
  ])
  .please();
const pygardonListsLinked: DoneCatalogs = { pygardon: pygardonDone.done };

export const projectShown = () =>
  page.getByRole("radiogroup", { name: "Project" }).getByRole("radio", {
    checked: true,
  });

// A project's ad hoc sessions completed after the selection's rows.
function newerIn(source: string, count: number) {
  return Array.from(Array(count).keys(), (index) => {
    const title = `${source} newer session ${String(index + 1)}`;
    return makeMe.aLaunchRecord
      .adHoc({ instruction: title, title, source })
      .inClaudeSession({ sessionId: `${source}-newer-${String(index)}` })
      .launchedAt(minutesAgo(3.5 - index * 0.2))
      .markedDoneAt(minutesAgo(3.4 - index * 0.2))
      .please();
  });
}

export async function openSelection(
  options: Parameters<typeof mountSessions>[1] = {},
  {
    doughnutNewer = 0,
    pygardonNewer = 0,
    reported = false,
  }: {
    readonly doughnutNewer?: number;
    readonly pygardonNewer?: number;
    // Adds Open Dough's session whose final report the Side panel reads.
    readonly reported?: boolean;
  } = {},
) {
  const newer = [
    ...newerIn("doughnut", doughnutNewer),
    ...newerIn("pygardon", pygardonNewer),
  ];
  const answer = makeMe.aMachineAnswer
    .observingDone(linkedRecord, takenRecord, ...newer)
    .observingUnavailable(adHocRecord);
  const shown = await mountSessions(
    (reported
      ? answer.observing(
          makeMe.anObservedLaunch
            .of(reportRecord)
            .withSessionState(makeMe.aSessionState.retained("review").please())
            .withWorkspace("missing")
            .please(),
        )
      : answer
    ).please(),
    {
      done: pygardonListsLinked,
      doneBodies: pygardonDone.doneReads,
      ...options,
    },
  );
  await shown.header.click();
  await expect.poll(shown.titles).toContain(adHocTitle);
  return shown;
}

export const terminal = () => page.getByRole("region", { name: "Terminal" });

export const development = () =>
  page.getByRole("radio", { name: "Development", exact: true });

// Pygardon's done catalog as the case answers, holds or fails it; other
// projects publish none.
export function pygardonCatalog() {
  const none = (): Promise<DoneCatalog> =>
    Promise.resolve({ status: "catalogued", records: [], unreadable: [] });
  let next = none;
  let asked = 0;
  return {
    read: (source: { id: string }) => {
      if (source.id !== "pygardon") return none();
      asked += 1;
      return next();
    },
    asked: () => asked,
    hold: () => {
      next = () => new Promise<DoneCatalog>(() => {});
    },
    fail: (problem: string) => {
      next = () => Promise.reject(new Error(problem));
    },
    answer: (catalog: DoneCatalog) => {
      next = () => Promise.resolve(catalog);
    },
  };
}

export const checkAgain = "Select again to check again.";

export const intent = () =>
  page.getByRole("main", { name: "Intent", exact: true });

export async function readInIntent() {
  await page.getByRole("radio", { name: "Intent", exact: true }).click();
  await expect.element(intent()).toBeVisible();
}
