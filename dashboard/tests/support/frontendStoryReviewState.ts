// Controllable `/__project-configuration/story-review-states` answers for
// frontend-only journeys. Default settle is every story unreviewed; a case
// may hold, refuse or fail the next ask per project, and POST changes update
// that project's reviewed set so later GETs and board cues agree.

import type { Page } from "@playwright/test";
import {
  storyReviewStateChangeSchema,
  storyReviewStateEndpoint,
  type StoryReviewStatesAnswer,
} from "../../src/storyReviewState.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

type NextAnswer =
  | { readonly kind: "answer"; readonly body: StoryReviewStatesAnswer }
  | {
      readonly kind: "refused";
      readonly error: string;
      readonly status: number;
    }
  | { readonly kind: "failed" };

export type FrontendStoryReviewState = {
  readonly asked: () => readonly string[];
  readonly reviewed: (project: string) => readonly string[];
  readonly answer: (project: string, reviewed: readonly string[]) => void;
  readonly answerNext: (reviewed: readonly string[], project?: string) => void;
  readonly refuseNext: (
    error: string,
    status?: number,
    project?: string,
  ) => void;
  readonly failNext: (project?: string) => void;
  readonly holdNext: (project?: string) => HeldAnswer;
};

const keyFor = (project: string | undefined) => project ?? "*";

const answerOf = (reviewed: ReadonlySet<string>): StoryReviewStatesAnswer => ({
  reviewed: [...reviewed],
});

export async function installFrontendStoryReviewState(
  page: Page,
  initial: Readonly<Record<string, readonly string[]>> = {},
): Promise<FrontendStoryReviewState> {
  const asked: string[] = [];
  const byProject = new Map<string, Set<string>>(
    Object.entries(initial).map(([project, identities]) => [
      project,
      new Set(identities),
    ]),
  );
  const next = new Map<string, NextAnswer>();
  const holds = new Map<string, AnswerHold>();
  const take = <T>(map: Map<string, T>, project: string) => {
    const staged = map.get(project) ?? map.get("*");
    if (map.has(project)) map.delete(project);
    else if (staged !== undefined) map.delete("*");
    return staged;
  };
  const reviewedOf = (project: string) => {
    const existing = byProject.get(project);
    if (existing !== undefined) return existing;
    const created = new Set<string>();
    byProject.set(project, created);
    return created;
  };
  await page.route(
    (url) => url.pathname === storyReviewStateEndpoint,
    async (route) => {
      const project =
        new URL(route.request().url()).searchParams.get("id") ?? "";
      asked.push(project);
      const planned = take(next, project);
      const hold = take(holds, project);
      await answerHeld(hold, async () => {
        if (planned?.kind === "failed") {
          await route.abort("failed");
          return;
        }
        if (planned?.kind === "refused") {
          await fulfillJson(route, { error: planned.error }, planned.status);
          return;
        }
        if (planned?.kind === "answer") {
          await fulfillJson(route, planned.body);
          return;
        }
        if (route.request().method() === "POST") {
          const change = storyReviewStateChangeSchema.parse(
            route.request().postDataJSON(),
          );
          const reviewed = reviewedOf(project);
          if (change.reviewed) reviewed.add(change.identity);
          else reviewed.delete(change.identity);
          await fulfillJson(route, answerOf(reviewed));
          return;
        }
        await fulfillJson(route, answerOf(reviewedOf(project)));
      });
    },
  );
  return {
    asked: () => [...asked],
    reviewed: (project) => [...reviewedOf(project)],
    answer: (project, reviewed) => {
      byProject.set(project, new Set(reviewed));
    },
    answerNext: (reviewed, project) => {
      next.set(keyFor(project), {
        kind: "answer",
        body: { reviewed: [...reviewed] },
      });
    },
    refuseNext: (error, status = 502, project) => {
      next.set(keyFor(project), { kind: "refused", error, status });
    },
    failNext: (project) => {
      next.set(keyFor(project), { kind: "failed" });
    },
    holdNext: (project) => {
      const { held, hold } = holdAnswer(page);
      holds.set(keyFor(project), hold);
      return held;
    },
  };
}
