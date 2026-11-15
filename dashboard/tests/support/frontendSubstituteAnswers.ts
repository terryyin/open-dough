// How frontend service substitutes answer the page: a JSON reply, and one
// answer held once asked until the test releases it.

import type { Page, Route } from "@playwright/test";

export async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

// What a test observes of a held answer: when the page asked, when the answer
// reached it, and the release that lets it go.
export type HeldAnswer = {
  readonly received: Promise<void>;
  readonly delivered: Promise<void>;
  readonly release: () => void;
};

// Answers a substitute still holds when its page's case ends, each ending
// its request so the page's routes can be removed (./frontendApp.ts).
const unfinished = new WeakMap<Page, (() => Promise<void>)[]>();

export function endWithPage(page: Page, end: () => Promise<void>): void {
  unfinished.set(page, [...(unfinished.get(page) ?? []), end]);
}

export async function endHeldAnswers(page: Page): Promise<void> {
  const ends = unfinished.get(page) ?? [];
  unfinished.delete(page);
  for (const end of ends) await end();
}

// The substitute's side of a held answer, consumed by `answerHeld`.
export type AnswerHold = {
  readonly received: () => void;
  readonly released: Promise<void>;
  readonly delivered: () => void;
};

// A held answer for a request to `page`; one still held when the page's case
// ends is released then.
export function holdAnswer(page: Page): {
  held: HeldAnswer;
  hold: AnswerHold;
} {
  let received: () => void = () => undefined;
  let delivered: () => void = () => undefined;
  let release: () => void = () => undefined;
  const held: HeldAnswer = {
    received: new Promise<void>((resolve) => {
      received = resolve;
    }),
    delivered: new Promise<void>((resolve) => {
      delivered = resolve;
    }),
    release: () => {
      release();
    },
  };
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  endWithPage(page, () => {
    release();
    return Promise.resolve();
  });
  return { held, hold: { received, released, delivered } };
}

// Answers through `answer`; a `hold` reports the request received, waits for
// its release, and reports the answer delivered once `answer` completes.
export async function answerHeld(
  hold: AnswerHold | undefined,
  answer: () => Promise<void>,
): Promise<void> {
  hold?.received();
  await hold?.released;
  await answer();
  hold?.delivered();
}
