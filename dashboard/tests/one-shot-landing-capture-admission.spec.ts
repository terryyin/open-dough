// Exact launch identity, preparation and remote acceptance constrain capture.
import { randomUUID } from "node:crypto";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { requestFor, oneShot } from "./support/oneShotLaunch.ts";
import { keptAttempts } from "./acceptedAttempts.ts";
import { otherQueuedIdentity } from "./support/startOrigin.ts";
import {
  reportingChild,
  quote,
  recordOperation,
} from "./support/completionRecovery.ts";
import { landingReceiptSchema } from "../src/oneShotLanding.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  git,
  commit,
  checkout,
  refs,
  context,
  publish,
} from "./support/oneShotLanding.ts";
test("capture refuses unaccepted, foreign, malformed and changed launch comparisons; deleting one launch removes only its pins", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("No native fixture");
  const nativeSession = native;
  await launch(dashboard, {
    ...requestFor("refinement", oneShot("isolated", "review")),
    host: "codex",
  });
  const first = stored(dashboard.home)[0];
  if (first === undefined) throw new Error("No launch");
  const { established, reporting } = context(first);
  const revision = commit(established.workspace, "first.txt");
  const base = established.startingRevision;
  const body = {
    delivery: randomUUID(),
    reference: reporting.reference,
    source: "open-dough",
    host: "codex",
    identity: established.identity,
    remote: "origin",
    target: "refs/heads/main",
    base,
    revision,
  };
  const post = (payload: unknown, prepare = false) =>
    rawRequest({
      url: `${dashboard.origin}/__agent-launch/landing${prepare ? "/prepare" : ""}`,
      method: "POST",
      headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  const before = checkout(established.workspace);
  const beforeRefs = refs(established.workspace);
  for (const payload of [
    { ...body, repository: origin.project },
    { ...body, reference: randomUUID() },
    { ...body, identity: otherQueuedIdentity },
    { ...body, remote: "foreign" },
    { ...body, target: "refs/heads/foreign" },
    { ...body, revision: base },
    {
      ...body,
      revision: git(established.workspace, "rev-parse", "HEAD^{tree}"),
    },
  ])
    expect((await post(payload, true)).status).toBeGreaterThanOrEqual(400);
  expect((await post(body)).status).toBe(409);
  expect(stored(dashboard.home)[0]?.landing).toBeUndefined();
  expect(keptAttempts(dashboard)[0]?.landingPreparations).toBeUndefined();
  expect(refs(established.workspace)).toBe(beforeRefs);
  expect(checkout(established.workspace)).toEqual(before);
  const prepared = await post(body, true);
  expect(prepared.status).toBe(200);
  expect(landingReceiptSchema.parse(JSON.parse(prepared.body)).state).toBe(
    "prepared",
  );
  const pinned = refs(established.workspace);
  expect((await post(body)).status).toBe(409); // target has not accepted the prepared candidate
  expect(refs(established.workspace)).toBe(pinned);
  expect(checkout(established.workspace)).toEqual(before);
  expect(stored(dashboard.home)[0]?.landing).toBeUndefined();
  const delivered = publish(first, origin.machine);
  nativeSession.threadId = "second-launch";
  await launch(dashboard, {
    ...requestFor("refinement", oneShot("isolated", "review")),
    host: "codex",
    identity: otherQueuedIdentity,
    title: "Second queued result",
  });
  const second = stored(dashboard.home).find(
    (entry) => entry.session.sessionId === native.threadId,
  );
  if (second === undefined) throw new Error("No second launch");
  const secondContext = context(second);
  commit(secondContext.established.workspace, "second.txt");
  const secondDelivered = publish(second, origin.machine);
  expect(secondDelivered.result.landing.state).toBe("recorded");
  expect(
    (await post({ ...body, delivery: randomUUID(), base: revision, revision }))
      .status,
  ).toBe(409);
  const firstPins = `refs/open-dough/one-shot/${reporting.reference}/`;
  const secondPins = `refs/open-dough/one-shot/${secondContext.reporting.reference}/`;
  const repository = stored(dashboard.home)[0]?.landing?.repository;
  if (repository === undefined) throw new Error("No retained repository");
  const otherPins = git(
    repository,
    "for-each-ref",
    "--format=%(refname) %(objectname)",
    secondPins,
  );
  expect(
    git(repository, "for-each-ref", "--format=%(refname)", firstPins),
  ).not.toBe("");
  await recordOperation(dashboard, "deleteRecord", [
    "open-dough",
    first.session,
  ]);
  expect(
    git(repository, "for-each-ref", "--format=%(refname)", firstPins),
  ).toBe("");
  expect(
    git(
      repository,
      "for-each-ref",
      "--format=%(refname) %(objectname)",
      secondPins,
    ),
  ).toBe(otherPins);
  expect(stored(dashboard.home)).toHaveLength(1);
  expect(stored(dashboard.home)[0]?.landing?.receipt).toBe(
    secondDelivered.result.landing.receipt.receipt,
  );
  const retry = await reportingChild(
    `${reporting.command} --operation landing --retry ${quote(delivered.before.pending)}`,
    origin.machine,
  );
  expect(retry.ok).toBe(false);
  expect(retry.stderr).toContain("deleted");
  expect(stored(dashboard.home)).toHaveLength(1);
});
