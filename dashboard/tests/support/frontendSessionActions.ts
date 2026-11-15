// Session entry actions' boundary answers for frontend-only journeys, in
// place of dashboardServer and the native hosts: Mark as done
// (../../server/doneMarks.ts), Delete record… and Mark as read
// (../../server/launchBoundaryAnswer.ts). Each answers as the boundary does
// and keeps its effect in the machine's sessions read, so the page's next
// read agrees: a done mark keeps the record Done, a delete forgets a record
// whose state is unknown or unavailable and otherwise answers its known
// state, and a read mark keeps the report's receipt. The case may refuse,
// fail or hold the next answer of an action; every session asked about
// stays inspectable. Nothing native is renamed, stopped or deleted.

import type { Page } from "@playwright/test";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { agentDeleteEndpoint } from "../../src/deleteRecord.ts";
import { agentDoneEndpoint } from "../../src/doneMark.ts";
import { agentReadEndpoint } from "../../src/readMark.ts";
import {
  putFrontendMachine,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

export type SessionAction = "done" | "delete" | "read";

const endpoints: Record<SessionAction, string> = {
  done: agentDoneEndpoint,
  delete: agentDeleteEndpoint,
  read: agentReadEndpoint,
};

type NextAnswer =
  | {
      readonly kind: "refused";
      readonly error: string;
      readonly status: number;
    }
  | { readonly kind: "failed" };

export type FrontendSessionActions = {
  // The session id of every request of `action` the page sent, in order.
  readonly asked: (action: SessionAction) => readonly string[];
  // The next request of `action` is refused with `error` under `status`
  // (a conflict unless stated), changing nothing.
  readonly refuseNext: (
    action: SessionAction,
    error: string,
    status?: number,
  ) => void;
  // The next request of `action` never gets an answer: its connection fails.
  readonly failNext: (action: SessionAction) => void;
  // The next request of `action` is answered only once released.
  readonly holdNext: (action: SessionAction) => HeldAnswer;
};

// A done mark's record: Done now, its session stopped unless the host no
// longer has it, with what the native rename could not do, when stated.
function markedDone(
  record: LaunchWithState,
  doneProblem: string | undefined,
): LaunchWithState {
  return {
    ...record,
    doneAt: new Date().toISOString(),
    ...(doneProblem === undefined ? {} : { doneProblem }),
    sessionState:
      record.sessionState.kind === "available"
        ? { kind: "available", availability: "retained", activity: "review" }
        : record.sessionState,
  };
}

// `doneProblem` is what each done mark says its native rename could not do.
export async function installFrontendSessionActions(
  page: Page,
  services: FrontendServiceState,
  { doneProblem }: { readonly doneProblem?: string } = {},
): Promise<FrontendSessionActions> {
  const asked: Record<SessionAction, string[]> = {
    done: [],
    delete: [],
    read: [],
  };
  const next = new Map<SessionAction, NextAnswer>();
  const holds = new Map<SessionAction, AnswerHold>();
  const records = () => services.machine?.records ?? [];
  const put = (records: readonly LaunchWithState[]) => {
    const { machine } = services;
    if (machine === undefined) throw new Error("The machine was never read.");
    putFrontendMachine(services, { ...machine, records: [...records] });
  };
  const answer = (action: SessionAction, record: LaunchWithState) => {
    if (action === "delete") {
      if (record.sessionState.kind === "available")
        return { kind: "state-known", record };
      put(records().filter((kept) => kept !== record));
      return { kind: "deleted" };
    }
    const changed =
      action === "done"
        ? markedDone(record, doneProblem)
        : { ...record, reportRead: record.completion?.receipt };
    put(records().map((kept) => (kept === record ? changed : kept)));
    return { record: changed };
  };
  for (const action of ["done", "delete", "read"] as const) {
    await page.route(
      (url) => url.pathname === endpoints[action],
      async (route) => {
        const { session } = route.request().postDataJSON() as {
          session: string;
        };
        asked[action].push(session);
        const planned = next.get(action);
        next.delete(action);
        const hold = holds.get(action);
        holds.delete(action);
        await answerHeld(hold, async () => {
          if (planned?.kind === "failed") {
            await route.abort("failed");
            return;
          }
          if (planned?.kind === "refused") {
            await fulfillJson(route, { error: planned.error }, planned.status);
            return;
          }
          const record = records().find(
            (kept) => kept.session.sessionId === session,
          );
          if (record === undefined)
            await fulfillJson(route, { error: "Unknown session." }, 404);
          else await fulfillJson(route, answer(action, record));
        });
      },
    );
  }
  return {
    asked: (action) => [...asked[action]],
    refuseNext: (action, error, status = 409) => {
      next.set(action, { kind: "refused", error, status });
    },
    failNext: (action) => {
      next.set(action, { kind: "failed" });
    },
    holdNext: (action) => {
      const { held, hold } = holdAnswer(page);
      holds.set(action, hold);
      return held;
    },
  };
}
