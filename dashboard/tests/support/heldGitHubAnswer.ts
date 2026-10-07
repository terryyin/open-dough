// One fake GitHub answer held back (./fakeGitHub.ts): `answer` answers every
// request as `answerer` does, except each request `isHeld` picks, which is
// answered only once `release` is called, or never when it is not. Or each
// held answer released on its own, in the order its call arrived
// (`heldInTurn`).

import type { RepositoryAnswerer } from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";

export function holding<Request, Answer>(
  answerer: (request: Request) => Answer | Promise<Answer>,
  isHeld: (request: Request) => boolean,
): {
  readonly answer: (request: Request) => Promise<Answer>;
  readonly release: () => void;
} {
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  return {
    answer: async (request) => {
      if (isHeld(request)) {
        await released;
      }
      return answerer(request);
    },
    release: () => {
      release();
    },
  };
}

// A held `gh` answer: each call whose request `isHeld` picks is held.
export function holdingAnswer(
  published: RepositoryAnswerer,
  isHeld: (request: GhRequest) => boolean,
): { readonly answer: RepositoryAnswerer; readonly release: () => void } {
  return holding(published, (call) => isHeld(call.request));
}

// Held `gh` answers released one at a time: each call whose request `isHeld`
// picks waits until `releaseOldest` releases it, the longest-held first, or
// until `releaseAll`, after which nothing is held.
export function heldInTurn(
  published: RepositoryAnswerer,
  isHeld: (request: GhRequest) => boolean,
): {
  readonly answer: RepositoryAnswerer;
  readonly held: () => number;
  readonly releaseOldest: () => void;
  readonly releaseAll: () => void;
} {
  const held: (() => void)[] = [];
  let holding = true;
  return {
    answer: async (call) => {
      if (holding && isHeld(call.request)) {
        await new Promise<void>((resolve) => {
          held.push(resolve);
        });
      }
      return published(call);
    },
    held: () => held.length,
    releaseOldest: () => {
      held.shift()?.();
    },
    releaseAll: () => {
      holding = false;
      for (const release of held.splice(0)) release();
    },
  };
}
