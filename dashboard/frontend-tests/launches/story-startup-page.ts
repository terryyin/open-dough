import { createElement, useState, type ComponentProps } from "react";
import { vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { LaunchAttemptSource } from "../../src/launchAttempts.ts";
import { launchOffers } from "../../src/launchOffers.ts";
import { SessionsOnPage } from "../../src/pageSessions.ts";
import { StoryReviewsOnPage } from "../../src/pageStoryReviews.ts";
import type { WorkEntry } from "../../src/publishedWork.ts";
import { StartupAnnouncer } from "../../src/StartupAnnouncer.tsx";
import { StartupRecovery } from "../../src/StartupRecovery.tsx";
import { StoryCard } from "../../src/StoryCard.tsx";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import type { StoryNotesAnswer } from "../../src/storyNote.ts";
import type { AttemptEvidence } from "../../src/startupRecoveries.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { noSessions } from "../navigation/board-mount.ts";
import { inertPageSessions } from "../sessions/inert-page-sessions.ts";
import { useMountedLaunchAttempts } from "./mounted-launch-attempts.ts";

const project = makeMe.aPublishedSource.openDough.please();
const work = makeMe.aPublishedWork.of(project).at("a".repeat(40)).please();
const nothing = () => undefined;

function CardSituation({
  entry,
  launches,
  taken,
}: {
  entry: WorkEntry;
  launches: ComponentProps<typeof StoryCard>["launches"];
  taken: boolean;
}) {
  const [selected, select] = useState(false);
  const [inspected, inspect] = useState(false);
  return createElement(StoryCard, {
    work,
    entry,
    priority: undefined,
    showsSliceProgress: taken,
    launches,
    doneSessions: [],
    offersStart: !taken,
    selected,
    onSelect: () => {
      select(!selected);
    },
    inspected,
    onInspect: () => {
      inspect(!inspected);
    },
    onOpenRoster: nothing,
  });
}

type ReadState = {
  machine: MachineAnswer;
  answeredAsk: number;
  evidence: AttemptEvidence;
};

function StartupOnPage({
  entry,
  other,
  read,
  source,
  reread,
  taken,
}: {
  entry: WorkEntry;
  other: WorkEntry | undefined;
  read: ReadState;
  source: LaunchAttemptSource;
  reread: () => void;
  taken: boolean;
}) {
  const { machine, answeredAsk, evidence } = read;
  const attempts = useMountedLaunchAttempts(machine, source, answeredAsk, {
    evidence,
    reread,
  });
  const launches = {
    ...noSessions,
    ...launchOffers(machine, true),
    ...attempts,
    records: machine.records,
    launched: machine.records,
    creations: machine.creations,
    workspaces: machine.workspaces,
  };
  return createElement(
    "main",
    null,
    createElement(CardSituation, { entry, launches, taken }),
    other === undefined
      ? null
      : createElement(CardSituation, { entry: other, launches, taken: false }),
    createElement(StartupRecovery, {
      sourceId: project.id,
      recoveries: attempts,
    }),
    createElement(StartupAnnouncer, {
      sourceId: project.id,
      startups: attempts.storyStartupsOf(project.id),
    }),
  );
}

export async function mountStoryStartup(
  entry: WorkEntry,
  {
    other,
    machine = makeMe.aMachineAnswer.please(),
    evidence = "read",
    taken = false,
    notes = { kind: "notes", notes: {} },
  }: {
    other?: WorkEntry;
    machine?: MachineAnswer;
    evidence?: AttemptEvidence;
    taken?: boolean;
    notes?: StoryNotesAnswer;
  } = {},
) {
  const accept = vi.fn<LaunchAttemptSource["accept"]>();
  const reread = vi.fn();
  const source = {
    accept,
    waitForChange: vi
      .fn<LaunchAttemptSource["waitForChange"]>()
      .mockResolvedValue(undefined),
  };
  const reads = pageReadsSupplying({
    storyNotes: () => Promise.resolve(notes),
  });
  const view = (read: ReadState) =>
    createElement(StoryReviewsOnPage, {
      value: nothing,
      children: createElement(SessionsOnPage, {
        value: inertPageSessions,
        children: createElement(PageReadsOnPage, {
          reads,
          children: createElement(StartupOnPage, {
            entry,
            other,
            read,
            source,
            reread,
            taken,
          }),
        }),
      }),
    });
  let state: ReadState = { machine, answeredAsk: 0, evidence };
  const { rerender } = await mountComponent(view(state), {
    viewport: { width: 1440, height: 900 },
  });
  const card = page.getByRole("article", { name: entry.title, exact: true });
  const actions = card.getByRole("group", { name: "Launch actions" });
  return {
    accept,
    reread,
    card,
    actions,
    execution: actions.getByRole("button", { name: "Start execution" }),
    refinement: actions.getByRole("button", { name: "Start refinement" }),
    recovery: page.getByRole("region", { name: "Startup recovery" }),
    announcement: page.getByRole("log", { name: "Startup announcements" }),
    read: (next: MachineAnswer) => {
      state = {
        ...state,
        machine: next,
        answeredAsk: state.answeredAsk + 1,
        evidence: "read",
      };
      rerender(view(state));
    },
    readDoesNotAnswer: () => {
      state = { ...state, evidence: "unanswered" };
      rerender(view(state));
    },
  };
}
