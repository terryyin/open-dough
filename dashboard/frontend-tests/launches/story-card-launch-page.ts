import { createElement, type ComponentProps } from "react";
import { vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
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
    offerRead,
  }: {
    establishesExecution?: boolean;
    viewport?: { width: number; height: number };
    offerRead?: { answer: MachineAnswer; held: boolean };
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
  const answer = offerRead?.answer ?? read.please();
  const launches: StoryLaunches = {
    ...launchOffers(answer, true),
    attemptEvidence: "read",
    launched: [],
    creations: [],
    rereadOffers: () => {
      if (offerRead !== undefined)
        rerender(
          view(entry, true, { ...launches, ...launchOffers(answer, false) }),
        );
    },
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
  const held = {
    ...launches,
    ...launchOffers(answer, false),
    attemptEvidence: "unread",
  } satisfies StoryLaunches;
  const { rerender } = await mountComponent(
    view(entry, true, offerRead?.held ? held : launches),
    { viewport },
  );
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
