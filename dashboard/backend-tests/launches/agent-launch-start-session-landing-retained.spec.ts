// An unattached launch's kept record owns its landing capture after its
// startup attempt expires, as a story launch's does
// (../review/one-shot-landing-recovery-retention.spec.ts), with the server's clock
// advanced past the attempt's retention on a real start origin: the record
// holds the capture authority of the session's workspace with no identity,
// the installed delivery command given the launch's context still prepares
// and records its landing, and a request naming a story is refused.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptAttempts } from "../../test-support/acceptedAttempts.ts";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import { expect, stored, test } from "../../test-support/support/codexStart.ts";
import { startDashboardServer } from "../../test-support/support/dashboardServer.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import {
  dropExpiredAttempts,
  landingRetentionClock,
} from "../../test-support/support/landingRetentionClock.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import { postLanding } from "../../test-support/support/startSessionLandingCapture.ts";
import {
  deliver,
  landingHandoff,
  repositoryOf,
} from "../../test-support/support/startSessionLandingContext.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

test("an unattached launch's kept record captures its landing after its startup attempt expired, with no identity", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("No native fixture");
  await dashboard.close();
  const clock = landingRetentionClock(origin.machine);
  const receiver = await startDashboardServer({
    mode: "boundary",
    liveServer: "separate process",
    machine: origin.machine,
    projectFolders: ["open-dough"],
    codexProtocol: native,
    extraEnv: clock.env,
  });
  try {
    await launch(receiver, {
      source: "open-dough",
      workflow: "ad-hoc",
      host: "codex",
      policy: { workspace: "isolated", landing: "auto-land" },
    });
    const record = stored(receiver.home)[0];
    if (record === undefined) throw new Error("No bound launch");
    const { session, reporting } = landingHandoff(record);
    const authority = {
      repository: repositoryOf(origin.project),
      workspace: session.workspace,
      branch: session.branch,
      remote: "origin",
      target: "refs/heads/main",
    };
    expect(keptAttempts(receiver)[0]?.landingRepository).toEqual(authority);
    expect(record.landingReporting).toMatchObject({
      origin: receiver.origin,
      authority,
      preparations: [],
    });
    expect(record.landingReporting?.authority).toEqual(authority);
    expect(record.landingReporting?.settledAt).toBeDefined();

    const base = git(origin.project, "rev-parse", "origin/main");
    const revision = commit(session.workspace, "retained.txt");
    clock.advanceDays(31);
    await dropExpiredAttempts(receiver.home, {
      ...process.env,
      ...clock.env,
    });
    expect(keptAttempts(receiver)).toHaveLength(0);
    expect(stored(receiver.home)).toHaveLength(1);

    // A story named for the launch that has none is still refused.
    const refused = await postLanding(receiver, {
      ...makeMe.aLandingSubmission
        .forLaunch({ host: "codex", reference: reporting.reference })
        .comparing({ base, revision })
        .please(),
      identity: "SEED-1#a",
    });
    expect(refused.status).toBe(409);
    expect(stored(receiver.home)[0]?.landingReporting?.preparations).toEqual(
      [],
    );

    const delivered = deliver(record, origin);
    expect(delivered).toMatchObject({
      ok: true,
      publication: "accepted",
      receipt: { sha: revision },
      landing: { state: "recorded" },
    });
    expect(delivered.landing.receipt).not.toHaveProperty("identity");
    expect(await originMain(origin)).toBe(revision);
    const kept = stored(receiver.home)[0];
    expect(kept?.landing).toEqual({
      ...authority,
      workspace: undefined,
      branch: undefined,
      reference: reporting.reference,
      delivery: delivered.landing.receipt.delivery,
      base,
      revision,
      receipt: delivered.landing.receipt.receipt,
      receivedAt: delivered.landing.receipt.receivedAt,
    });
    expect(kept?.landingReporting?.preparations).toEqual([kept?.landing]);
    expect(keptAttempts(receiver)).toHaveLength(0);
  } finally {
    await receiver.close();
  }
});
