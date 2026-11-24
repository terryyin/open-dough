// A Done story's Follow up composer mounted on its Start session control, with
// the story's notes read and its retained and published sessions offered. The
// host declines every start, so a case reads what Start requested from
// `accept`. Cases: ./follow-up-note-handoff.spec.ts and
// ./follow-up-session-choices.spec.ts.

import { createElement } from "react";
import { vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchAttemptSource } from "../../src/launchAttempts.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { StartSession } from "../../src/StartSession.tsx";
import { storyContext, storyName } from "../../src/followUpContext.ts";
import {
  storyFollowUpSessions,
  type FollowUpSession,
} from "../../src/followUpSessions.ts";
import type { PublishedSessionRecord } from "../../src/publishedSessionRecord.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import type { StoryNotesAnswer } from "../../src/storyNote.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { adHocLaunches, launchDialog } from "./ad-hoc-launch-page.ts";
import { useMountedLaunchAttempts } from "./mounted-launch-attempts.ts";

const project = makeMe.aPublishedSource.openDough.please();
const machine = makeMe.aMachineAnswer.please();
// The story revision the Follow up names as its source.
export const followUpRevision = "7".repeat(40);

type FollowUpStory = { readonly identity: string; readonly title: string };
const done = (story: FollowUpStory) => ({
  ...story,
  completedAt: "2026-11-17T00:00:00.000Z",
});

function FollowUpOnPage({
  story,
  source,
  sessions,
}: {
  story: FollowUpStory;
  source: LaunchAttemptSource;
  sessions: readonly FollowUpSession[] | undefined;
}) {
  const { adHocAttemptOf, startAdHoc } = useMountedLaunchAttempts(
    machine,
    source,
    0,
  );
  const { sessionPolicyOffer, rereadOffers } = adHocLaunches();
  return createElement(StartSession, {
    project: project.label,
    sourceId: project.id,
    launches: { adHocAttemptOf, startAdHoc, sessionPolicyOffer, rereadOffers },
    presentTerminal: () => undefined,
    followUp: {
      name: storyName(done(story)),
      context: storyContext(done(story), []),
      source: {
        story: { identity: story.identity, revision: followUpRevision },
      },
      ...(sessions === undefined ? {} : { sessions }),
    },
  });
}

// Mounts the story's Follow up and opens its composer.
export async function openStoryFollowUp(
  story: FollowUpStory,
  {
    notes = { kind: "notes", notes: { [story.identity]: [] } },
    sessions,
  }: {
    notes?: StoryNotesAnswer;
    sessions?: {
      retained: readonly LaunchRecord[];
      published: readonly PublishedSessionRecord[];
    };
  } = {},
) {
  const accept = vi.fn<LaunchAttemptSource["accept"]>().mockResolvedValue({
    kind: "failed",
    explanation: "The test host declined this start.",
  });
  const source = {
    accept,
    waitForChange: vi
      .fn<LaunchAttemptSource["waitForChange"]>()
      .mockResolvedValue(undefined),
  };
  const offered =
    sessions &&
    storyFollowUpSessions(
      sessions.retained,
      sessions.published,
      project.id,
      story.identity,
    );
  await mountComponent(
    createElement(PageReadsOnPage, {
      reads: pageReadsSupplying({ storyNotes: () => Promise.resolve(notes) }),
      children: createElement(FollowUpOnPage, {
        story,
        source,
        sessions: offered,
      }),
    }),
  );
  const launcher = page.getByRole("button", {
    name: `Follow up ${storyName(done(story))}`,
  });
  await launcher.click();
  return { launcher, form: launchDialog(), accept };
}
