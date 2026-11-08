// @ts-check
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { direction } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  readyStoryState,
  storyA,
  storyB,
  storySeed,
} from "../../../../tests/support/queued-repository.mjs";
import { splitHref } from "../../dough-product-backlog/scripts/product-backlog-identity.mjs";

export function queuedRepositoryWithUnrefinedB2() {
  const sibling = makeMe.aBacklogEntry
    .with({ identity: "SEED-B#b2", href: "seeds/B.md#b2", title: "Story B2" })
    .please();
  const { path, anchor } = splitHref(sibling.href);
  const siblingSection = [
    "",
    `<a id="${anchor}"></a>`,
    "",
    `### ${sibling.title}`,
    "",
    `**Identity:** ${sibling.identity}`,
    "",
    "Execute B2 later.",
    "",
  ].join("\n");
  return queuedReadyRepository()
    .withRevision("queued", {
      backlog: { direction, queued: [storyA, storyB, sibling] },
      files: {
        [`.planning/${path}`]: storySeed(storyB, "Execute B.") + siblingSection,
      },
      storyStates: [readyStoryState(storyB)],
      message: "queue sibling B2",
    })
    .please();
}
