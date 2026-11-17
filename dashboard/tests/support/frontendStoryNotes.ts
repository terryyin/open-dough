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
  const unreadable = new Set<string>();
  const asked: { project: string; method: string }[] = [];
  const changes: StoryNoteChange[] = [];
  let nextHold: AnswerHold | undefined;
  let serial = 0;
  let failNext: "refused" | "unreachable" | undefined;
  const notesOf = (project: string) => projects.get(project) ?? {};
  await page.route(
    (url) => url.pathname === storyNotesEndpoint,
    async (route) => {
      const project =
        new URL(route.request().url()).searchParams.get("id") ?? "";
      const method = route.request().method();
      asked.push({ project, method });
      if (unreadable.has(project)) {
        await fulfillJson(
          route,
          method === "POST"
            ? { error: "The note could not be saved." }
            : { kind: "unreadable" },
          method === "POST" ? 500 : 200,
        );
        return;
      }
      if (method === "POST") {
        const change = storyNoteChangeSchema.parse(
          route.request().postDataJSON(),
        );
        changes.push(structuredClone(change));
        const failure = failNext;
        failNext = undefined;
        if (failure === "unreachable") {
          await route.abort();
          return;
        }
        if (failure === "refused") {
          await fulfillJson(route, { error: "Change refused." }, 503);
          return;
        }
        const existing = notesOf(project)[change.identity] ?? [];
        let changed: StoryNote[];
        if (change.action === "add") {
          serial += 1;
          const builder = makeMe.aStoryNote
            .withText(change.text)
            .identifiedAs(
              `34810000-0000-4000-8000-${String(serial).padStart(12, "0")}`,
            )
            .savedAt(
              new Date(Date.UTC(2026, 10, 17, 1, 0, serial)).toISOString(),
            );
          if (change.context !== undefined) builder.withContext(change.context);
          changed = [...existing, builder.please()];
        } else if (change.action === "edit") {
          changed = existing.map((note) =>
            note.id === change.id
              ? {
                  ...note,
                  text: change.text,
                  editedAt: "2026-11-17T02:00:00.000Z",
                }
              : note,
          );
        } else changed = existing.filter(({ id }) => id !== change.id);
        projects.set(project, {
          ...notesOf(project),
          [change.identity]: changed,
        });
      }
      const body = structuredClone({ kind: "notes", notes: notesOf(project) });
      const hold = nextHold;
      nextHold = undefined;
      await answerHeld(hold, () => fulfillJson(route, body));
    },
  );
  return {
    failNextChange: () => {
      failNext = "refused";
    },
    loseNextChange: () => {
      failNext = "unreachable";
    },
    asked: () => [...asked],
    changes: () => structuredClone(changes),
    answer: (project: string, notes: Record<string, StoryNote[]>) => {
      unreadable.delete(project);
      projects.set(project, structuredClone(notes));
    },
    unreadable: (project: string) => {
      unreadable.add(project);
    },
    holdNext: () => {
      const { held, hold } = holdAnswer(page);
      nextHold = hold;
      return held;
    },
  };
}
