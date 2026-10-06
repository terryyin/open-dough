// One GitHub answer held back (./fakeGitHub.ts): `answer` answers every call
// as `published` does, except each call whose request `isHeld` picks, which is
// answered only once `release` is called, or never when it is not.

import type { RepositoryAnswerer } from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";

export function holdingAnswer(
  published: RepositoryAnswerer,
  isHeld: (request: GhRequest) => boolean,
): { readonly answer: RepositoryAnswerer; readonly release: () => void } {
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  return {
    answer: async (call) => {
      if (isHeld(call.request)) {
        await released;
      }
      return published(call);
    },
    release: () => {
      release();
    },
  };
}
