// Mounts the configured dashboard over three projects with a machine reader
// the case answers, holds or fails, and reads the Sessions sidebar's Recently
// done section.
import { vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import type { DoneStories } from "../../src/doneStories.ts";
import type { MachineSessionsRead } from "../../src/machineSessionsRevision.ts";
import type { PublishedObservationReadSource } from "../../src/publishedObservationReadSource.ts";
import type { SessionServices } from "../../src/sessionServices.ts";
import type { StoryReviewStatesReadSource } from "../../src/storyReviewStatesReadSource.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardWork } from "../navigation/board-work.ts";

type Catalogued = Extract<DoneStories, { status: "catalogued" }>;
// A project's published done catalog, by project id.
export type DoneCatalogs = Partial<
  Record<string, Pick<Catalogued, "records"> & Partial<Catalogued>>
>;

const projectsWith = (catalogs: DoneCatalogs) =>
  [
    { id: "open-dough", label: "Open Dough" },
    { id: "doughnut", label: "Doughnut" },
    { id: "pygardon", label: "Pygardon" },
  ].map(({ id, label }) => {
    const work = boardWork([], { id, label });
    const catalog = catalogs[id];
    return catalog === undefined
      ? work
      : {
          ...work,
          done: {
            status: "catalogued" as const,
            unreadable: [],
            ...catalog,
            revision: work.revision,
          },
        };
  });

export type Answer = ReturnType<typeof makeMe.aMachineAnswer.please>;

// The machine reader a case changes, holds pending or fails between polls.
export function machineReader(first: Answer) {
  let asked = 0;
  let next: () => Promise<MachineSessionsRead | undefined>;
  const answer = (shown: Answer) => {
    asked += 1;
    const revision = String(asked).padStart(40, "0");
    next = () => Promise.resolve({ ...shown, revision });
  };
  answer(first);
  let reads = 0;
  return {
    read: () => {
      reads += 1;
      return next();
    },
    reads: () => reads,
    answer,
    hold: () => {
      let release = () => {};
      const held = next;
      next = () =>
        new Promise<MachineSessionsRead | undefined>((resolve) => {
          release = () => {
            resolve(held());
          };
        });
      return () => {
        release();
      };
    },
    fail: () => {
      next = () => Promise.resolve(undefined);
    },
  };
}

// `count` ad hoc sessions titled `kind 01`, `kind 02`…, newest first,
// launched two minutes apart and, when `done`, completed a minute apart.
export const adHocSessions = (kind: string, count: number, done: boolean) =>
  Array.from(new Array<undefined>(count).keys(), (index) => {
    const title = `${kind} ${String(index + 1).padStart(2, "0")}`;
    const record = makeMe.aLaunchRecord
      .adHoc({ instruction: title, title })
      .inClaudeSession({ sessionId: `${kind}-${String(index)}` })
      .launchedAt(minutesAgo(2 * (index + 1)));
    return (
      done ? record.markedDoneAt(minutesAgo(index + 1)) : record
    ).please();
  });

// The open list's first session row, above Recently done.
export const openSessionRow = () =>
  document.querySelector<HTMLElement>(
    ".sessions-sidebar-sessions li.sessions-sidebar-session-entry",
  ) ?? undefined;

// A session row's shown age: completion for a Done row, launch for an open one.
export const ageShown = (row: Element | undefined) =>
  row?.querySelector<HTMLElement>(".sessions-sidebar-session-entry-elapsed") ??
  undefined;

// Lets the next machine poll run now instead of after its interval.
export function pollNow() {
  vi.advanceTimersByTime(checkIntervalMs);
}

export async function mountSessions(
  answer: Answer | ReturnType<typeof machineReader>,
  {
    awaitSessionsRead = true,
    done = {},
    doneCatalog,
    doneBodies,
    view = "stories",
    sessions,
    reviewStates,
  }: {
    awaitSessionsRead?: boolean;
    // Each project's published done catalog; others list none.
    done?: DoneCatalogs;
    // A case-owned done catalog read in place of the projects' catalogs.
    doneCatalog?: PublishedObservationReadSource["readDoneCatalog"];
    // The done record bodies a Board's Recently done cards read.
    doneBodies?: DoneRecordReadSource;
    // The first project's Development view: its stories or agent roster.
    view?: "stories" | "roster";
    // The shown session's final report, host status and terminal.
    sessions?: SessionServices;
    // Each project's story review states, read and changed.
    reviewStates?: StoryReviewStatesReadSource;
  } = {},
) {
  const [first, ...otherWork] = projectsWith(done);
  if (first === undefined) throw new Error("No project.");
  await mountBoardFrame(
    first,
    { width: 1280, height: 800 },
    view,
    "read" in answer ? { read: answer.read } : { answer },
    {
      otherWork,
      awaitSessionsRead,
      ...(doneCatalog === undefined ? {} : { doneCatalog }),
      ...(doneBodies === undefined ? {} : { done: doneBodies }),
      ...(sessions === undefined ? {} : { sessions }),
      ...(reviewStates === undefined ? {} : { reviewStates }),
    },
  );
  await page.getByRole("button", { name: /^Sessions/ }).click();
  const region = page.getByRole("region", { name: "Recently done sessions" });
  const rows = () => [
    ...region
      .element()
      .querySelectorAll<HTMLElement>("li.sessions-sidebar-session-entry"),
  ];
  const titles = () =>
    rows().map((entry) => entry.querySelector("h3")?.textContent);
  const row = (title: string) =>
    rows().find((entry) => entry.querySelector("h3")?.textContent === title);
  // Reaches the end of the section after leaving it, which re-arms one batch
  // per reach of the end.
  const revealOlder = () => {
    const body = region
      .element()
      .querySelector<HTMLElement>(".recently-done-sessions-body");
    if (body === null) throw new Error("No Recently done body.");
    for (const top of [0, body.scrollHeight]) {
      body.scrollTop = top;
      body.dispatchEvent(new Event("scroll", { bubbles: true }));
    }
  };
  return {
    sidebar: page.getByRole("complementary", { name: /Sessions/ }),
    region,
    header: region.getByRole("button", { name: "Recently done sessions" }),
    titles,
    row,
    select: (title: string) => region.getByRole("button", { name: title }),
    // A row's separate Open control, named by the access it opens.
    open: (title: string) =>
      region
        .getByRole("listitem")
        .filter({ has: page.getByRole("heading", { name: title }) })
        .getByRole("button", { name: /^(Open terminal|Read final report)$/ }),
    choiceStatus: (title: string) =>
      row(title)?.querySelector(".sessions-sidebar-session-entry-choice")
        ?.textContent ?? undefined,
    revealOlder,
    // The shown titles, first reaching the end again while fewer than
    // `count` are shown; poll it to reveal batch by batch.
    titlesRevealingThrough: (count: number) => () => {
      if (rows().length < count) revealOlder();
      return titles();
    },
  };
}
