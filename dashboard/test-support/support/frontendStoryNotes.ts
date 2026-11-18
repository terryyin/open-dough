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
import { StoryNotesRule } from "./frontendStoryNotesRule.ts";

export async function installFrontendStoryNotes(page: Page) {
  let serial = 0;
  const rule = new StoryNotesRule<AnswerHold>(() => {
    serial += 1;
    return {
      id: `34810000-0000-4000-8000-${String(serial).padStart(12, "0")}`,
      savedAt: new Date(Date.UTC(2026, 10, 17, 1, 0, serial)).toISOString(),
    };
  });
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
