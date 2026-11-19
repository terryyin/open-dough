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
import type { AnswerHold } from "../support/frontendSubstituteAnswers.ts";
import {
  answerStoryReview,
  createReviewBuckets,
} from "../support/frontendStoryReviewRule.ts";

function reply(body: unknown, status = 200) {
  const payload = JSON.stringify(body);
  return Object.assign(new Response(null, { status }), {
    json: () => Promise.resolve().then((): unknown => JSON.parse(payload)),
    text: () => Promise.resolve(payload),
  });
}

const notesHold = "next notes answer";
// Abandons the notes hold a case still keeps; unset once it is released or
// abandoned.
let keptHold: (() => void) | undefined;

export function refuseHoldFromEarlierCase() {
  if (keptHold) throw new Error(`The ${notesHold} is held by an earlier case.`);
}

// Ends a hold still kept by failing its request as an abort, as leaving a
// page does, so its stale answer reaches no board.
export function abandonKeptHold() {
  keptHold?.();
}

export function answerMountedServices(
  state: MountedServiceAnswers,
  // The notes service a case carries from an earlier mount, as the app's
  // own notes outlive a page load; otherwise a fresh one.
  carried?: StoryNotesRule<AnswerHold>,
) {
  const notes =
    carried ?? new StoryNotesRule<AnswerHold>(numberedNewStoryNotes());
  const launchAcceptances: unknown[] = [];
  const unanswered: string[] = [];
  const browserFetch = window.fetch.bind(window);
  for (const [project, byStory] of Object.entries(state.notes ?? {}))
    notes.setNotes(project, byStory);
  // Holds the rule's next notes answer: `received` resolves when the request
  // arrives, `release` sends its answer and `delivered` reads whether it was
  // sent. A hold still kept at cleanup is abandoned.
  const holdNextNotes = () => {
    if (keptHold) throw new Error(`The ${notesHold} is already held.`);
    let received: () => void = () => undefined;
    let deliver: () => void = () => undefined;
    let fail: (reason: unknown) => void = () => undefined;
    let sent = false;
    const arrived = new Promise<void>((resolve) => {
      received = resolve;
    });
    const released = new Promise<void>((resolve, reject) => {
      deliver = resolve;
      fail = reject;
    });
    // A hold whose request never arrives is abandoned with nothing awaiting it.
    void released.catch(() => undefined);
    const hold = {
      received,
      released,
      delivered: () => {
        sent = true;
      },
    };
    const end = (outcome: () => void) => {
      if (keptHold !== abandon) return;
      keptHold = undefined;
      if (notes.nextHold === hold) notes.nextHold = undefined;
      outcome();
    };
    const abandon = () => {
      end(() => {
        fail(new DOMException(`Held ${notesHold} abandoned`, "AbortError"));
      });
    };
    keptHold = abandon;
    notes.nextHold = hold;
    return {
      received: arrived,
      release: () => {
        end(deliver);
      },
      delivered: () => sent,
    };
  };
  const review =
    state.review && createReviewBuckets<never>(state.review.snapshot);
  for (const [path, diff] of Object.entries(state.review?.files ?? {}))
    review?.fileByPath.set(path, diff);
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
      const reviewAnswer =
        review && answerStoryReview(review, url.pathname, url.searchParams);
      if (reviewAnswer) return reply(reviewAnswer.body());
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
        if (answer.hold) {
          answer.hold.received();
          await answer.hold.released;
          answer.hold.delivered();
        }
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
  return {
    launchAcceptances,
    unanswered,
    notes,
    holdNextNotes,
  };
}
