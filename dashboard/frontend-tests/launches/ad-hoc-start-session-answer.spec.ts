import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { page, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ProjectActions } from "../../src/ProjectActions.tsx";
import "../../src/side-panel.css";
import type { LaunchAttempt } from "../../src/launchAttempts.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { adHocLaunches, startSession } from "./ad-hoc-launch-page.ts";
import {
  box,
  controlsAreReachable,
  noSidewaysScroll,
  phone,
  resizeLaunchViewport,
  splitWords,
  textFitsViewport,
  touch,
} from "./launch-layout-page.ts";

const revision = "a".repeat(40);
const direction = "Keep the launch proof readable.";
function projectActionPart(selector: string) {
  const part = document.querySelector(selector);
  if (!part) throw new Error(`Missing project action part ${selector}`);
  return page.elementLocator(part);
}
const row = () => projectActionPart(".project-actions");
const end = () => projectActionPart(".project-actions-end");
const directionHeading = page.getByRole("heading", {
  name: "Near-future direction",
});
const directionToggle = () =>
  projectActionPart(".project-actions .direction summary");
const help = page.getByRole("button", { name: "Preparation badge legend" });

function projectActions(project: PublishedSource, presented = vi.fn()) {
  const launches = { ...adHocLaunches(), feedbackMaintenance: undefined };
  const work = makeMe.aPublishedWork
    .with({
      ...makeMe.aPublishedWork.of(project).at(revision).please(),
      direction,
      backlog: [
        {
          title: "Keep launch proof readable",
          identity: "SEED-1#launch-proof",
          canonical: {
            kind: "snapshot",
            recorded: "seeds/SEED-1.md#launch-proof",
            url: "https://example.test/SEED-1.md#launch-proof",
            revision,
          },
          preparation: { status: "loading" },
        },
      ],
    })
    .please();
  return {
    launches,
    view: ({ source = project, hidden = false, hasWork = true } = {}) =>
      createElement(
        "div",
        { className: "page-column" },
        createElement(ProjectActions, {
          source,
          work: hasWork ? work : undefined,
          launches,
          hidden,
          presentTerminal: presented,
        }),
      ),
  };
}

test("Start session is opposite the direction, beside preparation help, named for the selected project and hidden with its roster", async () => {
  const project = makeMe.aPublishedSource.openDough.please();
  const otherProject = makeMe.aPublishedSource.pygardon.please();
  const actions = projectActions(project);
  const { rerender } = await mountComponent(actions.view(), {
    viewport: { width: 1000, height: 720 },
  });
  const start = startSession(project.label);
  await expect.element(start).toHaveTextContent("Start session");
  await expect.element(start).toBeEnabled();
  const startBox = box(start);
  const helpBox = box(help);
  expect(startBox.left).toBeGreaterThan(box(directionToggle()).right);
  expect(startBox.right).toBeLessThanOrEqual(helpBox.left + 1);
  expect(
    Math.abs(
      startBox.top + startBox.height / 2 - (helpBox.top + helpBox.height / 2),
    ),
  ).toBeLessThan(startBox.height);

  rerender(actions.view({ source: otherProject }));
  await expect.element(startSession(otherProject.label)).toBeVisible();
  await expect.element(start).not.toBeInTheDocument();

  rerender(actions.view({ source: otherProject, hidden: true }));
  await expect
    .element(startSession(otherProject.label))
    .not.toBeInTheDocument();
});

test("Start session stays enabled with no published work, the input while its initial read is pending or has failed", async () => {
  const project = makeMe.aPublishedSource.openDough.please();
  await mountComponent(projectActions(project).view({ hasWork: false }));
  await expect.element(startSession(project.label)).toBeEnabled();
  await expect.element(directionHeading).not.toBeInTheDocument();
});

function rowMeasure() {
  return {
    label: box(directionToggle()),
    height: box(row()).height,
  };
}

