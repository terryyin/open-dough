// Pygardon, the third catalog project, as the session and recently done specs
// publish it: a backlog whose story with a session is listed last, below
// enough other stories that its card starts out of view, or, where a journey
// only moves to another project, one queued story.

import type { Page } from "@playwright/test";
import { describedBacklog } from "./describedRevisions.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

export const pygardonRepository = "terryyin/pygardon";

export const pygardonStory = {
  identity: "SEED-031#telegram-qr-diagnosis",
  title: "Correct the Telegram IBKR QR login's diagnosis and representations",
};

// Pygardon's stories above the one with a session.
const pygardonOthers = [...Array(12).keys()].map((index) => {
  const seed = `SEED-3${String(index).padStart(2, "0")}`;
  return makeMe.aBacklogEntry
    .with({
      identity: `${seed}#s`,
      title: `Pygardon's queued story ${String(index + 1)}`,
      href: `seeds/${seed}.md#s`,
    })
    .please();
});
export const pygardonBacklogTitles = [
  ...pygardonOthers.map(({ title }) => title),
  pygardonStory.title,
];

export const pygardonRevision = "e5".repeat(20);

export const pygardonBacklog = describedBacklog(
  makeMe.aRepository
    .withRevision("published", {
      backlog: {
        queued: [
          ...pygardonOthers,
          makeMe.aBacklogEntry
            .with({
              ...pygardonStory,
              href: "seeds/SEED-031.md#telegram-qr-diagnosis",
            })
            .please(),
        ],
      },
    })
    .please(),
);

// One queued story, "A Pygardon story", for a journey that only chooses
// Pygardon and sees its Backlog.
const onePygardonStory = describedBacklog(
  makeMe.aRepository
    .withRevision("published", {
      backlog: {
        queued: [
          makeMe.aBacklogEntry
            .with({
              identity: "SEED-301#s",
              title: "A Pygardon story",
              href: "seeds/SEED-301.md#s",
            })
            .please(),
        ],
      },
    })
    .please(),
);

export async function publishOnePygardonStory(page: Page) {
  const pygardon = await publishMovingOrigin(page, pygardonRepository);
  pygardon.push("e6".repeat(20), onePygardonStory);
}
