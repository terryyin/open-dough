import { expect, test } from "vitest";
import {
  catalogProblem,
  expiredDone,
  farDone,
  openDoneReferences,
  unlisted,
} from "./story-reference-done-fixture.ts";
import {
  farDestination,
  farReferencePending,
  followReference,
  openDependencies,
  ownAction,
  ownDetail,
  recent,
  reference,
  referenceNotice,
  showsDoneEntries,
  showsReached,
} from "./story-reference-done-page.ts";

const unavailable = (identity: string) =>
  referenceNotice.getByText(
    `${identity} is unavailable in Open Dough's dashboard.`,
    { exact: true },
  );
const catalogGap = referenceNotice.getByText(
  `Could not read Open Dough to find ${farDone.identity}. ${catalogProblem}`,
  { exact: true },
);

test("expired and unlisted references remain unavailable without fabricated blocks or history reads", async () => {
  const fixture = await openDoneReferences();
  await showsDoneEntries(fixture.titlesThrough(10));
  await openDependencies();
  await expect.element(reference(expiredDone.title)).toBeVisible();
  const before = fixture.bodyRequestCount();
  // Only the expired supplier has a catalogued title, and neither can extend Recently done.
  for (const [entry, label] of [
    [expiredDone, expiredDone.title],
    [unlisted, unlisted.identity],
  ] as const) {
    await followReference(label);
    await expect.element(unavailable(entry.identity)).toBeVisible();
    await expect
      .element(
        recent.getByRole("article", {
          name: new RegExp(`^(?:${entry.identity}|${entry.title})$`),
        }),
      )
      .not.toBeInTheDocument();
    expect(fixture.bodyRequestCount()).toBe(before);
  }
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(10, true));
  await ownAction.click();
  await expect.element(ownDetail).toBeVisible();
});

test("Done catalog loading and failure stay distinct from absence and story retry reaches the recovered catalog", async () => {
  const fixture = await openDoneReferences({ catalog: "loading" });
  await openDependencies();
  await followReference(farDone.identity);
  await expect.element(farReferencePending).toBeVisible();
  await expect.element(unavailable(farDone.identity)).not.toBeInTheDocument();
  expect(fixture.requestedBodies()).toEqual([]);

  await fixture.projectCatalog("unavailable");
  await expect.element(catalogGap).toBeVisible();
  await expect.element(unavailable(farDone.identity)).not.toBeInTheDocument();
  await expect
    .element(recent.getByText(catalogProblem, { exact: true }))
    .toBeVisible();

  await referenceNotice
    .getByRole("button", { name: "Retry story reference" })
    .click();
  expect(fixture.retries()).toBe(1);
  await fixture.projectCatalog("ready");
  await expect.element(farDestination).toHaveAccessibleName(farDone.title);
  await showsReached(farDestination);
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  expect(fixture.requestedBodies()).toEqual(fixture.pathsThrough(27, true));
});

async function supersedeReference(
  catalog: "missing" | "unavailable",
  expectedNotice: typeof catalogGap,
) {
  const fixture = await openDoneReferences({ catalog });
  await openDependencies();
  await followReference(farDone.identity);
  await expect.element(expectedNotice).toBeVisible();
  await ownAction.click();
  await expect.element(ownAction).toHaveFocus();
  await expect.element(referenceNotice).toBeEmptyDOMElement();

  await fixture.projectCatalog(
    "ready",
    catalog === "missing" ? "e3".repeat(20) : undefined,
  );
  await showsDoneEntries(fixture.titlesThrough(10));
  await expect
    .element(recent.getByText("35 entries", { exact: true }))
    .toBeVisible();
  await expect.element(farDestination).not.toBeInTheDocument();
  await expect.element(ownDetail).toBeVisible();
  await expect.element(ownAction).toHaveFocus();
  await expect.element(referenceNotice).toBeEmptyDOMElement();
}

test("a later inspection supersedes an unavailable Done reference when its catalog subsequently heals", async () => {
  await supersedeReference("missing", unavailable(farDone.identity));
});

test("a later inspection supersedes a failed Done reference when its catalog subsequently heals", async () => {
  await supersedeReference("unavailable", catalogGap);
});
