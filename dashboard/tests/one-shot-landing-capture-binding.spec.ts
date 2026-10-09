// Launch-bound capture is independent of native binding and legacy capability.
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch, accept } from "./agentLaunchBoundary.ts";
import { requestFor, oneShot } from "./support/oneShotLaunch.ts";
import { keptAttempts, settledOutcome } from "./acceptedAttempts.ts";
import { reportingChild } from "./support/completionRecovery.ts";
import { acceptanceSchema, launchResultSchema } from "../src/launchOutcome.ts";
import { completionReceiptSchema } from "../src/completionReport.ts";
import {
  git,
  scripts,
  commit,
  capturedPublicationSchema,
} from "./support/oneShotLanding.ts";
test("a landing accepted before native binding imports only that original launch's comparison", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("No native fixture");
  const nativeSession = native;
  nativeSession.holdCreation = true;
  const answer = acceptanceSchema.parse(
    JSON.parse(
      (
        await accept(dashboard, {
          ...requestFor("execution", oneShot("isolated", "auto-land")),
          host: "codex",
        })
      ).body,
    ),
  );
  expect(answer.kind).toBe("accepted");
  if (answer.kind !== "accepted") throw new Error("No accepted launch");
  await expect
    .poll(
      () =>
        keptAttempts(dashboard).find((entry) => entry.id === answer.attempt.id)
          ?.reporting?.landingContext,
    )
    .toBeDefined();
  const attempt = keptAttempts(dashboard).find(
    (entry) => entry.id === answer.attempt.id,
  );
  const authority = attempt?.landingRepository;
  const reporting = attempt?.reporting;
  if (authority === undefined || reporting?.landingContext === undefined)
    throw new Error("No early authoritative reporting context");
  const base = git(authority.workspace, "rev-parse", "HEAD");
  const revision = commit(authority.workspace, "early.txt");
  const module = pathToFileURL(
    path.join(
      scripts(authority.workspace),
      "execution-increment-publication.mjs",
    ),
  ).href;
  const request = {
    workspace: authority.workspace,
    branch: authority.branch,
    previouslyPublishedBase: base,
    remote: authority.remote,
    targetRef: authority.target,
    landingContext: reporting.landingContext,
  };
  const code = `import { publishExecutionIncrement } from ${JSON.stringify(module)}; console.log(JSON.stringify(await publishExecutionIncrement(JSON.parse(process.argv[1]))));`;
  const result = capturedPublicationSchema.parse(
    JSON.parse(
      execFileSync(
        process.execPath,
        ["--input-type=module", "-e", code, JSON.stringify(request)],
        { cwd: origin.machine, encoding: "utf8" },
      ),
    ),
  );
  expect(result.landing.receipt).toMatchObject({
    state: "pending-native-session",
    reference: answer.attempt.id,
    base,
    revision,
  });
  expect(
    keptAttempts(dashboard).find((entry) => entry.id === answer.attempt.id)
      ?.completion,
  ).toBeUndefined();
  nativeSession.holdCreation = false;
  native.release();
  expect((await settledOutcome(dashboard, answer.attempt.id)).kind).toBe(
    "launched",
  );
  const record = stored(dashboard.home).find(
    (entry) => entry.request.reporting?.reference === answer.attempt.id,
  );
  expect(record?.landing).toMatchObject({
    reference: answer.attempt.id,
    base,
    revision,
  });
  expect(record?.doneAt).toBeUndefined();
  expect(record?.completion).toBeUndefined();
});

test("an installation without landing capture still reports completion and explains the evidence gap", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("No native fixture");
  const missingModule = path.join(
    scripts(origin.project),
    "dashboard-landing.mjs",
  );
  rmSync(missingModule);
  git(origin.project, "add", missingModule);
  git(
    origin.project,
    "commit",
    "-m",
    "Install reporting without landing capture",
  );
  git(origin.project, "push", "origin", "main");
  const answer = await launch(dashboard, {
    ...requestFor("refinement", oneShot("isolated", "review")),
    host: "codex",
  });
  expect(launchResultSchema.parse(JSON.parse(answer.body)).kind).toBe(
    "launched",
  );
  const record = stored(dashboard.home)[0];
  if (record === undefined) throw new Error("No legacy launch record");
  expect(record.request.reporting?.landingContext).toBeUndefined();
  const turn = native.calls.find((entry) => entry.method === "turn/start");
  expect(JSON.stringify(turn?.params["input"])).toContain(
    "cannot capture a landing comparison",
  );
  const result = await reportingChild(
    `${record.request.reporting?.command} --outcome completed`,
    origin.machine,
  );
  expect(result.ok, result.stderr).toBe(true);
  expect(completionReceiptSchema.parse(JSON.parse(result.stdout)).outcome).toBe(
    "completed",
  );
  expect(stored(dashboard.home)[0]?.landing).toBeUndefined();
});
