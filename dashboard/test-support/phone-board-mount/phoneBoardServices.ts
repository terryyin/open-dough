import { vi } from "vitest";
import {
  agentAcceptEndpoint,
  agentLaunchEndpoint,
} from "../../src/agentLaunch.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { completedStoryAssociationEndpoint } from "../../src/completedStoryAssociation.ts";
import { hostStatusEndpoint } from "../../src/hostStatus.ts";
import { launchHostOptionsEndpoint } from "../../src/launchHostOptions.ts";
import { projectListEndpoint } from "../../src/projectConfiguration.ts";
import { storyNotesEndpoint } from "../../src/storyNote.ts";
import { terminalThemeEndpoint } from "../../src/terminalThemeSetting.ts";
import { storyReviewStateEndpoint } from "../../src/storyReviewState.ts";
import { answerAuthenticatedRead } from "../support/frontendAuthenticatedReadSubstitute.ts";
import type { phoneBoardCommands } from "../support/mountedPhoneBoardCommands.ts";

function reply(body: unknown, status = 200) {
  const payload = JSON.stringify(body);
  return Object.assign(new Response(null, { status }), {
    json: () => Promise.resolve().then((): unknown => JSON.parse(payload)),
    text: () => Promise.resolve(payload),
  });
}

type Answers = ReturnType<
  typeof phoneBoardCommands.phoneBoardPublication
>["answers"];

export function answerPhoneBoardServices(state: Answers) {
  const launchAcceptances: unknown[] = [];
  const browserFetch = window.fetch.bind(window);
  const answers = new Map<string, unknown>([
    [projectListEndpoint, state.projects],
    [agentLaunchEndpoint, state.machine],
    [hostStatusEndpoint, state.hostStatus],
    [completedStoryAssociationEndpoint, { kind: "unassociated" }],
    [launchHostOptionsEndpoint, { models: [] }],
    [storyNotesEndpoint, { kind: "notes", notes: {} }],
    [storyReviewStateEndpoint, { reviewed: [] }],
    [terminalThemeEndpoint, { theme: "default" }],
  ]);
  vi.stubGlobal(
    "fetch",
    async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = new URL(
        input instanceof Request ? input.url : input,
        location.href,
      );
      if (url.pathname === authenticatedReadEndpoint) {
        const { body, status } = answerAuthenticatedRead(
          state,
          url.searchParams,
        );
        return reply(body, status);
      }
      if (url.pathname === agentAcceptEndpoint) {
        launchAcceptances.push(
          typeof options?.body === "string" ? JSON.parse(options.body) : input,
        );
        return reply({ error: "No launch expected" }, 405);
      }
      if (answers.has(url.pathname)) return reply(answers.get(url.pathname));
      if (
        url.pathname.startsWith("/__") &&
        !url.pathname.startsWith("/__vitest")
      ) {
        throw new Error(`No phone board answer for ${url.pathname}`);
      }
      return browserFetch(input, options);
    },
  );
  return launchAcceptances;
}
