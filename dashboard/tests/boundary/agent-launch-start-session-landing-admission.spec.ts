// Which launches an unattached landing is captured for, with a real bare
// origin (../support/startOrigin.ts), the installed start and publication
// scripts, and the synthetic hosts: a Wait for review session that
// established a session carries the landing context, for a landing the
// developer asks for later; a launch with the default choices establishes no
// session, is handed no landing context, and has no landing admitted,
// whatever a request names; a context naming a story is refused for a launch
// that has none; an installation whose landing module requires an identity
// is handed no landing context; and a Codex session's installed delivery
// command, as a one-shot landing runs it, captures its landing. The handoff
// and the capture themselves are in
// ../agent-launch-start-session-landing-context.spec.ts.

import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { keptAttempts } from "../acceptedAttempts.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { commit } from "../support/launchLanding.ts";
import { expect, test } from "../support/preparationPage.ts";
import { expectReportingBlock } from "../support/reportingInputAssertions.ts";
import { originMain } from "../support/sessionDialog.ts";
import {
  adHocRequest as request,
  keptRecord,
  launched,
  postLanding as post,
  type UnattachedPolicy as Policy,
} from "../support/startSessionLandingCapture.ts";
import {
  deliver,
  land,
  landingHandoff,
  repositoryOf,
  withOlderLandingModule,
} from "../support/startSessionLandingContext.ts";
import { sessionBlock } from "../support/startSessionLanding.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

test("a Wait for review session carries the landing context too; a context naming no story is admitted only for the launch that established a session", async ({
  dashboard,
  origin,
}) => {
  const waiting = await launched(dashboard, {
    instruction: "Tidy the README wording",
    policy: { workspace: "isolated", landing: "review" } satisfies Policy,
  });
  const [block, reportingBlock, text] = waiting.sent.split("\n\n");
  expect(text).toBe("Tidy the README wording");
  const { session, reporting, context } = landingHandoff(waiting.record);
  expect(block).toBe(sessionBlock(session));
  expectReportingBlock(reportingBlock, waiting.record.request, dashboard);
  expect(reportingBlock).toContain("--landing-context");
  expect(context).not.toHaveProperty("identity");

  // The default choices establish no session: the reporting context names
  // no landing context and no capture authority is kept.
  const plain = await launched(dashboard, { instruction: "Say hello" });
  const plainReporting = plain.record.request.reporting;
  if (plainReporting === undefined) throw new Error("Missing reporting.");
  expect(plain.record).not.toHaveProperty("establishedSession");
  expect(plainReporting).not.toHaveProperty("landingContext");
  expect(plain.sent).not.toContain("--landing-context");
  expectReportingBlock(
    plain.sent.split("\n\n")[1],
    plain.record.request,
    dashboard,
  );
  expect(
    keptAttempts(dashboard).find(
      (entry) => entry.id === plainReporting.reference,
    ),
  ).not.toHaveProperty("landingRepository");
  // No prepared landing context means no first-landing expectation either.
  const plainReportingDir = path.join(
    dashboard.home,
    ".open-dough/dashboard/reporting",
    plainReporting.reference,
  );
  expect(existsSync(path.join(plainReportingDir, "landing-context.json"))).toBe(
    false,
  );
  expect(
    existsSync(path.join(plainReportingDir, "first-landing-expectation.json")),
  ).toBe(false);

  const base = await originMain(origin);
  const revision = commit(session.workspace, "later.txt");
  const comparison = {
    delivery: randomUUID(),
    source: "open-dough",
    host: "claude",
    remote: "origin",
    target: "refs/heads/main",
    base,
    revision,
  };
  for (const refused of [
    // A story named for a launch that has none.
    { ...comparison, reference: reporting.reference, identity: "SEED-1#a" },
    { ...comparison, reference: reporting.reference, identity: "" },
    { ...comparison, reference: reporting.reference, remote: "foreign" },
  ])
    expect((await post(dashboard, refused)).status).toBeGreaterThanOrEqual(400);
  // The launch that established no session, whatever it names.
  expect(
    (
      await post(dashboard, {
        ...comparison,
        reference: plainReporting.reference,
      })
    ).status,
  ).toBe(409);
  for (const kept of keptAttempts(dashboard))
    expect(kept).not.toHaveProperty("landingPreparations");

  // The developer later asks the waiting session to land: its own context
  // captures that landing.
  expect(
    (await post(dashboard, { ...comparison, reference: reporting.reference }))
      .status,
  ).toBe(200);
  const delivered = land(waiting.record, origin, dashboard.home).result;
  expect(delivered.landing.receipt).toMatchObject({ base, revision });
  expect(await originMain(origin)).toBe(revision);
  expect(
    (await keptRecord(dashboard, reporting.reference))?.landing,
  ).toMatchObject({ base, revision, reference: reporting.reference });
  expect(
    (await keptRecord(dashboard, plainReporting.reference))?.landing,
  ).toBeUndefined();
});

