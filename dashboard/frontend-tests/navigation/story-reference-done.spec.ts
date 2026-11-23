import { expect, test } from "vitest";
import {
  farDone,
  laterDone,
  openDoneReferences,
} from "./story-reference-done-fixture.ts";
import {
  consumerCard,
  dependencySummary,
  farDestination,
  followReference,
  openDependencies,
  recent,
  reference,
  referenceNotice,
  showsDoneEntries,
  showsReached,
} from "./story-reference-done-page.ts";

test("a failed Done detail reveals its identified gap and the existing Done retry recovers without reading older stories", async () => {
  const fixture = await openDoneReferences({ failFar: true });
  await showsDoneEntries(fixture.titlesThrough(10));
  await openDependencies();
  await expect.poll(fixture.failed).toBe(1);
  await followReference(farDone.identity);
  const bodyGap = farDestination.getByText(
    "This done story could not be read.",
    { exact: true },
  );
  await expect.element(bodyGap).toBeVisible();
  await expect.element(farDestination).toHaveAccessibleName(farDone.identity);
  await showsReached(farDestination);
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  expect(fixture.failed()).toBe(2);

  fixture.restoreBodies();
  await recent.getByRole("button", { name: "Retry done stories" }).click();
  await showsDoneEntries(fixture.titlesThrough(27));
  await expect.element(bodyGap).not.toBeInTheDocument();
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(27, true));
  expect(fixture.reads(fixture.farPath)).toBe(3);
  await followReference(farDone.identity);
  await showsReached(farDestination);
});

test("a dependency disclosure replaced after unavailable facts waits for opening before reading its new supplier title", async () => {
  const fixture = await openDoneReferences();
  await showsDoneEntries(fixture.titlesThrough(10));
  await openDependencies();
  await expect.element(reference(farDone.title)).toBeVisible();

  await fixture.projectUnavailableDependencies();
  await expect
    .element(consumerCard.getByText(/Dependency facts unavailable/))
    .toBeVisible();
  await expect.element(dependencySummary(4)).not.toBeInTheDocument();

  await fixture.projectReplacement();
  await expect.element(dependencySummary(1)).toBeVisible();
  expect(dependencySummary(1).element().parentElement).not.toHaveAttribute(
    "open",
  );
  expect(fixture.reads(fixture.laterPath)).toBe(0);

  await openDependencies("pointer", 1);
  await expect.element(reference(laterDone.title)).toBeVisible();
  expect(fixture.reads(fixture.laterPath)).toBe(1);
});
