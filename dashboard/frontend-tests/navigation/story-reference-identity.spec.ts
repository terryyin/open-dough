import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { reducedBoardMotion } from "./board-mount.ts";
import { storyCard } from "./board-reading-page.ts";
import { portrait, useTouchScreen } from "./board-touch-page.ts";
import { projectRadio, route } from "./project-navigation-frame.ts";
import {
  detail,
  followReference,
  mountReferences,
  openDependencies,
  reference,
  showsReached,
} from "./story-reference-frame.ts";
import {
  canonicalTexts,
  filesAt,
  referenceWork,
  supplier,
} from "./story-reference-publication.ts";
import { revealsOnPage } from "./story-url-frame.ts";

test("distinct stories in one seed follow their recorded identities by keyboard and touch at a narrow reduced-motion viewport", async () => {
  const second = makeMe.aBacklogEntry
    .with({
      identity: "SEED-B#second",
      href: "seeds/B.md#second",
      title: "Second story in seed B",
    })
    .please();
  await reducedBoardMotion();
  await useTouchScreen();
  const reveals = revealsOnPage();
  const frame = await mountReferences(
    referenceWork({
      alsoWaitingOn: second,
      supplierTaken: true,
      revision: "b2".repeat(20),
    }),
    {
      viewport: portrait,
      detailFile: filesAt(canonicalTexts(supplier, second)),
    },
  );
  await openDependencies(3, "touch");
  await followReference(second.title, "keyboard");
  await expect.element(detail(second.title)).toBeVisible();
  await showsReached(storyCard(second.title));
  await expect.element(detail(supplier.title)).not.toBeInTheDocument();

  await followReference(supplier.title, "touch");
  await expect.element(detail(supplier.title)).toBeVisible();
  await showsReached(storyCard(supplier.title));
  await expect.element(detail(second.title)).toBeVisible();
  // Column paging also scrolls the card without an explicit motion setting.
  for (const title of [second.title, supplier.title]) {
    const motion = reveals()
      .filter((call) => call.title === title && call.behavior !== undefined)
      .map((call) => call.behavior);
    expect(new Set(motion), title).toEqual(new Set(["auto"]));
  }
  frame.expectNoHostAction();
});

test("each project's rendered pinned reference opens its own telling of the same identity", async () => {
  const telling = makeMe.aBacklogEntry
    .with({
      identity: supplier.identity,
      title: "Pygardon selected story",
      href: "seeds/SEED-120-release-readiness.md#story-checked-artifact-eligibility",
    })
    .please();
  const pygardon = referenceWork({
    supplierStory: telling,
    project: { id: "pygardon", label: "Pygardon", revision: "c1".repeat(20) },
  });
  const openDoughRead = filesAt(canonicalTexts());
  const pygardonRead = filesAt(canonicalTexts(telling));
  const frame = await mountReferences(referenceWork(), {
    otherWork: [pygardon],
    detailFile: (...args) =>
      args[0].id === "pygardon"
        ? pygardonRead(...args)
        : openDoughRead(...args),
  });
  await openDependencies();
  await followReference(supplier.title);
  await expect.element(storyCard(supplier.title)).toHaveFocus();

  await projectRadio("Pygardon").click();
  await expect.element(storyCard(telling.title)).toBeVisible();
  await openDependencies();
  await expect
    .element(reference(telling.title))
    .toHaveAttribute(
      "href",
      `https://github.com/example/pygardon/blob/${pygardon.revision}/.planning/seeds/SEED-120-release-readiness.md#story-checked-artifact-eligibility`,
    );
  await followReference(telling.title);
  await expect.element(detail(telling.title)).toBeVisible();
  await showsReached(storyCard(telling.title));
  await expect.element(storyCard(supplier.title)).not.toBeInTheDocument();
  expect(route().get("project")).toBe("pygardon");
  frame.expectNoHostAction();
});
