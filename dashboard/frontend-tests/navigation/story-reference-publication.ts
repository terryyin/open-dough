import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { renderStorySection } from "../../../Distribution/tests/support/published-seed.mjs";
import {
  readStoryDependencies,
  updateStoryDependency,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs";
import type { PublishedObservationReadSource } from "../../src/publishedObservationReadSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { boardWork } from "./board-work.ts";

export const consumer = makeMe.aBacklogEntry
  .with({ identity: "SEED-A#a", href: "seeds/A.md#a", title: "Story A" })
  .please();
export const supplier = makeMe.aBacklogEntry
  .with({ identity: "SEED-B#b", href: "seeds/B.md#b", title: "Story B" })
  .please();
export const later = makeMe.aBacklogEntry
  .with({ identity: "SEED-C#c", href: "seeds/C.md#c", title: "Story C" })
  .please();

type Story = typeof supplier;

export function pinnedStoryEntry(
  { identity, title, href }: Story,
  { source, revision }: Pick<PublishedWork, "source" | "revision">,
) {
  return makeMe.aWorkEntry
    .with({
      identity,
      title,
      canonical: {
        kind: "snapshot",
        recorded: href,
        url: `https://github.com/${source.repository}/blob/${revision}/.planning/${href}`,
        revision,
      },
    })
    .please();
}

export function referenceWork({
  supplierStory = supplier,
  alsoWaitingOn,
  supplierTaken = false,
  project,
  revision = project?.revision ?? "a".repeat(40),
}: {
  supplierStory?: Story;
  alsoWaitingOn?: Story;
  supplierTaken?: boolean;
  project?: { id: string; label: string; revision: string };
  revision?: string;
} = {}) {
  const work = boardWork([], { ...project, revision, taken: [] });
  const consumers = [pinnedStoryEntry(consumer, work)];
  if (alsoWaitingOn !== undefined)
    consumers.push(pinnedStoryEntry(alsoWaitingOn, work));
  const supplierEntry = pinnedStoryEntry(supplierStory, work);
  return makeMe.aPublishedWork
    .with({
      ...work,
      backlog: supplierTaken ? consumers : [...consumers, supplierEntry],
      taken: supplierTaken ? [supplierEntry] : [],
    })
    .please();
}

export function canonicalTexts(
  supplierStory = supplier,
  alsoWaitingOn?: Story,
) {
  const agreements = [
    makeMe.aSupplierAgreement
      .with({ supplier: supplierStory, state: "waiting" })
      .please(),
    makeMe.aSupplierAgreement
      .with({
        supplier: later,
        state: "decision-needed",
        decision: "Which compatibility behavior should we promise?",
      })
      .please(),
  ];
  if (alsoWaitingOn !== undefined) {
    agreements.push(
      makeMe.aSupplierAgreement
        .with({
          supplier: alsoWaitingOn,
          state: "waiting",
        })
        .please(),
    );
  }
  const source = agreements.reduce((draft, agreement) => {
    const updated: unknown = updateStoryDependency(draft, {
      identity: consumer.identity,
      href: consumer.href,
      dependency: agreement,
      expectedBasis: readStoryDependencies(draft, consumer.href).basis,
    }).source;
    if (typeof updated !== "string")
      throw new Error("The dependency fixture could not be written.");
    return updated;
  }, renderStorySection(consumer));
  const files = new Map([
    [".planning/seeds/A.md", source],
    [".planning/seeds/C.md", renderStorySection(later)],
  ]);
  const supplierPath = supplierStory.href.split("#")[0];
  files.set(
    `.planning/${supplierPath}`,
    renderStorySection(supplierStory, {
      goal: "Publish the shared endpoint contract.",
    }) + (alsoWaitingOn === undefined ? "" : renderStorySection(alsoWaitingOn)),
  );
  return files;
}

export function filesAt(
  files: ReadonlyMap<string, string>,
): PublishedObservationReadSource["readDetailFile"] {
  return (...[, path]) => {
    const text = files.get(path);
    return text === undefined
      ? Promise.reject(new Error(`No published file fixture for ${path}.`))
      : Promise.resolve(text);
  };
}
