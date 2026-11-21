// Launch boundary answers for frontend-only launch dialog journeys, in place
// of dashboardServer and the native hosts: the acceptance a dialog's Start
// asks for (../../server/launchBoundary.ts), image uploads, and a host's model
// choices (../../server/launchHostOptionsResponse.ts). Every acceptance the
// page asked for stays inspectable. An acceptance is refused unless the case
// answers it, and nothing is ever launched. An acceptance's answer
// may be lost on the way to the page; the page's waits for an accepted
// attempt's change stay waiting until the case tells them it changed, and one
// begun after the case told it is answered at once, as is one for an attempt
// the machine's read (./frontendServiceSubstitutes.ts) observes settled or
// changed since the wait's `seen`, as the boundary answers. A host's
// choices answer what is arranged for the project and host when the read is
// answered, or no choices as the default substitutes do; a held read waits
// until released, and an unreadable one answers as the boundary does.

import type { Page, Route } from "@playwright/test";
import {
  agentAcceptEndpoint,
  agentChangedEndpoint,
  type Acceptance,
  type AgentLaunchRequest,
} from "../../src/agentLaunch.ts";
import { launchAttachmentEndpoint } from "../../src/launchAttachments.ts";
import {
  launchHostOptionsEndpoint,
  type LaunchHostOptions,
} from "../../src/launchHostOptions.ts";
import {
  answerHeld,
  endWithPage,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";
import { frontendServicesOf } from "./frontendServiceSubstitutes.ts";

// What a host's model choices read answers: its choices, or that they could
// not be read.
export type HostChoices = LaunchHostOptions | "unreadable";

export type FrontendLaunchBoundary = {
  // Every launch the page asked the boundary to accept, in order.
  readonly acceptances: readonly AgentLaunchRequest[];
  // The project and host of every model choices read the page asked for.
  readonly choicesAsked: () => readonly ChoicesRead[];
  // From the next read on, `host` answers `choices` for `source`, or for
  // every project without its own when `source` is omitted.
  readonly answerChoices: (
    host: string,
    choices: HostChoices,
    source?: string,
  ) => void;
  // The next host choices read waits until released, then answers what is
  // arranged by then.
  readonly holdNextChoices: () => HeldAnswer;
  // The next acceptance is answered, but the answer never reaches the page.
  readonly loseNextAcceptance: () => void;
  // Answers every wait the page has begun for an accepted attempt's change,
  // or else the next it begins: it changed, so the page reads the machine's
  // sessions again.
  readonly tellChanged: () => Promise<void>;
};

export type ChoicesRead = { readonly source: string; readonly host: string };

// The Codex stand-in's default catalog (./fakeCodexCatalog.ts) as the
// boundary answers it: Native Sol at low or ultra effort, Native Luna at low.
export const nativeCodexChoices = {
  models: [
    {
      model: "native-sol",
      name: "Native Sol",
      description: "Host supplied Sol description",
      efforts: [
        { effort: "low", description: "Quick" },
        { effort: "ultra", description: "Deep" },
      ],
    },
    {
      model: "native-luna",
      name: "Native Luna",
      description: "Host supplied Luna description",
      efforts: [{ effort: "low", description: "Quick" }],
    },
  ],
} satisfies LaunchHostOptions;

// Unless `accept` answers an acceptance itself, every launch is refused with
// `refusal`; an answered acceptance launches nothing either.
export async function installFrontendLaunchBoundary(
  page: Page,
  {
    refusal = "Nothing is launched from a frontend test.",
    accept,
  }: {
    readonly refusal?: string;
    readonly accept?: (request: AgentLaunchRequest) => Acceptance;
  } = {},
): Promise<FrontendLaunchBoundary> {
  const acceptances: AgentLaunchRequest[] = [];
  const asked: ChoicesRead[] = [];
  const choices = new Map<string, HostChoices>();
  let nextHold: AnswerHold | undefined;
  let loseNext = false;
  const changeWaits: Route[] = [];
  let changedUntold = false;
  // A wait still unanswered when the case ends is cut off.
  endWithPage(page, async () => {
    for (const wait of changeWaits.splice(0))
      await wait.abort().catch(() => undefined);
  });
  await page.route(
    (url) => url.pathname === agentAcceptEndpoint,
    async (route) => {
      const request = route.request().postDataJSON() as AgentLaunchRequest;
      acceptances.push(request);
      const lost = loseNext;
      loseNext = false;
      if (accept === undefined)
        await fulfillJson(route, { error: refusal }, 422);
      else {
        const answer = accept(request);
        if (lost) await route.abort("connectionreset");
        else await fulfillJson(route, answer);
      }
    },
  );
  await page.route(
    (url) => url.pathname === agentChangedEndpoint,
    async (route) => {
      if (!changedUntold && !changedSinceSeen(page, route.request().url())) {
        changeWaits.push(route);
        return;
      }
      changedUntold = false;
      await fulfillJson(route, { changed: true });
    },
  );
  await page.route(
    (url) => url.pathname === launchAttachmentEndpoint,
    async (route) => {
      await fulfillJson(route, { error: refusal }, 422);
    },
  );
  await page.route(
    (url) => url.pathname === launchHostOptionsEndpoint,
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const read = {
        source: params.get("source") ?? "",
        host: params.get("host") ?? "",
      };
      asked.push(read);
      const hold = nextHold;
      nextHold = undefined;
      await answerHeld(hold, async () => {
        const answer =
          choices.get(`${read.source} ${read.host}`) ?? choices.get(read.host);
        if (answer === undefined) await route.fallback();
        else if (answer === "unreadable")
          await fulfillJson(
            route,
            { error: "Model choices could not be read." },
            503,
          );
        else await fulfillJson(route, answer);
      });
    },
  );
  return {
    acceptances,
    answerChoices: (host, answer, source) => {
      choices.set(source === undefined ? host : `${source} ${host}`, answer);
    },
    choicesAsked: () => [...asked],
    holdNextChoices: () => {
      const { held, hold } = holdAnswer(page);
      nextHold = hold;
      return held;
    },
    loseNextAcceptance: () => {
      loseNext = true;
    },
    tellChanged: async () => {
      const waits = changeWaits.splice(0);
      changedUntold = waits.length === 0;
      for (const wait of waits) await fulfillJson(wait, { changed: true });
    },
  };
}

// Whether the machine's read now observes the waited attempt settled, or
// changed since the observation counting the wait's `seen` changes; an
// attempt it does not observe is left to the case.
function changedSinceSeen(page: Page, wait: string): boolean {
  const named = new URL(wait).searchParams;
  const observed = frontendServicesOf(page)?.machine?.attempts.find(
    (attempt) => attempt.id === named.get("attempt"),
  );
  if (observed === undefined) return false;
  const seen = named.get("seen");
  return (
    !observed.running ||
    observed.outcome !== undefined ||
    (seen !== null && Number(seen) !== observed.changes)
  );
}
