// Controllable `/__agent-launch/completed-story` answers for frontend-only
// journeys. Default settle is a confirmed miss; a case may hold, link, refuse
// or fail the next ask per session.

import type { Page } from "@playwright/test";
import {
  completedStoryAssociationEndpoint,
  type CompletedStoryAssociationAnswer,
} from "../../src/completedStoryAssociation.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

type NextAnswer =
  | { readonly kind: "answer"; readonly body: CompletedStoryAssociationAnswer }
  | {
      readonly kind: "refused";
      readonly error: string;
      readonly status: number;
    }
  | { readonly kind: "failed" };

export type FrontendCompletedStoryAssociation = {
  readonly asked: () => readonly string[];
  readonly answer: (body: CompletedStoryAssociationAnswer) => void;
  readonly answerNext: (
    body: CompletedStoryAssociationAnswer,
    session?: string,
  ) => void;
  readonly refuseNext: (
    error: string,
    status?: number,
    session?: string,
  ) => void;
  readonly failNext: (session?: string) => void;
  readonly holdNext: (session?: string) => HeldAnswer;
};

const keyFor = (session: string | undefined) => session ?? "*";

export async function installFrontendCompletedStoryAssociation(
  page: Page,
  initial: CompletedStoryAssociationAnswer = { kind: "absent" },
): Promise<FrontendCompletedStoryAssociation> {
  const asked: string[] = [];
  let fallback: CompletedStoryAssociationAnswer = initial;
  const next = new Map<string, NextAnswer>();
  const holds = new Map<string, AnswerHold>();
  const take = <T>(map: Map<string, T>, session: string) => {
    const staged = map.get(session) ?? map.get("*");
    if (map.has(session)) map.delete(session);
    else if (staged !== undefined) map.delete("*");
    return staged;
  };
  await page.route(
    (url) => url.pathname === completedStoryAssociationEndpoint,
    async (route) => {
      const session =
        new URL(route.request().url()).searchParams.get("session") ?? "";
      asked.push(session);
      const planned = take(next, session);
      const hold = take(holds, session);
      await answerHeld(hold, async () => {
        if (planned?.kind === "failed") {
          await route.abort("failed");
          return;
        }
        if (planned?.kind === "refused") {
          await fulfillJson(route, { error: planned.error }, planned.status);
          return;
        }
        await fulfillJson(
          route,
          planned?.kind === "answer" ? planned.body : fallback,
        );
      });
    },
  );
  return {
    asked: () => [...asked],
    answer: (body) => {
      fallback = body;
    },
    answerNext: (body, session) => {
      next.set(keyFor(session), { kind: "answer", body });
    },
    refuseNext: (error, status = 502, session) => {
      next.set(keyFor(session), { kind: "refused", error, status });
    },
    failNext: (session) => {
      next.set(keyFor(session), { kind: "failed" });
    },
    holdNext: (session) => {
      const { held, hold } = holdAnswer(page);
      holds.set(keyFor(session), hold);
      return held;
    },
  };
}
