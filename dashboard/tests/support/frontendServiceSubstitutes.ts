// Explicit route/WebSocket substitutes for frontend-only app journeys: the
// page talks to these instead of dashboardServer, fake-gh, or FakeGitHub.

import type { Page, Route } from "@playwright/test";
import { agentTerminalEndpoint } from "../../src/agentTerminal.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { hostStatusEndpoint } from "../../src/hostStatus.ts";
import { launchHostOptionsEndpoint } from "../../src/launchHostOptions.ts";
import { projectListEndpoint } from "../../src/projectConfiguration.ts";
import {
  defaultFrontendServiceState,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

export {
  defaultFrontendServiceState,
  doughnutSource,
  emptyMachineAnswer,
  frontendRevision,
  openDoughSource,
  putFrontendCandidates,
  putFrontendHostStatus,
  putFrontendMachine,
  takenBacklogMarkdown,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function answerAuthenticatedRead(
  state: FrontendServiceState,
  params: URLSearchParams,
): { status: number; body: unknown } {
  const revision = params.get("revision") ?? state.revision;
  if (params.has("since")) {
    return {
      status: 200,
      body: { revision: state.revision, changed: false, branches: [] },
    };
  }
  if (params.get("intent") === "locations") {
    return { status: 200, body: state.locations };
  }
  if (params.get("intent") === "test-optimization-candidates") {
    return { status: 200, body: state.candidates };
  }
  if (params.get("agents") === "profiles") {
    return {
      status: 200,
      body: {
        revision,
        profiles: [],
        settings: state.files[".planning/open-dough.json"] ?? null,
      },
    };
  }
  if (params.get("done") === "catalog") {
    return {
      status: 200,
      body: {
        revision,
        catalog: JSON.stringify({
          schemaVersion: 1,
          records: [],
          unreadable: [],
        }),
      },
    };
  }
  if (params.get("done") === "bodies") {
    return { status: 200, body: { revision, records: [] } };
  }
  const filePath = params.get("path");
  if (filePath !== null) {
    const text = state.files[filePath];
    if (text === undefined) {
      return {
        status: 404,
        body: { error: `Unknown path ${filePath}`, recovery: "transient" },
      };
    }
    if (params.get("committed") === "last") {
      return {
        status: 200,
        body: {
          revision,
          path: filePath,
          committedAt: "2026-11-01T00:00:00.000Z",
        },
      };
    }
    if (params.get("committed") === "added") {
      return {
        status: 200,
        body: {
          revision,
          path: filePath,
          added: {
            commit: revision,
            committerName: "Test",
            committedAt: "2026-11-01T00:00:00.000Z",
            login: "tester",
          },
        },
      };
    }
    return { status: 200, body: { revision, path: filePath, text } };
  }
  return {
    status: 200,
    body: {
      revision: state.revision,
      backlog: state.backlog,
      askedAt: "2026-11-05T08:00:00.000Z",
    },
  };
}

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
      await fulfillJson(route, answer.body, answer.status);
    },
  );
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() !== "GET") {
        await fulfillJson(route, { error: "Not used in frontend tests." }, 405);
        return;
      }
      await fulfillJson(route, state.machine);
    },
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
  await page.route(
    (url) => url.pathname === launchHostOptionsEndpoint,
    (route) => fulfillJson(route, state.hostOptions),
  );
  // Catch-all for remaining local API paths: fail loudly when a substitute is
  // missing. Leave the terminal WebSocket path alone so routeWebSocket can own it.
  const known = new Set([
    projectListEndpoint,
    authenticatedReadEndpoint,
    agentLaunchEndpoint,
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

// Terminal WebSocket that reports attached and echoes input as text output.
export async function installAttachedTerminalSubstitute(
  page: Page,
  options: { readonly attachedLine?: string } = {},
): Promise<{ readonly sent: string[] }> {
  const sent: string[] = [];
  const attachedLine =
    options.attachedLine ?? "attached abcdef12\r\nClaude Code\r\n";
  await page.routeWebSocket(`**${agentTerminalEndpoint}**`, (ws) => {
    ws.onMessage((message) => {
      if (typeof message !== "string") return;
      const parsed = JSON.parse(message) as { input?: unknown };
      if (typeof parsed.input === "string") {
        sent.push(parsed.input);
        ws.send(parsed.input);
      }
    });
    // Binary readiness frame, then text output the page renders.
    ws.send(Buffer.from(JSON.stringify({ readiness: "attached" }), "utf8"));
    ws.send(attachedLine);
  });
  return { sent };
}
