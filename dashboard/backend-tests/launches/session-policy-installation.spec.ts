// An ad hoc Start's workspace and landing choice is admitted only when the
// project's installed skills can establish a session without a story
// (../../server/launchSessionPolicy.ts). A refused choice is refused before
// anything is accepted; the default choices need nothing of the installation.
// The origin's installation, without its session formatter, is read and never
// changed, so every case shares it.
import { afterAll, beforeAll, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { withSessionPolicy } from "../../server/launchSessionPolicy.ts";
import type { LocalFolder } from "../../server/localFolder.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import {
  withoutSessionFormatter,
  worktrees,
} from "../../test-support/support/startSessionLanding.ts";

let origin: StartOrigin;
let project: LocalFolder;

beforeAll(async () => {
  origin = await startOrigin(queuedReadyRepository().please());
  withoutSessionFormatter(origin);
  project = { path: origin.project, shown: "~/git/open-dough" };
});

afterAll(() => {
  origin.cleanup();
});

for (const [policy, named] of [
  [
    { workspace: "default-checkout", landing: "auto-land" },
    "Execution checkout · Automatically land",
  ],
  [
    { workspace: "isolated", landing: "review" },
    "Isolated workspace · Wait for review",
  ],
] as const) {
  test(`${named} is refused before anything is accepted`, async () => {
    const request = makeMe.aLaunchRequest
      .adHoc()
      .withInstruction("Hello")
      .withPolicy(policy)
      .please();

    await expect(withSessionPolicy(request, project)).rejects.toMatchObject({
      status: 400,
      message: `${named} cannot be selected: the installed skills in ~/git/open-dough do not establish a session without a story.`,
    });
    expect(worktrees(origin.project)).toEqual([]);
  });
}

test("the default choices are admitted as asked", async () => {
  const request = makeMe.aLaunchRequest
    .adHoc()
    .withInstruction("Hello")
    .please();

  await expect(withSessionPolicy(request, project)).resolves.toEqual(request);
});
