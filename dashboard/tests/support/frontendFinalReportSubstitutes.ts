// Passive final-report answers for frontend-only journeys, in place of
// `/__agent-launch/result` (../../src/finalReportContract.ts). A case may
// hold, refuse or change the next answer per session; reading never marks
// Done or touches a native host.

import type { Page } from "@playwright/test";
import {
  finalReportEndpoint,
  type FinalReportRead,
} from "../../src/finalReportContract.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

type NextAnswer =
  | { readonly kind: "report"; readonly report: FinalReportRead }
  | {
      readonly kind: "refused";
      readonly error: string;
      readonly status: number;
    }
  | { readonly kind: "failed" };

export type FrontendFinalReportAnswers = {
  // Session ids asked, in order.
  readonly asked: () => readonly string[];
  // Default answer for every session unless a next answer is staged.
  readonly answer: (report: FinalReportRead) => void;
  // Next ask for `session` (or any session when omitted) gets this report.
  readonly answerNext: (report: FinalReportRead, session?: string) => void;
  readonly refuseNext: (
    error: string,
    status?: number,
    session?: string,
  ) => void;
  readonly failNext: (session?: string) => void;
  readonly holdNext: (session?: string) => HeldAnswer;
};

const keyFor = (session: string | undefined) => session ?? "*";

export async function installFrontendFinalReport(
  page: Page,
  initial: FinalReportRead = {
    kind: "available",
    turnId: "frontend-report-turn",
    text: "Frontend substitute final report.",
  },
): Promise<FrontendFinalReportAnswers> {
  const asked: string[] = [];
  let fallback: FinalReportRead = initial;
  const next = new Map<string, NextAnswer>();
  const holds = new Map<string, AnswerHold>();
  const take = <T>(map: Map<string, T>, session: string) => {
    const staged = map.get(session) ?? map.get("*");
    if (map.has(session)) map.delete(session);
    else if (staged !== undefined) map.delete("*");
    return staged;
  };
  await page.route(
    (url) => url.pathname === finalReportEndpoint,
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
          planned?.kind === "report" ? planned.report : fallback,
        );
      });
    },
  );
  return {
    asked: () => [...asked],
    answer: (report) => {
      fallback = report;
    },
    answerNext: (report, session) => {
      next.set(keyFor(session), { kind: "report", report });
    },
    refuseNext: (error, status = 503, session) => {
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
