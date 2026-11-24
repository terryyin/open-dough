// A Taken story follow-up on the mounted Board, its source in Open Dough's
// published done catalog among recent fillers, with the source body read the
// case holds or fails, and the Taken entry's source reference.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardReading } from "../navigation/board-reading-page.ts";
import { boardWork } from "../navigation/board-work.ts";
import {
  doneDestination,
  followLink,
} from "../navigation/story-reference-done-page.ts";
import {
  followUp,
  source,
} from "./recently-done-card-membership-mount-page.ts";
import { standaloneName } from "./recently-done-column-page.ts";

export { source };
export const instruction = "Tighten the source reveal wording";
export const selectedStory = {
  identity: "SEED-500#selected",
  title: "Selected backlog story",
};

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3600_000).toISOString();

export function openFollowUpSource({
  sourceHoursAgo = 31 * 24,
  fillers = 11,
  listed = true,
  identity = source.identity,
  viewport = { width: 1280, height: 844 },
}: {
  // How long ago the source completed; the default is outside the window.
  readonly sourceHoursAgo?: number;
  readonly fillers?: number;
  readonly listed?: boolean;
  readonly identity?: string;
  readonly viewport?: { readonly width: number; readonly height: number };
} = {}) {
  const completed = (story: typeof source, hours: number) =>
    makeMe.aDoneRecord
      .completed({ ...story, completedAt: hoursAgo(hours) })
      .please();
  const records = [
    ...Array.from({ length: fillers }, (...[, index]) =>
      completed(
        { identity: `SEED-6${String(index)}#filler`, title: `Filler ${index}` },
        index + 1,
      ),
    ),
    ...(listed ? [completed(source, sourceHoursAgo)] : []),
  ];
  const { done, doneReads } = makeMe.aDoneCatalog.holding(records).please();
  const sourceFile = done.records.find(
    (record) => record.identity === source.identity,
  )?.fileName;
  let failing = 0;
  let release = () => {};
  let held: Promise<void> | undefined;
  const bodies: DoneRecordReadSource = {
    readBodies: async (project, revision, files, signal) => {
      if (sourceFile !== undefined && files.includes(sourceFile)) {
        if (held !== undefined) await held;
        if (failing > 0) {
          failing -= 1;
          throw new Error("GitHub did not answer the Done body read.");
        }
      }
      return doneReads.readBodies(project, revision, files, signal);
    },
  };
  const work = boardWork([makeMe.aWorkEntry.with(selectedStory).please()]);
  const shown = makeMe.aMachineAnswer
    .observingOpen(followUp(instruction, undefined, { identity }))
    .please();
  return {
    holdSource: () => {
      held = new Promise((resolve) => {
        release = resolve;
      });
      return () => {
        held = undefined;
        release();
      };
    },
    failSourceReads: (count: number) => {
      failing = count;
    },
    mount: () =>
      mountBoardFrame(
        { ...work, done: { ...done, revision: work.revision } },
        viewport,
        "stories",
        { answer: shown },
        { done: bodies },
      ),
  };
}

export const taken = () =>
  boardReading
    .column("Taken")
    .getByRole("article", { name: standaloneName(instruction), exact: true });
export const sourceLink = (name: string) =>
  taken().getByRole("link", { name, exact: true });
export const destination = (identity = source.identity) =>
  doneDestination({ identity, title: source.title });
export const selectedCard = () =>
  boardReading
    .column("Backlog")
    .getByRole("article", { name: selectedStory.title, exact: true });

export const followSource = (
  name: string,
  using: "pointer" | "keyboard" = "pointer",
) => followLink(sourceLink(name), using);
