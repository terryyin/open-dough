import { createElement, useId } from "react";
import { vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import {
  useLaunchAttempts,
  type LaunchAttemptSource,
} from "../../src/launchAttempts.ts";
import { launchOffers } from "../../src/launchOffers.ts";
import { ProtectedFrameReason } from "../../src/protectedFrame.ts";
import type { WorkEntry } from "../../src/publishedWork.ts";
import { StartupRecovery } from "../../src/StartupRecovery.tsx";
import { storyCardMarks } from "../../src/storyCardFocus.ts";
import { StoryCardLaunches } from "../../src/StoryCardLaunches.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

const project = makeMe.aPublishedSource.openDough.please();
const nothing = () => undefined;

function cardLaunches(
  entry: WorkEntry,
  machine: MachineAnswer,
  attempts: ReturnType<typeof useLaunchAttempts>,
  statusId: string,
) {
  const startup = attempts.storyStartupOf(project.id, entry.identity);
  return createElement(
    "article",
    {
      ...storyCardMarks(entry.identity),
      "aria-label": entry.title,
      className: "story-card",
    },
    createElement(
      ProtectedFrameReason,
      { value: startup === undefined ? undefined : statusId },
      createElement(StoryCardLaunches, {
        sourceId: project.id,
        entry,
        launches: {
          ...launchOffers(machine, true),
          ...attempts,
          launched: machine.records,
          creations: machine.creations,
          rereadOffers: nothing,
          keptStartOf: nothing,
          runningStartOf: nothing,
        },
        offersStart: true,
        dependencyProblem: undefined,
        statusId,
      }),
    ),
  );
}

function StartupOnPage({
  entry,
  other,
  machine,
  source,
  answeredAsk,
}: {
  entry: WorkEntry;
  other: WorkEntry | undefined;
  machine: MachineAnswer;
  source: LaunchAttemptSource;
  answeredAsk: number;
}) {
  const statusId = useId();
  const attempts = useLaunchAttempts({
    source,
    observed: machine.attempts,
    resolved: [],
    readHistory: nothing,
    keptStarts: machine.keptStarts,
    hostOperations: machine.hostOperations,
    attemptEvidence: "read",
    answeredAsk,
    asksSoFar: () => answeredAsk,
    records: machine.records,
    reads: answeredAsk,
    reread: nothing,
    published: { shown: undefined, reading: true, readAfresh: nothing },
  });
  return createElement(
    "main",
    null,
    cardLaunches(entry, machine, attempts, statusId),
    other === undefined
      ? null
      : cardLaunches(other, machine, attempts, `${statusId}-other`),
    createElement(StartupRecovery, {
      sourceId: project.id,
      recoveries: attempts,
    }),
  );
}

export async function mountStoryStartup(
  entry: WorkEntry,
  {
    other,
    machine = makeMe.aMachineAnswer.please(),
  }: { other?: WorkEntry; machine?: MachineAnswer } = {},
) {
  const accept = vi.fn<LaunchAttemptSource["accept"]>();
  const waitForChange = vi
    .fn<LaunchAttemptSource["waitForChange"]>()
    .mockResolvedValue(undefined);
  const source: LaunchAttemptSource = { accept, waitForChange };
  const view = (read: MachineAnswer, answeredAsk: number) =>
    createElement(StartupOnPage, {
      entry,
      other,
      machine: read,
      source,
      answeredAsk,
    });
  const { rerender } = await mountComponent(view(machine, 0), {
    viewport: { width: 1440, height: 900 },
  });
  let answered = 0;
  const card = page.getByRole("article", { name: entry.title, exact: true });
  const actions = card.getByRole("group", { name: "Launch actions" });
  return {
    accept,
    card,
    actions,
    execution: actions.getByRole("button", { name: "Start execution" }),
    refinement: actions.getByRole("button", { name: "Start refinement" }),
    recovery: page.getByRole("region", { name: "Startup recovery" }),
    read: (next: MachineAnswer) => {
      rerender(view(next, ++answered));
    },
  };
}
