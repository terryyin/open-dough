// Notes service substitute: canonical note shape, project-scoped reads and
// accepted changes; holds capture the answer at request time for stale-read proof.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyNoteChangeSchema,
  storyNotesEndpoint,
  type StoryNote,
  type StoryNoteChange,
} from "../../src/storyNote.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
} from "./frontendSubstituteAnswers.ts";

export async function installFrontendStoryNotes(page: Page) {
  const projects = new Map<string, Record<string, StoryNote[]>>();
  const asked: { project: string; method: string }[] = [];
  const changes: StoryNoteChange[] = [];
  let nextHold: AnswerHold | undefined;
  let serial = 0;
  const notesOf = (project: string) => projects.get(project) ?? {};
  await page.route(
    (url) => url.pathname === storyNotesEndpoint,
    async (route) => {
      const project =
        new URL(route.request().url()).searchParams.get("id") ?? "";
      const method = route.request().method();
      asked.push({ project, method });
      if (method === "POST") {
        const change = storyNoteChangeSchema.parse(
          route.request().postDataJSON(),
        );
        changes.push(structuredClone(change));
        serial += 1;
        const note = makeMe.aStoryNote
          .withText(change.text)
          .identifiedAs(
            `34810000-0000-4000-8000-${String(serial).padStart(12, "0")}`,
          )
          .savedAt(new Date(Date.UTC(2026, 10, 17, 1, 0, serial)).toISOString())
          .please();
        projects.set(project, {
          ...notesOf(project),
          [change.identity]: [
            ...(notesOf(project)[change.identity] ?? []),
            note,
          ],
        });
      }
      const body = structuredClone({ kind: "notes", notes: notesOf(project) });
      const hold = nextHold;
      nextHold = undefined;
      await answerHeld(hold, () => fulfillJson(route, body));
    },
  );
  return {
    asked: () => [...asked],
    changes: () => structuredClone(changes),
    answer: (project: string, notes: Record<string, StoryNote[]>) => {
      projects.set(project, structuredClone(notes));
    },
    holdNext: () => {
      const { held, hold } = holdAnswer(page);
      nextHold = hold;
      return held;
    },
  };
}
