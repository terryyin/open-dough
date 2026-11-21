import { createElement, type ComponentProps } from "react";
import { vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { StoryCardLaunches } from "../../src/StoryCardLaunches.tsx";
import { launchOffers } from "../../src/launchOffers.ts";
import type { WorkEntry } from "../../src/publishedWork.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

type StoryLaunches = ComponentProps<typeof StoryCardLaunches>["launches"];

export async function mountStoryLaunches(
  entry: WorkEntry,
  {
    establishesExecution = false,
    viewport = { width: 1440, height: 900 },
  } = {},
) {
  const source = makeMe.aPublishedSource.openDough.please();
  const machine = makeMe.aMachineAnswer;
  const read = establishesExecution
    ? machine.establishing({
        source: source.id,
        workflow: "execution",
        host: "claude",
      })
    : machine;
  const start = vi.fn<StoryLaunches["start"]>().mockResolvedValue(true);
  const launches: StoryLaunches = {
    ...launchOffers(read.please(), true),
    attemptEvidence: "read",
    launched: [],
    creations: [],
    rereadOffers: () => undefined,
    keptStartOf: () => undefined,
    runningStartOf: () => undefined,
    storyStartupOf: () => undefined,
    attemptOf: () => undefined,
    start,
  };
  const view = (work: WorkEntry, offersStart: boolean, state = launches) =>
    createElement(StoryCardLaunches, {
      sourceId: source.id,
      entry: work,
      launches: state,
      offersStart,
      dependencyProblem: undefined,
      statusId: "story-startup",
    });
  const { rerender } = await mountComponent(view(entry, true), { viewport });
  const group = page.getByRole("group", { name: "Launch actions" });
  return {
    group,
    execution: group.getByRole("button", { name: "Start execution" }),
    refinement: group.getByRole("button", { name: "Start refinement" }),
    start,
    show: (work: WorkEntry, offersStart = true) => {
      rerender(view(work, offersStart));
    },
    readingLaunches: () => {
      rerender(view(entry, true, { ...launches, attemptEvidence: "unread" }));
    },
  };
}
