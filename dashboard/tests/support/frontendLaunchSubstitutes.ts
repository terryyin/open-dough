// Launch boundary answers for frontend-only launch dialog journeys, in place
// of dashboardServer and the native hosts: the acceptance a dialog's Start
// asks for (../../server/launchBoundary.ts), image uploads, and a host's model
// choices (../../server/launchHostOptionsResponse.ts). Every acceptance and
// upload the page asked for stays inspectable; an acceptance is refused unless
// the case answers it, and nothing is ever launched. A host's choices answer
// what is arranged for the project and host when the read is answered, or no
// choices as the default substitutes do; a held read waits until released,
// and an unreadable one answers as the boundary does.

import type { Page } from "@playwright/test";
import {
  agentAcceptEndpoint,
  type Acceptance,
  type AgentLaunchRequest,
} from "../../src/agentLaunch.ts";
import { launchAttachmentEndpoint } from "../../src/launchAttachments.ts";
import {
  launchHostOptionsEndpoint,
  type LaunchHostOptions,
} from "../../src/launchHostOptions.ts";
import {
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

// What a host's model choices read answers: its choices, or that they could
// not be read.
export type HostChoices = LaunchHostOptions | "unreadable";

export type FrontendLaunchBoundary = {
  // Every launch the page asked the boundary to accept, in order.
  readonly acceptances: readonly AgentLaunchRequest[];
  // How many image uploads the page sent.
  readonly uploads: () => number;
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
  let uploads = 0;
  const asked: ChoicesRead[] = [];
  const choices = new Map<string, HostChoices>();
  let nextHold: AnswerHold | undefined;
  await page.route(
    (url) => url.pathname === agentAcceptEndpoint,
    async (route) => {
      const request = route.request().postDataJSON() as AgentLaunchRequest;
      acceptances.push(request);
      if (accept === undefined)
        await fulfillJson(route, { error: refusal }, 422);
      else await fulfillJson(route, accept(request));
    },
  );
  await page.route(
    (url) => url.pathname === launchAttachmentEndpoint,
    async (route) => {
      uploads += 1;
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
      hold?.received();
      await hold?.released;
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
      hold?.delivered();
    },
  );
  return {
    acceptances,
    uploads: () => uploads,
    answerChoices: (host, answer, source) => {
      choices.set(source === undefined ? host : `${source} ${host}`, answer);
    },
    choicesAsked: () => [...asked],
    holdNextChoices: () => {
      const { held, hold } = holdAnswer();
      nextHold = hold;
      return held;
    },
  };
}
