// A preparation-page case's private origin
// (../../test-support/support/preparationPage.ts) waits for its worker's
// queued origins: both hosts' bases are requested together, so a first case
// of either host, or one overriding its revision, copies a prepared base.
// Each copy's own installation and revisions are proven by
// ../launches/start-origin-isolation.spec.ts and
// ../launches/start-origin-private.spec.ts.
import { expect, test } from "vitest";
import { serverInputKeys } from "../../test-support/support/serverInputWorkerFixtures.ts";
import { preparationOrigin } from "../../test-support/support/preparationOrigin.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";
import {
  startOriginArtifactKey,
  type StartRepository,
} from "../../test-support/support/startOriginPreparation.ts";

test("both hosts' queued origins are requested before the first private copy, with no served inputs", async () => {
  expect(await serverInputKeys(["claude", "codex"], undefined)).toEqual([
    startOriginArtifactKey("claude", "queued"),
    startOriginArtifactKey("codex", "queued"),
  ]);
});

test("a preparation case's private origin waits until the queued origins are ready", async () => {
  let ready!: () => void;
  const queuedOriginsReady = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const started: string[] = [];
  // The description passes through untouched.
  const description = {} as StartRepository;
  const origin = preparationOrigin((given, { host }) => {
    if (given === description) started.push(host);
    return Promise.resolve({ cleanup: () => undefined } as StartOrigin);
  })(
    {
      queuedOriginsReady,
      originRepository: description,
      preparationHost: "codex",
    },
    () => Promise.resolve(),
  );
  await Promise.resolve();
  expect(started).toEqual([]);
  ready();
  await origin;
  expect(started).toEqual(["codex"]);
});
