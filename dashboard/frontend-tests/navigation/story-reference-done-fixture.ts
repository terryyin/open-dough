import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PublishedWork, WorkEntry } from "../../src/publishedWork.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountIntentCiPage } from "../intent/intent-ci-page-mount.ts";

export const consumer = { identity: "SEED-A#a", title: "Story A" };
export const nearDone = { identity: "SEED-203#done", title: "Done story 3" };
export const farDone = { identity: "SEED-227#done", title: "Done story 27" };
export const expiredDone = {
  identity: "SEED-299#expired",
  title: "Completed outside the retained window",
};
export const unlisted = {
  identity: "SEED-298#unlisted",
  title: "An unlisted story",
};

export const laterDone = { identity: "SEED-231#done", title: "Done story 31" };

export const catalogProblem =
  "Done stories could not be read. GitHub did not answer.";

const source = makeMe.aPublishedSource.openDough.please();

export async function openDoneReferences({
  holdFar = false,
  failFar = false,
  catalog = "ready",
  viewport,
}: {
  readonly holdFar?: boolean;
  readonly failFar?: boolean;
  readonly catalog?: "ready" | "loading" | "unavailable" | "missing";
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
  const pathOf = ({ identity }: typeof farDone) => {
    const record = done.records.find(
      (candidate) => candidate.identity === identity,
    );
    if (record === undefined)
      throw new Error(`Supply the Done record for ${identity}.`);
    return record.fileName;
  };
  const farPath = pathOf(farDone);
  const entriesFor = (suppliers: readonly (typeof farDone)[]) =>
    suppliers.map(({ identity }) => {
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
    });
  const dependenciesFor = (
    suppliers: readonly (typeof farDone)[],
  ): NonNullable<WorkEntry["dependencies"]> => {
    const entries = entriesFor(suppliers);
    return { status: "recorded", entries, blocking: entries };
  };
  const catalogAt = (
    state: typeof catalog,
    revision: string,
  ): NonNullable<PublishedWork["done"]> => {
    switch (state) {
      case "ready":
        return { ...done, revision };
      case "loading":
        return { status: "loading" };
      case "unavailable":
        return { status: "unavailable", problem: catalogProblem };
      case "missing":
        return {
          ...done,
          revision,
          records: done.records.filter(
            ({ identity }) => identity !== farDone.identity,
          ),
        };
    }
  };
  const originalDependencies = dependenciesFor([
    nearDone,
    farDone,
    expiredDone,
    unlisted,
  ]);
  const workWith = (
    state: typeof catalog,
    dependencies = originalDependencies,
    revision = done.revision,
  ) =>
    makeMe.aPublishedWork
      .with({
        ...makeMe.aPublishedWork.of(source).at(revision).please(),
        done: catalogAt(state, revision),
        backlog: [
          makeMe.aWorkEntry.with({ ...consumer, dependencies }).please(),
        ],
      })
      .please();
  let failing = failFar;
  let failed = 0;
  let retries = 0;
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
      if (files.includes(farPath)) {
        if (holdFar) await pending;
        if (failing) {
          failed += 1;
          throw new Error("GitHub did not answer the Done body read.");
        }
      }
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
  const mounted = await mountIntentCiPage({
    work: workWith(catalog),
    retryReference: () => {
      retries += 1;
    },
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
    bodyRequestCount: () => asked.length,
    reads: (path: string) => asked.filter((file) => file === path).length,
    answered,
    failed: () => failed,
    restoreBodies: () => {
      failing = false;
    },
    retries: () => retries,
    projectCatalog: (state: typeof catalog, revision = done.revision) =>
      mounted.showWork(workWith(state, originalDependencies, revision)),
    projectUnavailableDependencies: () =>
      mounted.showWork(
        workWith(
          "ready",
          {
            status: "unavailable",
            problem:
              "The canonical record could not be read for dependency facts.",
          },
          "e1".repeat(20),
        ),
      ),
    projectReplacement: () =>
      mounted.showWork(
        workWith("ready", dependenciesFor([laterDone]), "e2".repeat(20)),
      ),
    laterPath: pathOf(laterDone),
    release,
    titlesThrough,
    pathsThrough,
    farPath,
  };
}
