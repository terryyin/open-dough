// Reporting recovery and native binding share the original attempt's fixed fact.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { test, expect, stored } from "./support/codexStart.ts";
import { accept } from "./agentLaunchBoundary.ts";
import { requestFor, oneShot } from "./support/oneShotLaunch.ts";
import { commit, scripts, git } from "./support/oneShotLanding.ts";
import { acceptanceSchema } from "../src/launchOutcome.ts";
import { landingReceiptSchema } from "../src/oneShotLanding.ts";
import { completionSchema } from "../src/completionReport.ts";
import { keptAttempts, settledOutcome } from "./acceptedAttempts.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import {
  completionProxy,
  completionWriteFault,
  reportingChild,
  quote,
  recordOperation,
} from "./support/completionRecovery.ts";

test("early accepted landing survives a real record EIO and lost receipt before native binding, then binds once", async ({
  dashboard,
  origin,
  codexProtocol,
}) => {
  test.setTimeout(120000);
  const native = codexProtocol;
  if (native === undefined) throw new Error("No native fixture");
  await dashboard.close();
  const fault = completionWriteFault(origin.machine);
  const receiver = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    codexProtocol: native,
    extraEnv: fault.env,
  });
  const proxy = await completionProxy(
    dashboard.origin,
    receiver.origin,
    "/__agent-launch/landing",
  );
  const throughProxy = {
    ...receiver,
    baseURL: dashboard.origin,
    origin: dashboard.origin,
  };
  try {
    native.holdCreation = true;
    const answer = acceptanceSchema.parse(
      JSON.parse(
        (
          await accept(throughProxy, {
            ...requestFor("execution", oneShot("isolated", "auto-land")),
            host: "codex",
          })
        ).body,
      ),
    );
    if (answer.kind !== "accepted")
      throw new Error("No original accepted launch");
    await expect
      .poll(
        () =>
          keptAttempts(receiver).find((entry) => entry.id === answer.attempt.id)
            ?.reporting?.landingContext,
        { timeout: 30000 },
      )
      .toBeDefined();
    const attempt = keptAttempts(receiver).find(
      (entry) => entry.id === answer.attempt.id,
    );
    const authority = attempt?.landingRepository;
    const reporting = attempt?.reporting;
    if (authority === undefined || reporting?.landingContext === undefined)
      throw new Error("No real original authority");
    const base = git(authority.workspace, "rev-parse", "HEAD");
    const revision = commit(authority.workspace, "before-native-binding.txt");
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
    const code = `import {writeFileSync} from 'node:fs'; import {publishExecutionIncrement} from ${JSON.stringify(module)}; console.log(JSON.stringify(await publishExecutionIncrement({...JSON.parse(process.argv[1]), beforePush: async () => writeFileSync(${JSON.stringify(fault.marker)}, 'fault')})));`;
    const child = await reportingChild(
      [
        process.execPath,
        "--input-type=module",
        "-e",
        code,
        JSON.stringify(request),
      ]
        .map(quote)
        .join(" "),
      origin.machine,
    );
    expect(child.ok, child.stderr).toBe(true);
    const delivered: unknown = JSON.parse(child.stdout);
    expect(delivered).toMatchObject({
      ok: true,
      publication: "accepted",
      receipt: { sha: revision },
      landing: { state: "unacknowledged" },
    });
    const reserved = keptAttempts(receiver).find(
      (entry) => entry.id === answer.attempt.id,
    )?.landing;
    expect(reserved).toMatchObject({
      base,
      revision,
      reference: answer.attempt.id,
    });
    expect(
      stored(receiver.home).filter((entry) => "session" in entry),
    ).toHaveLength(0);
    const current = JSON.parse(
      readFileSync(
        path.join(
          path.dirname(reporting.landingContext),
          "landing-current.json",
        ),
        "utf8",
      ),
    ) as { pending: string };
    const retry = `${reporting.command} --operation landing --retry ${quote(current.pending)}`;
    proxy.dropNext();
    const lost = await reportingChild(retry, origin.machine);
    expect(lost.ok).toBe(false);
    expect(lost.stdout).toBe("");
    expect(proxy.lost()).toBe(1);
    const pending = landingReceiptSchema.parse(
      JSON.parse((await reportingChild(retry, origin.machine)).stdout),
    );
    expect(pending).toMatchObject({
      state: "pending-native-session",
      receipt: reserved?.receipt,
      base,
      revision,
    });
    expect(
      stored(receiver.home).filter((entry) => "session" in entry),
    ).toHaveLength(0);
    const message = path.join(origin.machine, "early-landing-attention.txt");
    writeFileSync(
      message,
      "Landing accepted; publication finish duties remain.",
    );
    const earlyCompletion = await reportingChild(
      `${reporting.command} --outcome unfinished --message-file ${quote(message)}`,
      origin.machine,
    );
    expect(earlyCompletion.ok, earlyCompletion.stderr).toBe(true);
    expect(JSON.parse(earlyCompletion.stdout)).toMatchObject({
      state: "pending-native-session",
      outcome: "unfinished",
    });
    const early = keptAttempts(receiver).find(
      (entry) => entry.id === answer.attempt.id,
    )?.completion;
    native.holdCreation = false;
    native.release();
    expect((await settledOutcome(receiver, answer.attempt.id)).kind).toBe(
      "launched",
    );
    const record = stored(receiver.home)[0];
    expect(record?.landing).toEqual(reserved);
    expect(record?.landingReporting?.authority).toEqual(authority);
    expect(record?.landingReporting?.settledAt).toBeDefined();
    expect(record?.completion).toEqual(completionSchema.parse(early));
    expect(record?.doneAt).toBeUndefined();
    const confirmed = landingReceiptSchema.parse(
      JSON.parse((await reportingChild(retry, origin.machine)).stdout),
    );
    expect(confirmed).toEqual({ ...pending, state: "recorded" });
    writeFileSync(
      message,
      "Publication finish duties settled; retain the review reminder.",
    );
    const completion = await reportingChild(
      `${reporting.command} --outcome completed --message-file ${quote(message)}`,
      origin.machine,
    );
    expect(completion.ok, completion.stderr).toBe(true);
    const newer = stored(receiver.home)[0]?.completion;
    if (record === undefined) throw new Error("No bound native record");
    await recordOperation(receiver, "bindRecord", [
      "open-dough",
      { ...record, landing: undefined, landingReporting: undefined },
    ]);
    expect(stored(receiver.home)).toHaveLength(1);
    expect(stored(receiver.home)[0]?.landing).toEqual(reserved);
    expect(stored(receiver.home)[0]?.completion?.receipt).toBe(newer?.receipt);
    expect(stored(receiver.home)[0]?.completion?.message).toBe(
      "Publication finish duties settled; retain the review reminder.",
    );
    expect(
      JSON.parse((await reportingChild(retry, origin.machine)).stdout),
    ).toEqual(confirmed);
  } finally {
    native.holdCreation = false;
    native.release();
    await proxy.close();
    await receiver.close();
  }
});
