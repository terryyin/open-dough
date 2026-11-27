// Add (../../server/projectConfigurationBoundary.ts) discovers the added
// project's branch through Git while a rate limit GitHub directed holds back
// this process's API reads (../../server/ghRead.ts), in-process over raw HTTP
// with a synthetic `gh` answering from the fake GitHub and Git routed through
// the private HOME: Add asks GitHub nothing, and the API wait still stands.
// What Add admits and how its Git transport ends:
// ./project-add-boundary.spec.ts; the wait itself:
// ../observation/authenticated-read-admission.spec.ts.
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { execGh } from "../../server/ghRead.ts";
import { installProjectConfigurationMiddleware } from "../../server/projectConfigurationBoundary.ts";
import { projectAddEndpoint } from "../../src/projectConfiguration.ts";
import {
  privateSettingsMachine,
  type PrivateSettingsMachine,
} from "../support/privateSettingsMachine.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../test-support/support/fakeGh.ts";
import {
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { routeDashboardHome } from "../../test-support/support/fixtureOriginRoute.ts";
import {
  addedBranch,
  addedLocalPath,
  addedRepository,
  projectAddMachine,
} from "../../test-support/support/projectAddMachine.ts";
import { startInProcessBoundaryHttp } from "../../test-support/support/inProcessBoundaryHttp.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { rateLimitedAnswer } from "../../test-support/originAnswers.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";

const source = makeMe.aPublishedSource.openDough.please();
const seedRead = [
  "api",
  `repos/${source.repository}/contents/seed.md?ref=${"c3".repeat(20)}`,
];

let fixture: ReturnType<typeof projectAddMachine>;
let machine: PrivateSettingsMachine;
let github: FakeGitHub;
let cleanups: (() => void | Promise<void>)[];
beforeEach(async () => {
  cleanups = [];
  machine = privateSettingsMachine();
  cleanups.push(machine.close);
  fixture = projectAddMachine();
  cleanups.push(() => fixture.close());
  github = await startFakeGitHub();
  cleanups.push(() => github.close());
});
afterEach(async () => {
  for (const cleanup of cleanups.reverse()) await cleanup();
});

test("Add discovers the branch through Git while API reads remain held back, asking GitHub nothing", async () => {
  const home = path.join(fixture.machine, "home");
  routeDashboardHome(home, github);
  await fixture.serveOn(github);
  github.serve(source.repository, () =>
    Promise.resolve(rateLimitedAnswer(429, { "Retry-After": "600" })),
  );
  const gh = installFakeGh(fixture.machine);
  cleanups.push(() => endFakeGh(gh));
  cleanups.push(withRestoredEnv({ ...fakeGhEnv(gh, github.url), HOME: home }));
  const server = await startInProcessBoundaryHttp(
    {
      name: "dough-project-configuration",
      install: installProjectConfigurationMiddleware,
    },
    "production",
  );
  cleanups.push(async () => {
    await server.closeBoundary();
    await server.closeHttp();
  });

  const limited = await execGh(seedRead, new AbortController().signal);
  expect(limited.failure).toMatchObject({
    kind: "rate-limited",
    waitSeconds: 600,
  });
  const before = github.calls.length;

  const added = await rawRequest({
    url: `${server.origin}${projectAddEndpoint}`,
    method: "POST",
    headers: { Origin: server.origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      githubUrl: `https://github.com/${addedRepository}`,
      localPath: addedLocalPath,
    }),
  });
  expect(added.status).toBe(200);
  expect(JSON.parse(added.body)).toMatchObject({
    project: { repository: addedRepository, ref: addedBranch },
  });

  const held = await execGh(seedRead, new AbortController().signal);
  expect(held.failure).toMatchObject({ kind: "held-back" });
  expect((held.failure as { waitSeconds: number }).waitSeconds).toBeGreaterThan(
    590,
  );
  expect(github.calls.length).toBe(before);
});
