// One fake GitHub answer held back (./fakeGitHub.ts): `answer` answers every
// request as `answerer` does, except each request `isHeld` picks, which is
// answered only once `release` is called, or never when it is not.

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
