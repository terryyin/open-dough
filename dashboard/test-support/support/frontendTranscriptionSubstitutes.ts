// Transcription answers for frontend-only voice journeys, in place of
// dashboardServer's transcription proxy and its provider
// (../../server/instructionTranscriptionBoundary.ts): the machine has a saved
// OpenAI key (./frontendSettingsSubstitutes.ts), and every clip the page
// posts is answered with the current transcript. Every clip the page posted
// stays countable, and every one it abandoned before its answer arrived; a
// held answer waits until released.

import type { Page } from "@playwright/test";
import { instructionTranscriptionEndpoint } from "../../src/instructionTranscription.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { installFrontendSettingsSubstitutes } from "./frontendSettingsSubstitutes.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

export type FrontendTranscription = {
  // How many clips the page posted for transcription.
  readonly clips: () => number;
  // How many of those the page abandoned before their answer reached it.
  readonly abandoned: () => number;
  // From the next clip on, the transcript answered.
  readonly answerText: (text: string) => void;
  // The next clip's answer waits until released.
  readonly holdNext: () => HeldAnswer;
};

export async function installFrontendTranscription(
  page: Page,
  services: FrontendServiceState,
): Promise<FrontendTranscription> {
  await installFrontendSettingsSubstitutes(page, services, {
    projects: services.projects.map((project) => ({
      ...project,
      localPath: `~/git/${project.id}`,
    })),
    openAIConfigured: true,
  });
  let clips = 0;
  let abandoned = 0;
  let text = "Do not implement yet";
  let nextHold: AnswerHold | undefined;
  const transcription = (url: URL) =>
    url.pathname === instructionTranscriptionEndpoint;
  page.on("requestfailed", (request) => {
    if (transcription(new URL(request.url()))) abandoned += 1;
  });
  await page.route(transcription, async (route) => {
    clips += 1;
    const answer = { text };
    const hold = nextHold;
    nextHold = undefined;
    // A clip the page abandoned meanwhile has no one left to answer.
    await answerHeld(hold, () =>
      fulfillJson(route, answer).catch(() => undefined),
    );
  });
  return {
    clips: () => clips,
    abandoned: () => abandoned,
    answerText: (next) => {
      text = next;
    },
    holdNext: () => {
      const { held, hold } = holdAnswer(page);
      nextHold = hold;
      return held;
    },
  };
}
