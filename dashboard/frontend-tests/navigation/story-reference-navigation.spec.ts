import { expect, onTestFinished, test, vi } from "vitest";
import { page, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { renderStorySection } from "../../../Distribution/tests/support/published-seed.mjs";
import { destinationCueMs } from "../../src/destinationCue.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { boardReading, storyCard } from "./board-reading-page.ts";
import { longBacklog } from "./board-work.ts";
import { focus } from "./project-navigation-frame.ts";
import {
  canonicalRecord,
  detail,
  followReference,
  inspection,
  mountReferences,
  openDependencies,
  referenceNotice,
  showsReached,
} from "./story-reference-frame.ts";
import {
  canonicalTexts,
  consumer,
  filesAt,
  referenceWork,
  supplier,
} from "./story-reference-publication.ts";

const supplierFile = ".planning/seeds/B.md";
const supplierCard = storyCard(supplier.title);
const supplierDetail = detail(supplier.title);

function controlPageTime() {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout"],
    shouldAdvanceTime: true,
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });
}

async function showsReadingTop(card: Locator) {
  await expect
    .poll(() => {
      const element = card.element();
      const scroll = element.closest(".board-scroll");
      const heading = element
        .closest(".column")
        ?.querySelector(".column-header");
      if (!scroll || !heading)
        throw new Error("Expected a Board column with a sticky heading.");
      const top = element.getBoundingClientRect().top;
      const readingEdge =
        scroll.getBoundingClientRect().top +
        Number.parseFloat(getComputedStyle(scroll).scrollPaddingTop) +
        Number.parseFloat(getComputedStyle(element).scrollMarginTop);
      return (
        Math.abs(top - readingEdge) <= 1 &&
        top >= heading.getBoundingClientRect().bottom
      );
    })
    .toBe(true);
}

const cues = () => document.querySelectorAll(".story-card-destination-cue");

async function showsCue() {
  await expect.element(supplierCard).toHaveClass("story-card-destination-cue");
  expect([...cues()]).toEqual([supplierCard.element()]);
  const mark = getComputedStyle(supplierCard.element(), "::after");
  expect(mark.content).not.toBe("none");
  expect(mark.boxShadow).not.toBe("none");
  expect(mark.animationName).toBe("story-card-destination-cue");
}

async function finishCue() {
  vi.advanceTimersByTime(destinationCueMs);
  await expect
    .element(supplierCard)
    .not.toHaveClass("story-card-destination-cue");
  expect(cues()).toHaveLength(0);
  expect(getComputedStyle(supplierCard.element(), "::after").content).toBe(
    "none",
  );
}

function cueAnimation() {
  const animation = supplierCard
    .element()
    .getAnimations({ subtree: true })
    .find(
      (candidate) =>
        candidate instanceof CSSAnimation &&
        candidate.animationName === "story-card-destination-cue",
    );
  if (!animation || typeof animation.currentTime !== "number")
    throw new Error("Expected the card's CSS destination cue.");
  return animation;
}