async function wordsKeepTheirRoom(
  answer: Locator,
  before: ReturnType<typeof rowMeasure>,
) {
  await expect.element(answer).toBeVisible();
  await expect.element(answer).toBeInViewport({ ratio: 1 });
  expect(splitWords(answer)).toEqual([]);
  expect(splitWords(directionToggle())).toEqual([]);
  await expect
    .element(directionHeading)
    .toHaveTextContent("Near-future direction");
  const bound = box(answer);
  const start = box(startSession("Open Dough"));
  const label = box(directionToggle());
  const space = box(end());
  expect(bound.left).toBeGreaterThanOrEqual(space.left - 0.5);
  expect(bound.right).toBeLessThanOrEqual(space.right + 0.5);
  expect(bound.top).toBeGreaterThanOrEqual(space.top - 0.5);
  expect(bound.bottom).toBeLessThanOrEqual(space.bottom + 0.5);
  expect(
    bound.left >= start.right - 0.5 || bound.top >= start.bottom - 0.5,
  ).toBe(true);
  expect(label.height).toBeLessThanOrEqual(before.label.height + 0.5);
  expect(label.height).toBeGreaterThanOrEqual(44);
  expect(label.width).toBeGreaterThanOrEqual(before.label.width - 0.5);
  expect(label.right).toBeLessThanOrEqual(space.left + 0.5);
  expect(box(help).width).toBeGreaterThanOrEqual(44);
  expect(box(help).height).toBeGreaterThanOrEqual(44);
  expect(box(row()).height - before.height).toBeLessThanOrEqual(
    bound.height + 8,
  );
  textFitsViewport(answer);
  noSidewaysScroll(row());
  controlsAreReachable(row());
}

async function directionOpensBeneath(answer: Locator) {
  const parts = [directionToggle(), end(), answer];
  const closed = parts.map(box);
  (await touch(directionToggle())).click();
  const content = page.getByText(direction);
  await expect.element(content).toBeVisible();
  expect(parts.map(box)).toEqual(closed);
  expect(box(content).left).toBeCloseTo(box(row()).left, 0);
  expect(box(content).width).toBeCloseTo(box(row()).width, 0);
  for (const part of closed)
    expect(box(content).top).toBeGreaterThanOrEqual(part.bottom - 0.5);
  expect(splitWords(answer)).toEqual([]);
  noSidewaysScroll(row());
  (await touch(directionToggle())).click();
  await expect.element(content).not.toBeVisible();
  expect(parts.map(box)).toEqual(closed);
  noSidewaysScroll(row());
}

async function mountProjectActions() {
  const actions = projectActions(makeMe.aPublishedSource.openDough.please());
  const { rerender } = await mountComponent(actions.view(), {
    viewport: phone.portrait,
  });
  await expect.element(startSession("Open Dough")).toBeEnabled();
  return (attempt: LaunchAttempt | undefined) => {
    actions.launches.adHocAttemptOf.mockReturnValue(attempt);
    rerender(actions.view());
  };
}

test("the Start session progress and direction stay readable in whole words on a phone", async () => {
  const answerWith = await mountProjectActions();
  const before = rowMeasure();
  answerWith({ kind: "starting" });
  const answer = page.getByText(
    "Starting a session in Open Dough… Local startup in progress.",
  );
  await expect.element(startSession("Open Dough")).toBeDisabled();
  await wordsKeepTheirRoom(answer, before);

  answerWith(undefined);
  await expect.element(answer).not.toBeInTheDocument();
  await expect.element(startSession("Open Dough")).toBeEnabled();
});

test("the refusal and direction retain their room when opened, closed and rotated by touch", async () => {
  const answerWith = await mountProjectActions();
  const upright = rowMeasure();
  await resizeLaunchViewport(phone.landscape);
  const turned = rowMeasure();
  await resizeLaunchViewport(phone.portrait);

  answerWith({
    kind: "failed",
    explanation:
      "Claude Code refused to start a session in ~/git/open-dough. Run `claude` in that folder once to see why.",
  });
  const answer = page.getByText(/^Launch failed: Claude Code refused/);
  await expect
    .element(answer)
    .toHaveTextContent(
      "Launch failed: Claude Code refused to start a session in ~/git/open-dough. Run claude in that folder once to see why.",
    );
  await wordsKeepTheirRoom(answer, upright);
  await directionOpensBeneath(answer);
  await resizeLaunchViewport(phone.landscape);
  await wordsKeepTheirRoom(answer, turned);
  await directionOpensBeneath(answer);
  await resizeLaunchViewport(phone.portrait);
  await wordsKeepTheirRoom(answer, upright);
});
