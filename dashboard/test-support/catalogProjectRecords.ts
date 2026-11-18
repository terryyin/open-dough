// Published catalog sources and the work each repository holds at its pinned
// revision: one Taken story planned in a whole-document correction home, and
// one queued story whose seed names its purpose.

import { posix } from "node:path";
import type { renderEntry } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import {
  identityLine,
  splitHref,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { renderStorySection } from "../../Distribution/tests/support/published-seed.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import { describedRevision } from "./describedRevisions.ts";
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
  const queuedHome = splitHref(queued.href);
  const at = describedRevision(
    makeMe.aRepository
      .withRevision("pinned", {
        backlog: { taken: [taken], queued: [queued], direction },
        // The seed prose the dashboard reads.
        files: {
          [posix.join(".planning", taken.href)]: `# ${taken.title}

${identityLine(taken.identity)}

Whole-document correction home without a story-state block.
`,
          [posix.join(".planning", queuedHome.path)]: `# Queued seed

${renderStorySection(queued, { goal: purpose })}`,
        },
      })
      .please(),
    revision,
  );
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
