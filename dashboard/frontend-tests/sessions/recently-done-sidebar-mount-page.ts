// Mounts the configured dashboard over three projects with a machine reader
// the case answers, holds or fails, and reads the Sessions sidebar's Recently
// done section.
import { vi } from "vitest";
import { page } from "vitest/browser";
import type { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineSessionsRead } from "../../src/machineSessionsRevision.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardWork } from "../navigation/board-work.ts";

const projects = [
  boardWork([], { id: "open-dough", label: "Open Dough" }),
  boardWork([], { id: "doughnut", label: "Doughnut" }),
  boardWork([], { id: "pygardon", label: "Pygardon" }),
];

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

// Lets the next machine poll run now instead of after its interval.
export function pollNow() {
  vi.advanceTimersByTime(checkIntervalMs);
}

export async function mountSessions(
  answer: Answer | ReturnType<typeof machineReader>,
  { awaitSessionsRead = true }: { awaitSessionsRead?: boolean } = {},
) {
  const [first, ...otherWork] = projects;
  if (first === undefined) throw new Error("No project.");
  await mountBoardFrame(
    first,
    { width: 1280, height: 800 },
    "stories",
    "read" in answer ? { read: answer.read } : { answer },
    { otherWork, awaitSessionsRead },
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
    region,
    header: region.getByRole("button", { name: "Recently done sessions" }),
    titles,
    row: (title: string) =>
      rows().find((entry) => entry.querySelector("h3")?.textContent === title),
    select: (title: string) => region.getByRole("button", { name: title }),
    revealOlder,
    // The shown titles, first reaching the end again while fewer than
    // `count` are shown; poll it to reveal batch by batch.
    titlesRevealingThrough: (count: number) => () => {
      if (rows().length < count) revealOlder();
      return titles();
    },
  };
}