test("a dependency opens its active story at the reading edge and restarts the cue without changing inspection or Highlight", async () => {
  controlPageTime();
  const initial = referenceWork({ revision: "b3".repeat(20) });
  const work = makeMe.aPublishedWork
    .with({ ...initial, backlog: [...initial.backlog, ...longBacklog] })
    .please();
  const files = canonicalTexts();
  files.set(
    supplierFile,
    renderStorySection(supplier, {
      goal: "Publish the detailed and reviewed endpoint contract for client readers. "
        .repeat(24)
        .trim(),
    }),
  );
  const frame = await mountReferences(work, {
    viewport: { width: 1280, height: 500 },
    detailFile: filesAt(files),
  });
  const address = location.href;
  await openDependencies();
  await followReference(supplier.title);
  await expect.element(supplierDetail).toBeVisible();
  await expect.element(supplierCard).toHaveFocus();
  expect(supplierCard.element().getBoundingClientRect().height).toBeGreaterThan(
    innerHeight,
  );
  await showsReadingTop(supplierCard);
  await showsCue();
  expect(document.querySelector(".story-card-selected")).toBeNull();
  await finishCue();
  await boardReading.expectStorySelection(supplierCard, false);
  expect(location.href).toBe(address);

  await supplierCard.getByRole("heading", { name: supplier.title }).click();
  await boardReading.expectStoryHighlight(supplierCard);
  await followReference(supplier.title);
  await showsCue();
  await showsReadingTop(supplierCard);
  await expect.element(supplierDetail).toBeVisible();

  vi.advanceTimersByTime(1000);
  const fading = cueAnimation();
  fading.pause();
  fading.currentTime = 1000;
  await fading.ready;
  const fadingOpacity = Number(
    getComputedStyle(supplierCard.element(), "::after").opacity,
  );
  expect(fadingOpacity).toBeGreaterThan(0);
  expect(fadingOpacity).toBeLessThan(1);
  await followReference(supplier.title);
  await showsCue();
  const restarted = cueAnimation();
  expect(restarted).not.toBe(fading);
  expect(restarted.currentTime).toBeLessThan(1000);
  expect(
    Number(getComputedStyle(supplierCard.element(), "::after").opacity),
  ).toBe(1);
  vi.advanceTimersByTime(1000);
  await showsCue();
  await finishCue();
  await boardReading.expectStoryHighlight(supplierCard);
  await expect.element(supplierDetail).toBeVisible();
  await expect.element(supplierCard).toHaveFocus();

  await expect
    .element(canonicalRecord(supplierCard))
    .toHaveAttribute(
      "href",
      `https://github.com/example/open-dough/blob/${work.revision}/${supplierFile}#b`,
    );
  await expect
    .element(canonicalRecord(supplierCard))
    .toHaveAttribute("target", "_blank");
  await inspection(supplierCard).click();
  const consumerInspect = inspection(storyCard(consumer.title));
  focus(consumerInspect);
  const revision = "c4".repeat(20);
  await expect.poll(frame.subscriptionCount).toBe(1);
  frame.queueSnapshot(
    makeMe.aPublishedWork.with({ ...work, revision }).please(),
  );
  frame.revisionChanged(revision);
  await expect
    .element(page.getByText(/Published work read at revision c4c4c4c/))
    .toBeVisible();
  await expect.element(supplierDetail).not.toBeInTheDocument();
  await expect.element(consumerInspect).toHaveFocus();
  frame.expectNoHostAction();
});

test("a reference reveals a story with a running accepted start while its protected inspection remains closed", async () => {
  controlPageTime();
  const work = referenceWork();
  const accepted = makeMe.anAcceptedAttempt.executing(supplier).please();
  const attempt = makeMe.anAttemptObservation
    .of(accepted)
    .owned(true)
    .running(true)
    .please();
  const answer = {
    ...makeMe.aMachineAnswer.answeringAttempts(attempt).please(),
    revision: "m".repeat(40),
  };
  const frame = await mountReferences(work, {
    detailFile: filesAt(canonicalTexts()),
    machine: { answer },
  });
  await expect.element(inspection(supplierCard)).toBeDisabled();

  await openDependencies();
  await followReference(supplier.title);
  await expect.element(supplierCard).toHaveFocus();
  await expect.element(supplierDetail).not.toBeInTheDocument();
  await expect.element(canonicalRecord(supplierCard)).toBeVisible();

  const record = makeMe.aLaunchRecord.executing(supplier).please();
  Object.assign(answer, {
    ...makeMe.aMachineAnswer.observingOpen(record).please(),
    revision: "e".repeat(40),
  });
  vi.advanceTimersByTime(checkIntervalMs);
  await expect.element(inspection(supplierCard)).toBeEnabled();
  frame.expectNoHostAction();
});

test("an identified active block with unreadable detail still opens with its existing read gap", async () => {
  const read = filesAt(canonicalTexts());
  const frame = await mountReferences(
    referenceWork({ revision: "b4".repeat(20) }),
    {
      detailFile: (...args) =>
        args[1] === supplierFile
          ? Promise.reject(
              new ReadProblem(`GitHub could not find ${supplierFile}.`),
            )
          : read(...args),
    },
  );
  await openDependencies();
  await followReference(supplier.title);
  const gap = supplierDetail
    .getByText(
      "The canonical record could not be read for preparation facts.",
      { exact: true },
    )
    .first();
  await expect.element(gap).toBeVisible();
  await showsReached(supplierCard);
  await expect.element(referenceNotice).toBeEmptyDOMElement();
  frame.expectNoHostAction();
});