test("an installation whose landing module requires an identity is handed no landing context, so a landing never fails on one it cannot validate", async ({
  dashboard,
  origin,
}) => {
  withOlderLandingModule(origin);
  const { record, sent } = await launched(dashboard, {
    policy: { workspace: "isolated", landing: "auto-land" } satisfies Policy,
  });
  const session = record.establishedSession;
  if (session === undefined) throw new Error("No established session.");
  const [block, reportingBlock, ...extra] = sent.split("\n\n");
  expect(block).toBe(sessionBlock(session));
  expect(extra).toEqual([]);
  expectReportingBlock(reportingBlock, record.request, dashboard);
  expect(record.request.reporting).not.toHaveProperty("landingContext");
  expect(sent).not.toContain("--landing-context");
  expect(sent).not.toContain("cannot capture a landing comparison");
  for (const kept of keptAttempts(dashboard))
    expect(kept).not.toHaveProperty("landingRepository");
});

test.describe("Codex", () => {
  test.use({ preparationHost: "codex" });

  test("the installed delivery command a one-shot landing runs captures an isolated session's landing with no identity", async ({
    dashboard,
    codexProtocol,
    origin,
  }) => {
    if (codexProtocol === undefined) throw new Error("Missing native fixture.");
    const answer = JSON.parse(
      (
        await launch(dashboard, {
          ...request,
          host: "codex",
          policy: { workspace: "isolated", landing: "auto-land" },
        })
      ).body,
    ) as { kind: string; record?: LaunchRecord };
    expect(answer.kind).toBe("launched");
    const record = answer.record;
    if (record === undefined) throw new Error("Missing launch record.");
    const { session, reporting, context } = landingHandoff(record);
    expect(context).toEqual({
      origin: dashboard.origin,
      source: "open-dough",
      host: "codex",
      reference: reporting.reference,
      remote: "origin",
      target: "refs/heads/main",
    });
    const turn = codexProtocol.calls.find(
      (call) => call.method === "turn/start",
    );
    const input = (turn?.params as { input: { text: string }[] }).input;
    expect(input[0]?.text).toContain(
      `--landing-context '${reporting.landingContext ?? ""}'`,
    );

    const base = await originMain(origin);
    const revision = commit(session.workspace, "codex.txt");
    const delivered = deliver(record, origin);
    expect(delivered).toMatchObject({
      ok: true,
      publication: "accepted",
      suffixBase: base,
      receipt: { sha: revision },
      observation: { state: "unobserved" },
      landing: { state: "recorded" },
    });
    expect(delivered.landing.receipt).not.toHaveProperty("identity");
    expect(await originMain(origin)).toBe(revision);
    expect((await keptRecord(dashboard, reporting.reference))?.landing).toEqual(
      {
        repository: repositoryOf(origin.project),
        remote: "origin",
        target: "refs/heads/main",
        reference: reporting.reference,
        delivery: delivered.landing.receipt.delivery,
        base,
        revision,
        receipt: delivered.landing.receipt.receipt,
        receivedAt: delivered.landing.receipt.receivedAt,
      },
    );
  });
});
