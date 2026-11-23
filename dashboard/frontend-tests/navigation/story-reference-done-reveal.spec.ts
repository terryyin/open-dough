import { expect, test } from "vitest";
import { boardReading } from "./board-reading-page.ts";
import { reducedBoardMotion } from "./board-mount.ts";
import {
  farDone,
  nearDone,
  openDoneReferences,
} from "./story-reference-done-fixture.ts";
import {
  destinationCues,
  farDestination,
  farDestinationReading,
  farReferencePending,
  followReference,
  openDependencies,
  reference,
  referenceNotice,
  showsDoneEntries,
  showsReached,
  showsReadingTop,
} from "./story-reference-done-page.ts";

test("a Done reference without sessions reveals exactly through its existing destination and keeps a longer range", async () => {
  const pageLocation = window.location.href;
  const fixture = await openDoneReferences();
  const recent = boardReading.column("Recently done");
  await showsDoneEntries(fixture.titlesThrough(10));
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(10));

  await openDependencies();
  await expect.element(reference(farDone.title)).toBeVisible();
  const near = recent.getByRole("article", {
    name: nearDone.title,
    exact: true,
  });
  await followReference(nearDone.title);
  await showsReached(near);
  await showsReadingTop(near);
  await showsDoneEntries(fixture.titlesThrough(10));
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(10, true));

  await followReference(farDone.title);
  await showsReached(farDestination);
  await showsDoneEntries(fixture.titlesThrough(27));
  await expect
    .element(recent.getByText("Showing 27 of 35 entries.", { exact: true }))
    .toBeVisible();
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(27, true));

  await followReference(farDone.title);
  await showsReached(farDestination);
  await followReference(nearDone.title);
  await showsReached(near);
  await showsDoneEntries(fixture.titlesThrough(27));
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(27, true));
  expect(
    recent.element().querySelectorAll("[data-shows-session]"),
  ).toHaveLength(0);
  expect(window.location.href).toBe(pageLocation);
  await expect.element(referenceNotice).toBeEmptyDOMElement();
});

test("a delayed Done detail keeps the destination pending and keyboard activation reaches it at a narrow reduced-motion viewport", async () => {
  await reducedBoardMotion();
  const fixture = await openDoneReferences({
    holdFar: true,
    viewport: { width: 390, height: 740 },
  });
  await showsDoneEntries(fixture.titlesThrough(10));
  await openDependencies("touch");
  await followReference(farDone.identity, "keyboard");
  await expect.element(farDestinationReading).toBeVisible();
  await expect.element(farDestination).not.toHaveFocus();
  await expect.element(farReferencePending).toBeVisible();
  await expect
    .poll(fixture.requestedBodies)
    .toEqual(fixture.pathsThrough(27, true));

  fixture.release();
  await expect.element(reference(farDone.title)).toBeInTheDocument();
  await expect.element(farDestination).toHaveAccessibleName(farDone.title);
  await showsReached(farDestination);
  await expect
    .element(farDestination)
    .toHaveClass("story-card-destination-cue");
  expect(destinationCues()).toEqual([farDestination.element()]);
  const mark = getComputedStyle(farDestination.element(), "::after");
  expect(mark.content).not.toBe("none");
  expect(mark.boxShadow).not.toBe("none");
  expect(mark.animationName).toBe("none");
  await boardReading.expectStorySelection(farDestination, false);
  await expect.poll(() => destinationCues().length, { timeout: 3000 }).toBe(0);
  expect(getComputedStyle(farDestination.element(), "::after").content).toBe(
    "none",
  );
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  await showsDoneEntries(fixture.titlesThrough(27));
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(27, true));
});
