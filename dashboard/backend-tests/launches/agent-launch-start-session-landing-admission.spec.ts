// Which launches an unattached landing is captured for, with a real bare
// origin (../../test-support/support/startOrigin.ts), the installed start and publication
// scripts, and the synthetic hosts: a Wait for review session that
// established a session carries the landing context, for a landing the
// developer asks for later. A launch borrowing the default checkout keeps
// the context and separate claim for its own landing. A context naming the
// wrong story is refused. A Codex session's installed delivery command
// captures its landing when a one-shot landing runs it. The handoff
// and the capture themselves are in
// ../../../e2e/launches/agent-launch-start-session-landing-context.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { storyOf } from "../../src/launchWorkflow.ts";
import { keptAttempts } from "../../test-support/acceptedAttempts.ts";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  expectAdHocReportingInput,
  expectReportingBlock,
} from "../../test-support/support/reportingInputAssertions.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import {
  adHocRequest as request,
  expectBorrowedLandingArtifacts,
  keptRecord,
  launched,
  postLanding as post,
  type UnattachedPolicy as Policy,
} from "../../test-support/support/startSessionLandingCapture.ts";
import {
  deliver,
  land,
  landingHandoff,
  repositoryOf,
} from "../../test-support/support/startSessionLandingContext.ts";
import { sessionBlock } from "../../test-support/support/startSessionLanding.ts";
import { launchStoryIdentity } from "../../test-support/support/unattachedLaunchAssertions.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const childPublication = test.extend({
  liveServer: "synchronous delivery child blocks the mounted receiver",
});

childPublication(
  "an isolated Wait for review session carries its story's landing context",
  async ({ dashboard, origin }) => {
    const instruction = "Say hello";
    const plain = await launched(dashboard, { instruction });
    expect(plain.record).not.toHaveProperty("establishedSession");
    expectAdHocReportingInput(
      plain.sent,
      instruction,
      plain.record.request,
      dashboard,
    );
    const plainReference = expectBorrowedLandingArtifacts(
      dashboard,
      plain.record,
      {
        workspace: origin.project,
        identity: launchStoryIdentity(plain.record),
        publishedSha: await originMain(origin),
      },
    );

    const waiting = await launched(dashboard, {
      instruction: "Tidy the README wording",
      policy: { workspace: "isolated", landing: "review" } satisfies Policy,
    });
    const [block, reportingBlock, story, text] = waiting.sent.split("\n\n");
    expect(story).toBe(
      `Taken story: ${"storyIdentity" in waiting.record.request ? waiting.record.request.storyIdentity : ""}`,
    );
    expect(text).toBe("Tidy the README wording");
    const { session, reporting, context } = landingHandoff(waiting.record);
    expect(block).toBe(sessionBlock(session));
    expectReportingBlock(reportingBlock, waiting.record.request, dashboard);
    expect(reportingBlock).toContain("--landing-context");
    const identity = storyOf(waiting.record.request);
    expect(context.identity).toBe(identity);

    const base = await originMain(origin);
    const revision = commit(session.workspace, "later.txt");
    // The same comparison, landed for one launch or another.
    const landingFor = (reference: string) =>
      makeMe.aLandingSubmission
        .forLaunch({ reference })
        .comparing({ base, revision })
        .please();
    const waitingLanding = { ...landingFor(reporting.reference), identity };
    for (const refused of [
      landingFor(reporting.reference),
      { ...waitingLanding, identity: "SEED-1#a" },
      { ...waitingLanding, identity: "" },
      { ...waitingLanding, remote: "foreign" },
      { ...waitingLanding, target: "refs/heads/foreign" },
      { ...waitingLanding, host: "codex" },
    ])
      expect((await post(dashboard, refused)).status).toBeGreaterThanOrEqual(
        400,
      );
    // The borrowed checkout's launch accepts only its own story identity.
    expect((await post(dashboard, landingFor(plainReference))).status).toBe(
      409,
    );
    expect(
      (
        await post(dashboard, {
          ...waitingLanding,
          reference: plainReference,
        })
      ).status,
    ).toBe(409);
    for (const kept of keptAttempts(dashboard))
      expect(kept).not.toHaveProperty("landingPreparations");
    expect(await originMain(origin)).toBe(base);

    // The developer later asks the waiting session to land: its own context
    // captures that landing.
    expect((await post(dashboard, waitingLanding)).status).toBe(200);
    const delivered = land(waiting.record, origin, dashboard.home).result;
    expect(delivered.landing.receipt).toMatchObject({
      identity,
      base,
      revision,
    });
    expect(await originMain(origin)).toBe(revision);
    expect(
      (await keptRecord(dashboard, reporting.reference))?.landing,
    ).toMatchObject({ base, revision, reference: reporting.reference });
    expect(
      (await keptRecord(dashboard, plainReference))?.landing,
    ).toBeUndefined();
  },
);

test.describe("Codex", () => {
  test.use({
    preparationHost: "codex",
    liveServer: "synchronous delivery child blocks the mounted receiver",
  });

  test("the installed delivery command captures an isolated session's story-linked landing", async ({
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
          instruction: "Session",
          policy: { workspace: "isolated", landing: "auto-land" },
        })
      ).body,
    ) as { kind: string; record?: LaunchRecord };
    expect(answer.kind).toBe("launched");
    const record = answer.record;
    if (record === undefined) throw new Error("Missing launch record.");
    const { session, reporting, context } = landingHandoff(record);
    const identity = storyOf(record.request);
    expect(context).toEqual({
      origin: dashboard.origin,
      source: "open-dough",
      host: "codex",
      reference: reporting.reference,
      identity,
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
    expect(delivered.landing.receipt.identity).toBe(identity);
    expect(await originMain(origin)).toBe(revision);
    expect((await keptRecord(dashboard, reporting.reference))?.landing).toEqual(
      {
        repository: repositoryOf(origin.project),
        identity,
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
