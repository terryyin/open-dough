import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
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
