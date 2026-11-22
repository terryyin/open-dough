import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  doneRecordFileName,
  renderDoneRecord,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { readDoneRecordBodiesAt } from "../../src/authenticatedDoneRead.ts";
import type { DoneStories } from "../../src/doneStories.ts";
import type { PublishedWork, WorkEntry } from "../../src/publishedWork.ts";

export function story(
  title: string,
  number: number,
  facts?: Partial<WorkEntry>,
) {
  const target = `https://example.test/stories/${number}`;
  return makeMe.aWorkEntry
    .with({
      identity: `SEED-${number}#story`,
      title,
      canonical: { kind: "external", recorded: target, url: target },
      ...facts,
    })
    .please();
}

const taken = story("Repair the installer's update report", 59);

export function boardWork(
  backlog: readonly WorkEntry[],
  {
    id = "open-dough",
    label = "Open Dough",
    ...evidence
  }: Partial<PublishedWork> & {
    id?: string;
    label?: string;
  } = {},
) {
  const source = makeMe.aPublishedSource
    .with({ id, label, repository: `example/${id}` })
    .please();
  const empty = makeMe.aPublishedWork.of(source).at("a".repeat(40)).please();
  return makeMe.aPublishedWork
    .with({
      ...empty,
      taken: [taken],
      backlog,
      done: {
        status: "catalogued",
        revision: empty.revision,
        records: [],
        unreadable: [],
      },
      publishedSessions: {
        status: "listed",
        revision: empty.revision,
        sessions: [],
      },
      ...evidence,
    })
    .please();
}

export function cataloguedDone(
  stories: readonly Parameters<typeof renderDoneRecord>[0][],
) {
  const bodies = new Map<string, string>();
  const records = stories.map((story, index) => {
    const fileName = doneRecordFileName(story.identity);
    bodies.set(fileName, renderDoneRecord(story));
    return {
      identity: story.identity,
      completedAt: story.completedAt,
      fileName,
      blob: (index + 1).toString(16).padStart(40, "0"),
    };
  });
  const done = {
    status: "catalogued",
    revision: "d".repeat(40),
    records,
    unreadable: [],
  } satisfies Extract<DoneStories, { status: "catalogued" }>;
  const readBodies: typeof readDoneRecordBodiesAt = (...[, , files]) =>
    Promise.resolve(
      files.map((path) => {
        const text = bodies.get(path);
        if (text === undefined) throw new Error(`No Done record for ${path}.`);
        return { path, text };
      }),
    );
  return { done, readBodies };
}

export const longBacklog = Array.from(
  new Array<undefined>(16).keys(),
  (index) =>
    story(`Queued work number ${index + 1} waits for its turn`, 100 + index, {
      dependencies: {
        status: "unavailable",
        problem: "The canonical record could not be read for dependency facts.",
      },
    }),
);
