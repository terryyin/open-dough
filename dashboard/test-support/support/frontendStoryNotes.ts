// Notes service substitute: answers through the notes rule
// (./frontendStoryNotesRule.ts); holds capture the answer at request time for
// stale-read proof.
import type { Page } from "@playwright/test";
import { storyNotesEndpoint, type StoryNote } from "../../src/storyNote.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
} from "./frontendSubstituteAnswers.ts";
import {
  numberedNewStoryNotes,
  StoryNotesRule,
} from "./frontendStoryNotesRule.ts";

export async function installFrontendStoryNotes(page: Page) {
  const rule = new StoryNotesRule<AnswerHold>(numberedNewStoryNotes());
  await page.route(
    (url) => url.pathname === storyNotesEndpoint,
    async (route) => {
      const request = route.request();
      const method = request.method();
      const answer = rule.answer({
        project: new URL(request.url()).searchParams.get("id") ?? "",
        method,
        body: method === "POST" ? request.postDataJSON() : undefined,
      });
      if (answer.kind === "unreachable") {
        await route.abort();
        return;
      }
      await answerHeld(answer.hold, () =>
        fulfillJson(route, answer.body, answer.status),
      );
    },
  );
  return {
    failNextChange: () => {
      rule.failNext = "refused";
    },
    loseNextChange: () => {
      rule.failNext = "unreachable";
    },
    asked: () => [...rule.asked],
    changes: () => structuredClone(rule.changes),
    answer: (project: string, notes: Record<string, StoryNote[]>) => {
      rule.setNotes(project, notes);
    },
    unreadable: (project: string) => {
      rule.markUnreadable(project);
    },
    holdNext: () => {
      const { held, hold } = holdAnswer(page);
      rule.nextHold = hold;
      return held;
    },
  };
}
