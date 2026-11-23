import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { WorkEntry } from "../../src/publishedWork.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountIntentCiPage } from "../intent/intent-ci-page-mount.ts";

export const consumer = { identity: "SEED-A#a", title: "Story A" };
export const nearDone = { identity: "SEED-203#done", title: "Done story 3" };
export const farDone = { identity: "SEED-227#done", title: "Done story 27" };
const expiredDone = {
  identity: "SEED-299#expired",
  title: "Completed outside the retained window",
};
const unlisted = { identity: "SEED-298#unlisted", title: "An unlisted story" };

const source = makeMe.aPublishedSource.openDough.please();

export async function openDoneReferences({
  holdFar = false,
  viewport,
}: {
  readonly holdFar?: boolean;
  readonly viewport?: { readonly width: number; readonly height: number };
} = {}) {
  const now = Date.now();
  const completed = (story: typeof farDone, hoursAgo: number) =>
    makeMe.aDoneRecord
      .completed({
        ...story,
        completedAt: new Date(now - hoursAgo * 3600_000).toISOString(),
      })
      .please();
  const recent = Array.from({ length: 35 }, (...[, index]) =>
    completed(
      {
        identity: `SEED-${201 + index}#done`,
        title: `Done story ${index + 1}`,
      },
      index + 1,
    ),
  );
  const { done, doneReads } = makeMe.aDoneCatalog
    .holding([...recent, completed(expiredDone, 31 * 24)])
    .please();
  const farRecord = done.records.find(
    ({ identity }) => identity === farDone.identity,
  );
  if (farRecord === undefined) throw new Error("Supply the far Done record.");
  const entries = [nearDone, farDone, expiredDone, unlisted].map(
    ({ identity }) => {
      const href = `seeds/${identity.replace("#", ".md#")}`;
      return {
        supplier: { identity, href },
        supplierLink: {
          kind: "external" as const,
          recorded: href,
          url: `https://example.test/${href}`,
        },
        implementation: "Shared endpoint contract",
        rationale: "The supplier publishes the endpoint first.",
        condition: "The endpoint is integrated and verified.",
        state: "waiting" as const,
      };
    },
  );
  const dependencies: WorkEntry["dependencies"] = {
    status: "recorded",
    entries,
    blocking: entries,
  };
  const work = makeMe.aPublishedWork
    .with({
      ...makeMe.aPublishedWork.of(source).at(done.revision).please(),
      done,
      backlog: [makeMe.aWorkEntry.with({ ...consumer, dependencies }).please()],
    })
    .please();
  const asked: string[] = [];
  const answered: string[] = [];
  let release = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  onTestFinished(release);
  const doneAnswer: typeof doneReads = {
    readBodies: async (project, revision, files, signal) => {
      asked.push(...files);
      if (holdFar && files.includes(farRecord.fileName)) await pending;
      const answer = await doneReads.readBodies(
        project,
        revision,
        files,
        signal,
      );
      answered.push(...files);
      return answer;
    },
  };
  const { ci, intent } = pageReadsSupplying({});
  await mountIntentCiPage({
    work,
    ...(viewport === undefined ? {} : { viewport }),
    initialPerspective: "development",
    reads: { ci, intent, done: doneAnswer },
  });
  const titlesThrough = (count: number) =>
    recent.slice(0, count).map(({ title }) => title);
  const pathsThrough = (count: number, withSuppliers = false) =>
    [
      ...new Set([
        ...done.records.slice(0, count).map(({ fileName }) => fileName),
        ...(withSuppliers
          ? done.records
              .filter(
                ({ identity }) =>
                  identity === farDone.identity ||
                  identity === expiredDone.identity,
              )
              .map(({ fileName }) => fileName)
          : []),
      ]),
    ].toSorted();
  const requestedBodies = () => [...new Set(asked)].toSorted();
  return {
    requestedBodies,
    answered,
    release,
    titlesThrough,
    pathsThrough,
    farPath: farRecord.fileName,
  };
}
