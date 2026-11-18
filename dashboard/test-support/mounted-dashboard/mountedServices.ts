import { vi } from "vitest";
import {
  agentAcceptEndpoint,
  agentLaunchEndpoint,
} from "../../src/agentLaunch.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { ciFollowUpEndpoint } from "../../src/ciFollowUp.ts";
import { completedStoryAssociationEndpoint } from "../../src/completedStoryAssociation.ts";
import { hostStatusEndpoint } from "../../src/hostStatus.ts";
import { launchHostOptionsEndpoint } from "../../src/launchHostOptions.ts";
import { projectListEndpoint } from "../../src/projectConfiguration.ts";
import { storyNotesEndpoint } from "../../src/storyNote.ts";
import { terminalThemeEndpoint } from "../../src/terminalThemeSetting.ts";
import { storyReviewStateEndpoint } from "../../src/storyReviewState.ts";
import { answerAuthenticatedRead } from "../support/frontendAuthenticatedReadSubstitute.ts";
import {
  numberedNewStoryNotes,
  StoryNotesRule,
} from "../support/frontendStoryNotesRule.ts";
import type { MountedServiceAnswers } from "../support/mountedDashboardCommands.ts";

function reply(body: unknown, status = 200) {
  const payload = JSON.stringify(body);
  return Object.assign(new Response(null, { status }), {
    json: () => Promise.resolve().then((): unknown => JSON.parse(payload)),
    text: () => Promise.resolve(payload),
  });
}

const heldAnswers = new Map<string, () => void>();

export function answersStillHeld() {
  return [...heldAnswers.keys()];
}

export function endHeldAnswers() {
  for (const end of heldAnswers.values()) end();
  heldAnswers.clear();
}

function holdAnswer(pathname: string) {
  return new Promise<Response>((...[, reject]) => {
    const end = () => {
      heldAnswers.delete(pathname);
      reject(new DOMException(`Held ${pathname} ended`, "AbortError"));
    };
    heldAnswers.set(pathname, end);
  });
}

export function answerMountedServices(
  state: MountedServiceAnswers,
  held: readonly string[] = [],
) {
  const launchAcceptances: unknown[] = [];
  const unanswered: string[] = [];
  const browserFetch = window.fetch.bind(window);
  const notes = new StoryNotesRule<never>(numberedNewStoryNotes());
  for (const [project, byStory] of Object.entries(state.notes ?? {}))
    notes.setNotes(project, byStory);
  const answers = new Map<string, unknown>([
    [projectListEndpoint, state.projects],
    [agentLaunchEndpoint, state.machine],
    [hostStatusEndpoint, state.hostStatus],
    [ciFollowUpEndpoint, { cards: [] }],
    [completedStoryAssociationEndpoint, { kind: "unassociated" }],
    [launchHostOptionsEndpoint, { models: [] }],
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
      if (held.includes(url.pathname)) return holdAnswer(url.pathname);
      const requestBody = (): unknown =>
        typeof options?.body === "string"
          ? JSON.parse(options.body)
          : undefined;
      if (url.pathname === storyNotesEndpoint) {
        const answer = notes.answer({
          project: url.searchParams.get("id") ?? "",
          method: options?.method ?? "GET",
          body: requestBody(),
        });
        if (answer.kind === "unreachable")
          throw new TypeError("Failed to fetch");
        return reply(answer.body, answer.status);
      }
      if (url.pathname === agentAcceptEndpoint) {
        launchAcceptances.push(requestBody() ?? input);
        return reply({ error: "No launch expected" }, 405);
      }
      if (answers.has(url.pathname)) return reply(answers.get(url.pathname));
      if (
        url.pathname.startsWith("/__") &&
        !url.pathname.startsWith("/__vitest")
      ) {
        unanswered.push(url.pathname);
        throw new Error(`No mounted answer for ${url.pathname}`);
      }
      return browserFetch(input, options);
    },
  );
  return { launchAcceptances, unanswered, notes };
}
