// Notes service substitute: answers through the notes rule
// (./frontendStoryNotesRule.ts).
import type { Page } from "@playwright/test";
import { storyNotesEndpoint, type StoryNote } from "../../src/storyNote.ts";
import { fulfillJson } from "./frontendSubstituteAnswers.ts";
import {
  numberedNewStoryNotes,
  StoryNotesRule,
} from "./frontendStoryNotesRule.ts";

export async function installFrontendStoryNotes(page: Page) {
  const rule = new StoryNotesRule(numberedNewStoryNotes());
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
      await fulfillJson(route, answer.body, answer.status);
    },
  );
  return {
    changes: () => structuredClone(rule.changes),
    answer: (project: string, notes: Record<string, StoryNote[]>) => {
      rule.setNotes(project, notes);
    },
    unreadable: (project: string) => {
      rule.markUnreadable(project);
    },
  };
}
