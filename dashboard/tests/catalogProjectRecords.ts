// Published catalog sources and the work each repository holds at its pinned revision.

import { posix } from "node:path";
import type { renderEntry } from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import {
  identityLine,
  splitHref,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderPublishedBacklog } from "../../tests/support/published-backlog.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { PublishedRevision } from "./publishedFiles.ts";

type BacklogEntry = Parameters<typeof renderEntry>[0];

export type CatalogPublication = PublishedSource & PublishedRevision;

function publishedAt(
  source: PublishedSource,
  revision: string,
  {
    taken,
    queued,
    direction,
    purpose,
  }: {
    taken: BacklogEntry;
    queued: BacklogEntry;
    direction: string;
    purpose: string;
  },
): CatalogPublication {
  const backlogDirectory = posix.dirname(source.backlogPath);
  const queuedHome = splitHref(queued.href);
  const files = {
    [source.backlogPath]: renderPublishedBacklog({
      taken: [taken],
      queued: [queued],
      direction,
    }),
    [posix.join(backlogDirectory, taken.href)]: `# Taken story

${identityLine(taken.identity)}

Whole-document correction home without a story-state block.
`,
    [posix.join(backlogDirectory, queuedHome.path)]: `# Queued seed

<a id="${queuedHome.anchor}"></a>

### Queued story

${identityLine(queued.identity)}

**Goal:** ${purpose}
`,
  };
  const at = makeMe.aPublishedRevision.with({ revision, files }).please();
  return { ...source, ...at };
}

const openDough = publishedAt(
  makeMe.aPublishedSource
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: "terryyin/open-dough",
      ref: "main",
    })
    .please(),
  "0d".repeat(20),
  {
    taken: makeMe.aBacklogEntry
      .with({
        title: "Open Dough's own taken story",
        identity: "slice-plans/301-taken",
        href: "slice-plans/301-taken/PLAN.md",
      })
      .please(),
    queued: makeMe.aBacklogEntry
      .with({
        title: "Open Dough's own queued story",
        identity: "SEED-301#queued",
        href: "seeds/SEED-301-queued.md#queued",
      })
      .please(),
    direction: "Show Open Dough's own published direction through local gh.",
    purpose: "Read Open Dough's queued purpose at its own revision.",
  },
);

const doughnut = publishedAt(
  makeMe.aPublishedSource
    .with({
      id: "doughnut",
      label: "Doughnut",
      repository: "nerds-odd-e/doughnut",
      ref: "main",
    })
    .please(),
  "d7".repeat(20),
  {
    taken: makeMe.aBacklogEntry
      .with({
        title: "Doughnut's own taken story",
        identity: "slice-plans/302-taken",
        href: "slice-plans/302-taken/PLAN.md",
      })
      .please(),
    queued: makeMe.aBacklogEntry
      .with({
        title: "Doughnut's own queued story",
        identity: "SEED-302#queued",
        href: "seeds/SEED-302-queued.md#queued",
      })
      .please(),
    direction: "Show Doughnut's own published direction through local gh.",
    purpose: "Read Doughnut's queued purpose at its own revision.",
  },
);

const pygardon = publishedAt(
  makeMe.aPublishedSource
    .with({
      id: "pygardon",
      label: "Pygardon",
      repository: "terryyin/pygardon",
      ref: "main",
    })
    .please(),
  "c1".repeat(20),
  {
    taken: makeMe.aBacklogEntry
      .with({
        title: "Pygardon's own taken story",
        identity: "slice-plans/303-taken",
        href: "slice-plans/303-taken/PLAN.md",
      })
      .please(),
    queued: makeMe.aBacklogEntry
      .with({
        title: "Pygardon's own queued story",
        identity: "SEED-303#queued",
        href: "seeds/SEED-303-queued.md#queued",
      })
      .please(),
    direction: "Show Pygardon's own published direction through local gh.",
    purpose: "Read Pygardon's queued purpose at its own revision.",
  },
);

const terryTalks = publishedAt(
  makeMe.aPublishedSource
    .with({
      id: "terry-talks",
      label: "Terry Talks",
      repository: "terryyin/terry-talks",
      ref: "master",
    })
    .please(),
  "a4".repeat(20),
  {
    taken: makeMe.aBacklogEntry
      .with({
        title: "Terry Talks's own taken story",
        identity: "slice-plans/304-taken",
        href: "slice-plans/304-taken/PLAN.md",
      })
      .please(),
    queued: makeMe.aBacklogEntry
      .with({
        title: "Terry Talks's own queued story",
        identity: "SEED-304#queued",
        href: "seeds/SEED-304-queued.md#queued",
      })
      .please(),
    direction: "Show Terry Talks's own published direction through local gh.",
    purpose: "Read Terry Talks's queued purpose at its own revision.",
  },
);

export const catalogPublications = {
  openDough,
  doughnut,
  pygardon,
  terryTalks,
};
