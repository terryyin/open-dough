import { expect, onTestFinished, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ReadProblem } from "../../src/readProblem.ts";
import { holdPublishedSnapshot } from "./board-frame-observation-supply.ts";
import { storyCard } from "./board-reading-page.ts";
import {
  projectRadio,
  pygardon,
  readsProjectBoard,
} from "./project-navigation-frame.ts";
import {
  consumerCard,
  detail,
  followReference,
  inspection,
  mountReferences,
  openDependencies,
  reference,
  referenceNotice,
  retryReference,
  showsReached,
} from "./story-reference-frame.ts";
import {
  canonicalTexts,
  filesAt,
  later,
  pinnedStoryEntry,
  referenceWork,
} from "./story-reference-publication.ts";

const absent = "SEED-C#c is unavailable in Open Dough's dashboard.";
const reading = "Reading Open Dough to find SEED-C#c…";
const failed = "Could not read Open Dough to find SEED-C#c.";
const destination = storyCard(later.title);
const destinationDetail = detail(later.title);

async function missingReference(otherWork = [pygardon]) {
  const work = referenceWork();
  const frame = await mountReferences(work, {
    otherWork,
    detailFile: filesAt(canonicalTexts()),
  });
  const status = referenceNotice.element();
  expect(status).toBeEmptyDOMElement();
  await openDependencies();
  await expect.element(reference(later.identity)).toBeVisible();
  await followReference(later.identity);
  await expect
    .element(referenceNotice.getByText(absent, { exact: true }))
    .toBeVisible();
  expect(referenceNotice.element()).toBe(status);
  const revision = "c3".repeat(20);
  const next = { ...work, revision };
  const published = makeMe.aPublishedWork
    .with({
      ...next,
      backlog: [...work.backlog, pinnedStoryEntry(later, next)],
    })
    .please();
  return { frame, published, status };
}

test("one live region distinguishes missing, reading and failed references and retry reaches a newly published block", async () => {
  const { frame, published, status } = await missingReference();
  await expect.element(inspection(consumerCard)).toBeEnabled();
  let fail: (problem: Error) => void = () => {};
  const answer = new Promise<never>((...[, reject]) => {
    fail = reject;
  });
  onTestFinished(() => {
    fail(new Error("Release the held failed snapshot."));
  });
  frame.queueSnapshot(() => answer);
  await retryReference.click();
  await expect
    .element(referenceNotice.getByText(reading, { exact: true }))
    .toBeVisible();
  expect(referenceNotice.element()).toBe(status);
  await expect.element(destination).not.toBeInTheDocument();
  fail(new ReadProblem("GitHub could not find the backlog."));
  await expect
    .element(referenceNotice.getByText(failed, { exact: false }))
    .toBeVisible();
  await expect.element(referenceNotice).not.toHaveTextContent("unavailable");
  expect(referenceNotice.element()).toBe(status);

  frame.queueSnapshot(published);
  await retryReference.click();
  await expect.element(destinationDetail).toBeVisible();
  await showsReached(destination);
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  expect(referenceNotice.element()).toBe(status);
  frame.expectNoHostAction();
});

test("leaving during a pending reference prevents the delayed read from moving focus or opening inspection", async () => {
  const { frame, published } = await missingReference();
  const held = holdPublishedSnapshot(published);
  let signal: AbortSignal | undefined;
  frame.queueSnapshot((received) => {
    signal = received;
    return held.snapshot;
  });
  await retryReference.click();
  await expect
    .element(referenceNotice.getByText(reading, { exact: true }))
    .toBeVisible();
  await expect.poll(() => signal?.aborted).toBe(false);
  const project = projectRadio("Pygardon");
  await project.click();
  await expect.element(project).toBeChecked();
  await expect.poll(() => signal?.aborted).toBe(true);
  held.release();
  await held.snapshot;
  await readsProjectBoard(pygardon);
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  await expect
    .element(page.getByRole("region", { name: /^Detail for / }))
    .not.toBeInTheDocument();
  await expect.element(destination).not.toBeInTheDocument();
  await expect.element(project).toHaveFocus();
  frame.expectNoHostAction();
});

test("choosing another inspection during a pending reference keeps it when the destination arrives", async () => {
  const { frame, published } = await missingReference([]);
  const held = holdPublishedSnapshot(published);
  frame.queueSnapshot(held.snapshot);
  await retryReference.click();
  await expect
    .element(referenceNotice.getByText(reading, { exact: true }))
    .toBeVisible();
  const action = inspection(consumerCard);
  await action.click();
  const ownDetail = detail("Story A");
  await expect.element(ownDetail).toBeVisible();
  held.release();
  await expect.element(destination).toBeVisible();
  await expect.element(destinationDetail).not.toBeInTheDocument();
  await expect.element(ownDetail).toBeVisible();
  await expect.element(action).toHaveFocus();
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  frame.expectNoHostAction();
});
