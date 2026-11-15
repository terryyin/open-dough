// Explicit route substitutes for frontend-only app journeys: the page talks
// to these instead of dashboardServer, fake-gh, or FakeGitHub. Terminal
// WebSocket install lives in ./frontendTerminalSubstitute.ts.

import type { Page } from "@playwright/test";
import { agentTerminalEndpoint } from "../../src/agentTerminal.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { completedStoryAssociationEndpoint } from "../../src/completedStoryAssociation.ts";
import { hostStatusEndpoint } from "../../src/hostStatus.ts";
import { launchHostOptionsEndpoint } from "../../src/launchHostOptions.ts";
import { projectListEndpoint } from "../../src/projectConfiguration.ts";
import { answerAuthenticatedRead } from "./frontendAuthenticatedReadSubstitute.ts";
import {
  defaultFrontendServiceState,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  fulfillEventStream,
  fulfillJson,
} from "./frontendSubstituteAnswers.ts";

export { installAttachedTerminalSubstitute } from "./frontendTerminalSubstitute.ts";

// Installs substitutes for every backend endpoint a typical page open touches.
// Specs override individual routes afterward for the synthetic answers under test.
export async function installFrontendServiceSubstitutes(
  page: Page,
  state: FrontendServiceState = defaultFrontendServiceState(),
): Promise<FrontendServiceState> {
  await page.route(
    (url) => url.pathname === projectListEndpoint,
    (route) => fulfillJson(route, state.projects),
  );
  await page.route(
    (url) => url.pathname === authenticatedReadEndpoint,
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const answer = answerAuthenticatedRead(state, params);
      if (answer.stream) await fulfillEventStream(route, answer.body);
      else await fulfillJson(route, answer.body, answer.status);
    },
  );
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() !== "GET") {
        await fulfillJson(route, { error: "Not used in frontend tests." }, 405);
        return;
      }
      if (state.machine === undefined) {
        await fulfillJson(route, { error: "Ask again." }, 503);
        return;
      }
      await fulfillJson(route, state.machine);
    },
  );
  // Default: no published Done-story link. Slice 3 owns a controllable
  // association family; presentation journeys only need standalone settle.
  await page.route(
    (url) => url.pathname === completedStoryAssociationEndpoint,
    (route) => fulfillJson(route, { kind: "absent" }),
  );
  await page.route(
    (url) => url.pathname === hostStatusEndpoint,
    async (route) => {
      if (state.hostStatus === undefined) {
        await fulfillJson(route, { error: "Ask again." }, 503);
        return;
      }
      await fulfillJson(route, state.hostStatus);
    },
  );
  // A host offers no model choices unless a case arranges them
  // (./frontendLaunchSubstitutes.ts).
  await page.route(
    (url) => url.pathname === launchHostOptionsEndpoint,
    (route) => fulfillJson(route, { models: [] }),
  );
  // Catch-all for remaining local API paths: fail loudly when a substitute is
  // missing. Leave the terminal WebSocket path alone so routeWebSocket can own it.
  const known = new Set([
    projectListEndpoint,
    authenticatedReadEndpoint,
    agentLaunchEndpoint,
    completedStoryAssociationEndpoint,
    hostStatusEndpoint,
    launchHostOptionsEndpoint,
    agentTerminalEndpoint,
  ]);
  await page.route(
    (url) =>
      url.pathname.startsWith("/__") &&
      !known.has(url.pathname) &&
      !url.pathname.startsWith(`${agentTerminalEndpoint}/`),
    (route) =>
      fulfillJson(
        route,
        {
          error: `No frontend substitute for ${new URL(route.request().url()).pathname}`,
        },
        501,
      ),
  );
  return state;
}
