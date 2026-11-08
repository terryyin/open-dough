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

export const storyB2 = makeMe.aBacklogEntry
  .with({ identity: "SEED-B#b2", href: "seeds/B.md#b2", title: "Story B2" })
  .please();

/**
 * Seed B holding story B with `storyB` as its body, followed by B's
 * unfinished sibling B2 with `storyB2` as its body.
 * @param {{ storyB?: string, storyB2?: string }} [bodies]
 */
export function seedWithSiblingB2({
  storyB: bodyB = "Execute B.",
  storyB2: bodyB2 = "Execute B2 later.",
} = {}) {
  const { path, anchor } = splitHref(storyB2.href);
  const siblingSection = [
    "",
    `<a id="${anchor}"></a>`,
    "",
    `### ${storyB2.title}`,
    "",
    `**Identity:** ${storyB2.identity}`,
    "",
    bodyB2,
    "",
  ].join("\n");
  return { [`.planning/${path}`]: storySeed(storyB, bodyB) + siblingSection };
}

/**
 * `base`, which queues Ready A and B, with B's unfinished sibling B2 queued
 * after them in seed B while B stays Ready.
 * @param {ReturnType<typeof queuedReadyRepository>} [base]
 */
export function queuedRepositoryWithSiblingB2(base = queuedReadyRepository()) {
  return base.withRevision("queued", {
    backlog: { direction, queued: [storyA, storyB, storyB2] },
    files: seedWithSiblingB2(),
    storyStates: [readyStoryState(storyB)],
    message: "queue sibling B2",
  });
}

export function queuedRepositoryWithUnrefinedB2() {
  return queuedRepositoryWithSiblingB2().please();
}
