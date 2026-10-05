// An accepted launch's changes are kept before the local launch owner
// (../server/agentLaunches.ts) answers them: while the write that first keeps
// the attempt's reporting context, then its outcome, is held just before the
// attempts file is replaced, the machine's attempts answer the attempt as the
// file still keeps it. The hold is a loader in the server that waits on the
// replacement whose new document first carries the held field. The launch's
// own lifetime is ./agent-launch-acceptance.spec.ts.

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { accept, attempts, launchRequest } from "./agentLaunchBoundary.ts";
import { keptAttempts as keptOfMachine } from "./acceptedAttempts.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type PushHold,
  type StartOrigin,
} from "./support/startOrigin.ts";
import { fsPromisesHook } from "./support/serverFsHook.ts";

const request = {
  ...launchRequest,
  identity: queuedIdentity,
  title: queuedTitle,
};

test.describe("an accepted launch whose change is being kept", () => {
  let origin: StartOrigin;
  let server: DashboardServer;
  let push: PushHold;

  // While it exists, names the field whose first keeping is held.
  const hold = () => path.join(origin.machine, "hold-kept-field");
  // Names the field whose keeping is held now.
  const reached = () => path.join(origin.machine, "kept-field-held");

  // Loaded into the server: holds the replacement of the attempts file whose
  // new document first carries the field `hold` names, until `hold` is gone.
  const keepHold = () =>
    fsPromisesHook(
      path.join(origin.machine, "hold-kept-field.mjs"),
      "rename",
      `async (from, to, ...args) => {
 const hold = ${JSON.stringify(hold())};
 if (String(to).endsWith('/launch-attempts.json') && fs.existsSync(hold)) {
  const field = JSON.stringify(fs.readFileSync(hold, 'utf8'));
  const kept = fs.existsSync(to) ? fs.readFileSync(to, 'utf8') : '';
  if (fs.readFileSync(from, 'utf8').includes(field) && !kept.includes(field)) {
   fs.writeFileSync(${JSON.stringify(reached())}, fs.readFileSync(hold, 'utf8'));
   await heldWhile(hold, 60000);
  }
 }
 return original(from, to, ...args);
}`,
    );

  const heldField = () =>
    existsSync(reached()) ? readFileSync(reached(), "utf8") : undefined;

  test.beforeEach(async () => {
    origin = await startOrigin();
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
      extraEnv: keepHold(),
    });
    push = origin.holdPushes();
  });

  test.afterEach(async () => {
    rmSync(hold(), { force: true });
    push.release();
    await server.close();
    origin.cleanup();
  });

  const keptAttempts = () => keptOfMachine(server);

  test("is answered as kept while its reporting context, then its outcome, is being written", async () => {
    test.setTimeout(120_000);
    server.claudeScenario("held");
    const answered = JSON.parse((await accept(server, request)).body) as {
      kind: string;
    };
    expect(answered.kind).toBe("accepted");
    await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);

    // Published; the write that first keeps its reporting context is held.
    writeFileSync(hold(), "reporting");
    push.release();
    await expect.poll(heldField, { timeout: 30_000 }).toBe("reporting");
    const revision = (await origin.originGit("rev-parse", "main")).trim();
    expect(keptAttempts()[0]?.publication).toEqual({
      kind: "published",
      revision,
    });
    expect(keptAttempts()[0]?.reporting).toBeUndefined();
    expect(await attempts(server)).toEqual([
      { ...keptAttempts()[0], owned: true },
    ]);

    rmSync(hold());
    await expect
      .poll(() => keptAttempts()[0]?.reporting?.reference, { timeout: 30_000 })
      .toBe(keptAttempts()[0]?.id);
    await expect
      .poll(() => server.claudeLaunchCalls().length, { timeout: 30_000 })
      .toBe(1);
    expect(await attempts(server)).toEqual([
      { ...keptAttempts()[0], owned: true },
    ]);

    // Launched; the write that keeps its outcome is held.
    writeFileSync(hold(), "outcome");
    server.releaseHeldClaude();
    await expect.poll(heldField, { timeout: 30_000 }).toBe("outcome");
    expect(keptAttempts()[0]?.outcome).toBeUndefined();
    expect(await attempts(server)).toEqual([
      { ...keptAttempts()[0], owned: true },
    ]);

    rmSync(hold());
    await expect
      .poll(() => keptAttempts()[0]?.outcome?.kind, { timeout: 30_000 })
      .toBe("launched");
    expect(await attempts(server)).toEqual([
      { ...keptAttempts()[0], owned: false },
    ]);
  });
});
