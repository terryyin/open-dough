import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";
import { claudeHost } from "../../server/claudeHost.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { localFolder } from "../../server/localFolder.ts";
import { installFakeClaude } from "../../test-support/support/fakeClaude.ts";
import {
  deploymentLikeStart,
  expectDeveloperShellEnvironment,
} from "../../test-support/support/launchEnvironment.ts";

test("a deployed Dashboard launches Claude with the developer's shell environment", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "dough-deployment-"));
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(root, { recursive: true, force: true });
  });
  const native = installFakeClaude(
    root,
    { binDir: root, path: process.env["PATH"] ?? "" },
    {},
  );
  const start = deploymentLikeStart(path.join(root, "deployment"));
  start.create();
  const environment = {
    ...native.env,
    ...start.extraEnv,
    PATH: [...start.pathPrefix, native.env["PATH"]].join(path.delimiter),
    NODE_ENV: "production",
  };
  for (const [key, value] of Object.entries(environment))
    vi.stubEnv(key, value);

  const answer = await claudeHost.launch(
    makeMe.aPublishedSource.openDough.please(),
    recordedRequest(
      makeMe.aLaunchRequest.executing(storyA).please(),
      new Date(),
    ),
    localFolder(root),
    new AbortController().signal,
  );

  expect(answer.kind).toBe("launched");
  const observed = native.controls.claudeLaunchEnvironments();
  expect(observed).toHaveLength(1);
  expectDeveloperShellEnvironment(observed[0]);
});
