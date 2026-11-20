// Done disclosure on an unfinished story card: collapsed count, expand and
// collapse for keyboard, and no control when the story holds no Done sessions.
import { createElement } from "react";
import { test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { inertPageSessions } from "./inert-page-sessions.ts";
import { SessionsOnPage } from "../../src/pageSessions.ts";
import { StoryCardDoneSessions } from "../../src/StoryCardDoneSessions.tsx";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import { doneDisclosure } from "./story-card-done-disclosure-page.ts";

const story = {
  identity: "SEED-414#review-done-sessions",
  title: "Review done sessions",
};

function doneSession(sessionId: string, minutesAgo: number): LaunchWithState {
  const launchedAt = new Date(Date.now() - minutesAgo * 60_000).toISOString();
  return makeMe.anObservedLaunch
    .of(
      makeMe.aLaunchRecord
        .executing(story)
        .launchedAt(launchedAt)
        .inClaudeSession({ sessionId })
        .markedDoneAt(launchedAt)
        .please(),
    )
    .withSessionState(makeMe.aSessionState.retained("working").please())
    .please();
}

async function mountDisclosure(sessions: readonly LaunchWithState[]) {
  await mountComponent(
    createElement(
      SessionsOnPage,
      { value: inertPageSessions },
      createElement(StoryCardDoneSessions, {
        sessions,
        storyCardAssignments: [],
        followUpOf: () => null,
      }),
    ),
  );
}

test("two Done sessions collapse to a count of two, expand into accessible rows, and collapse again under the disclosure", async () => {
  const older = doneSession("done-older", 2);
  const newer = doneSession("done-newer", 1);
  await mountDisclosure([older, newer]);
  const disclosure = await doneDisclosure().showsCollapsedCount(2);
  await disclosure.toggle();
  await disclosure.showsRows([
    sessionKey(newer.session),
    sessionKey(older.session),
  ]);
  await disclosure.toggle();
  await disclosure.showsCollapsedCount(2);
  await disclosure.keepsFocusOnSummary();
});

test("a story with no Done sessions renders no disclosure", async () => {
  await mountDisclosure([]);
  await doneDisclosure().isAbsent();
});
