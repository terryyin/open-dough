// The synthetic CLI's in-process transport called directly against a local
// fake GitHub, with its origin given explicitly: no `gh` executable, request
// owner or mounted environment takes part. The real owner and the shell CLI are
// proven by Distribution/tests/test-runner/fake-gh-real-owner.sh.
import { test as base } from "vitest";
import {
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { runFakeGh } from "../../test-support/support/fakeGhTransport.mjs";

type RawCall = {
  error: (Error & { code?: string | number }) | null;
  stdout: Buffer;
  stderr: Buffer;
  pid: unknown;
};

function frameClient(github: FakeGitHub) {
  const env = { FAKE_GH_ORIGIN: github.url };
  return {
    github,
    raw: (args: string[], options: Record<string, unknown> = {}) =>
      new Promise<RawCall>((resolve) => {
        const child = runFakeGh(
          args,
          { env, encoding: "buffer", ...options },
          (error: Error | null, stdout: Buffer, stderr: Buffer) => {
            resolve({ error, stdout, stderr, pid: Reflect.get(child, "pid") });
          },
        );
      }),
  };
}

export const test = base.extend<{ client: ReturnType<typeof frameClient> }>({
  // eslint-disable-next-line no-empty-pattern
  client: async ({}, use) => {
    const github = await startFakeGitHub();
    try {
      await use(frameClient(github));
    } finally {
      await github.close();
    }
  },
});
