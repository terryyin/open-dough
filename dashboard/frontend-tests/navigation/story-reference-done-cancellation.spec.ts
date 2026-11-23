import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { farDone, openDoneReferences } from "./story-reference-done-fixture.ts";
import {
  destinationCues,
  dismissReference,
  farDestination,
  farDestinationReading,
  farReferencePending,
  followReference,
  latestDone,
  openDependencies,
  ownAction,
  ownDetail,
  pointerDownOn,
  referenceNotice,
  showsDoneEntries,
} from "./story-reference-done-page.ts";

async function followHeldFarReference() {
  const fixture = await openDoneReferences({ holdFar: true });
  await showsDoneEntries(fixture.titlesThrough(10));
  await openDependencies();
  await followReference(farDone.identity);
  await expect.element(farDestinationReading).toBeVisible();
  await expect.element(farReferencePending).toBeVisible();
  await expect
    .poll(fixture.requestedBodies)
    .toEqual(fixture.pathsThrough(27, true));
  expect(fixture.answered).not.toContain(fixture.farPath);
  return fixture;
}

test("a developer's later move or latest-ten choice supersedes a pending Done reference", async () => {
  const fixture = await followHeldFarReference();
  await ownAction.click();
  await expect.element(ownAction).toHaveFocus();
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  await expect.element(ownDetail).toBeVisible();

  await followReference(farDone.identity);
  await expect.element(farReferencePending).toBeVisible();
  await latestDone.click();
  await showsDoneEntries(fixture.titlesThrough(10));
  const keptFocus = document.activeElement;
  fixture.release();
  await expect
    .poll(() => fixture.answered.includes(fixture.farPath))
    .toBe(true);

  await showsDoneEntries(fixture.titlesThrough(10));
  await expect.element(farDestination).not.toBeInTheDocument();
  await expect.element(latestDone).not.toBeInTheDocument();
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  await expect.element(ownDetail).toBeVisible();
  expect(document.activeElement).toBe(keptFocus);
  expect(destinationCues()).toHaveLength(0);
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(27, true));
});

test("pointer down stops a pending Done jump while its data arrives and the pointer's chosen action still clicks", async () => {
  const fixture = await followHeldFarReference();
  const pointerUp = await pointerDownOn(ownAction);
  try {
    fixture.release();
    await expect.element(farDestination).toHaveAccessibleName(farDone.title);
    await expect.element(farDestination).not.toHaveFocus();
    await expect.element(ownAction).toHaveFocus();
    await expect.element(ownAction).toHaveAccessibleName("Inspect story");
    await expect.element(ownDetail).not.toBeInTheDocument();
    await expect.element(farReferencePending).toBeVisible();
    expect(destinationCues()).toHaveLength(0);
  } finally {
    await pointerUp();
  }
  await expect.element(ownDetail).toBeVisible();
  await expect.element(ownAction).toHaveFocus();
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  await showsDoneEntries(fixture.titlesThrough(27));
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(27, true));
});

test("Tab away from a pending reference's Dismiss action supersedes its jump before held Done detail arrives", async () => {
  const fixture = await followHeldFarReference();
  await expect.element(dismissReference).toBeVisible();
  (dismissReference.element() as HTMLElement).focus();
  await userEvent.tab();
  const keptFocus = document.activeElement;
  expect(keptFocus).not.toBe(document.body);
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  fixture.release();
  await expect.element(farDestination).toHaveAccessibleName(farDone.title);
  await expect.element(farDestination).not.toHaveFocus();
  expect(document.activeElement).toBe(keptFocus);
  expect(destinationCues()).toHaveLength(0);
  await showsDoneEntries(fixture.titlesThrough(27));
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(27, true));
});
