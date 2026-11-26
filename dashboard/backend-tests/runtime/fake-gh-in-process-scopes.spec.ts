// Distinct server lifetimes and deliberately shared owners keep their scope.
import { fileURLToPath } from "node:url";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { defaultRepository } from "../../test-support/publishedOriginBasics.ts";
import {
  developmentBoundary,
  startDashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  everyRepository,
  publishes,
  startFakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { expectServedHomesReach } from "../../test-support/support/fixtureOriginRoute.ts";
import { requestOwnerWithClock } from "../../test-support/support/listingReuseWithOwnerClock.ts";
import { readAt } from "../../test-support/support/sharedReads.ts";
import {
  dashboardsOnOneOwner,
  withWorkflow,
} from "../../test-support/support/sharedRequestOwner.ts";
import { expect, poisonApi, test } from "../support/fakeGhInProcess.ts";

test("simultaneous servers keep distinct answers across a restart on one machine", async ({
  client,
}) => {
  const otherGitHub = await startFakeGitHub();
  const firstPublished = publishes({});
  const secondPublished = publishes({});
  const firstRevision = firstPublished.revision;
  const secondRevision = secondPublished.revision;
  client.github.serve(everyRepository, firstPublished);
  otherGitHub.serve(everyRepository, secondPublished);
  const options = {
    ...developmentBoundary,
    liveServer: "separate process",
    machine: client.root,
    github: client.github,
    pathPrefix: [client.gh.binDir],
  };
  const first = await startDashboardServer(options);
  const second = await startDashboardServer({
    ...developmentBoundary,
    github: otherGitHub,
    pathPrefix: [client.gh.binDir],
  });
  let restarted: typeof first | undefined;
  try {
    const answers = await Promise.all(
      [first, second].map((server) => readAt(server, "")),
    );
    expect(answers.map(({ status }) => status)).toEqual([200, 200]);
    expect(
      answers.map(
        ({ body }) => (JSON.parse(body) as { revision: string }).revision,
      ),
    ).toEqual([firstRevision, secondRevision]);
    await first.close();
    restarted = await startDashboardServer({
      ...options,
      port: Number(new URL(first.baseURL).port),
    });
    expect(JSON.parse((await readAt(restarted, "")).body)).toMatchObject({
      revision: firstRevision,
    });
    expect(JSON.parse((await readAt(second, "")).body)).toMatchObject({
      revision: secondRevision,
    });
    expect(first.ghPid()).toBeUndefined();
    expect(second.ghPid()).toBeUndefined();
    expect(restarted.ghPid()).toBeUndefined();
    expect(client.apiLaunched()).toBe(false);
    expect(client.github.calls.length).toBeGreaterThan(0);
    expect(otherGitHub.calls.length).toBeGreaterThan(0);
  } finally {
    await restarted?.close();
    await first.close();
    await second.close();
    await stopCursorRunner(first.home);
    await otherGitHub.close();
  }
  expect(client.github.unansweredCalls).toBe(0);
});

test("two dashboards and the installed diagnostic use one fast owner", async ({
  client,
}) => {
  const machine = await dashboardsOnOneOwner();
  const launched = poisonApi(machine.gh, client.root);
  const published = publishes({});
  const { revision } = published;
  machine.serve(withWorkflow(published));
  try {
    expectServedHomesReach(machine.github, defaultRepository, revision);
    const answers = await Promise.all(
      [machine.first, machine.second].map((server) => readAt(server, "")),
    );
    expect(answers.map(({ status }) => status)).toEqual([200, 200]);
    expect(
      answers.map(
        ({ body }) => (JSON.parse(body) as { revision: string }).revision,
      ),
    ).toEqual([revision, revision]);
    const installed = fileURLToPath(
      new URL(
        "../../../.agents/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs",
        import.meta.url,
      ),
    );
    const workflow = await machine.ciWorkflowRead(installed);
    expect(workflow.exitCode).toBe(0);
    expect(JSON.parse(workflow.stdout)).toMatchObject({
      type: "CI_WORKFLOW",
      id: 7001,
    });
    expect(machine.owners()).toHaveLength(1);
    expect(launched()).toBe(false);
    expect(
      machine.github.calls.some(
        ({ request }) => request.kind === "actions-workflow",
      ),
    ).toBe(true);
  } finally {
    await machine.closeAll();
  }
  expect(machine.github.unansweredCalls).toBe(0);
});

test("an explicitly started clock-controlled owner composes both preloads", async ({
  client,
}) => {
  const owner = await requestOwnerWithClock(client.github);
  const launched = poisonApi(owner.gh, client.root);
  const published = publishes({});
  const { revision } = published;
  client.github.serve(everyRepository, published);
  const server = await startDashboardServer({
    ...developmentBoundary,
    github: client.github,
    ...owner.wiring,
  });
  try {
    expect(JSON.parse((await readAt(server, "")).body)).toMatchObject({
      revision,
    });
    const before = owner.ownerNow();
    owner.advanceOwnerClock(1234);
    expect(owner.ownerNow()).toBe(before + 1234);
    expect(owner.standingOwnerPid()).toBe(owner.ownerPid);
    expect(launched()).toBe(false);
    expect(server.ghPid()).toBeUndefined();
  } finally {
    await server.close();
    await owner.close();
  }
  expect(client.github.unansweredCalls).toBe(0);
});
