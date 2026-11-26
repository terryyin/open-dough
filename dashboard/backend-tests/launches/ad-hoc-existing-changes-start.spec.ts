// A default ad hoc Start on a borrowed checkout holding existing changes: the
// real checkout probe (../../server/executionCheckoutChanges.ts) answers the
// current fingerprint before acceptance (../../server/launchPreAcceptance.ts)
// until the request confirms it, so nothing starts unconfirmed. The confirmed
// Start keeps no confirmation, hands the developer's exact text to the native
// first input (../../server/unattachedInput.ts), and leaves the checkout's
// index, branch and changes as they were. An unattached session takes no
// tracking choice. The dialog's warning, Back, Cancel and Continue:
// ../../../e2e/launches/agent-launch-start-session-existing-changes.spec.ts.
import path from "node:path";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { agentLaunchRequestSchema } from "../../src/launchRequest.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { started, unconfirmedStart } from "../../server/launchStart.ts";
import { localFolder } from "../../server/localFolder.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startStore } from "../../server/startStore.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import {
  checkoutState,
  dirty,
} from "../../test-support/support/executionCheckoutChanges.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const began = new Date(2026, 8, 30, 14, 32);
const text = " \tExplain these changes\n  in order.\r\n ";

let origin: StartOrigin | undefined;

beforeAll(async () => {
  const initial = await startOrigin(repository, { host: "claude" });
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
  origin?.cleanup();
});

// A borrowed checkout holding existing changes, in this test's own machine.
async function changedCheckout(landing: "review" | "auto-land") {
  origin = await startOrigin(repository, { host: "claude" });
  const home = path.join(origin.machine, "home");
  vi.stubEnv("HOME", home);
  dirty(origin.project);
  const request = makeMe.aLaunchRequest.adHoc({ instruction: text }).please();
  if (request.workflow !== "ad-hoc") throw new Error("Expected ad hoc.");
  const policy = { workspace: "default-checkout", landing } as const;
  return {
    project: origin.project,
    home,
    folder: localFolder("~/git/open-dough", home),
    request,
    policy,
    before: checkoutState(origin.project),
  };
}

type ChangedCheckout = Awaited<ReturnType<typeof changedCheckout>>;

async function fingerprintOf({ request, policy, folder }: ChangedCheckout) {
  const found = await unconfirmedStart(source, { ...request, policy }, folder);
  if (found?.kind !== "existing-changes")
    throw new Error(`Expected existing changes: ${JSON.stringify(found)}`);
  return found.fingerprint;
}

// Starts with the current fingerprint confirmed and composes the native first
// input from what the launch records.
async function confirmedStart(changed: ChangedCheckout) {
  const fingerprint = await fingerprintOf(changed);
  const confirmed = {
    ...changed.request,
    policy: changed.policy,
    existingChanges: fingerprint,
  };
  const start = await started(
    source,
    confirmed,
    changed.folder,
    new StartProgress(),
    {
      store: (workflow) => startStore(workflow, changed.home),
      env: { ...process.env, HOME: changed.home },
    },
    "ad-hoc-attempt",
    undefined,
    undefined,
    began,
  );
  if (start.kind !== "session" || start.publication.kind !== "published")
    throw new Error(`Expected a published session: ${JSON.stringify(start)}`);
  const recorded = {
    ...recordedRequest(confirmed, began),
    storyIdentity: start.publication.identity,
  };
  return {
    fingerprint,
    start,
    recorded,
    story: `Taken story: ${start.publication.identity}`,
    input: unattachedInput(recorded, start.handoff.formatted) ?? "",
  };
}

test("an unattached session takes no tracking choice", () => {
  const request = makeMe.aLaunchRequest.adHoc({ instruction: text }).please();
  expect(
    agentLaunchRequestSchema.safeParse({
      ...request,
      policy: {
        workspace: "default-checkout",
        landing: "review",
        tracking: "one-shot",
      },
    }).success,
  ).toBe(false);
});

test("existing changes answer their current fingerprint, keeping nothing, until a Start confirms it", async () => {
  const changed = await changedCheckout("review");
  const { request, policy, folder } = changed;

  // With or without the policy named, and with a confirmation of something
  // else, the same current changes are answered.
  const found = [];
  for (const asked of [
    request,
    { ...request, policy },
    { ...request, policy, existingChanges: "0".repeat(64) },
  ])
    found.push(await unconfirmedStart(source, asked, folder));
  expect(found).toEqual([found[0], found[0], found[0]]);
  expect(found[0]).toMatchObject({ kind: "existing-changes", count: 4 });
  expect(await keptRecords(source.id)).toEqual([]);

  const existingChanges = await fingerprintOf(changed);
  expect(
    await unconfirmedStart(
      source,
      { ...request, policy, existingChanges },
      folder,
    ),
  ).toBeUndefined();
});

test("a confirmed review Start keeps no confirmation, hands the developer's exact text first and leaves the checkout as it was", async () => {
  const changed = await changedCheckout("review");
  const { fingerprint, start, recorded, story, input } =
    await confirmedStart(changed);

  expect(start.workspace.path).toBe(changed.project);
  expect(recorded).not.toHaveProperty("existingChanges");
  expect(recorded).toMatchObject({
    instruction: text,
    policy: changed.policy,
  });
  expect(input).not.toContain(fingerprint);
  expect(start.handoff.formatted).toBeUndefined();
  expect(input.startsWith(`${text}\n\n`)).toBe(true);
  expect(input.endsWith(`\n\n${story}`)).toBe(true);
  expect(checkoutState(changed.project)).toBe(changed.before);
});

test("a confirmed automatically landing Start hands the established block first and the developer's text last, leaving the checkout as it was", async () => {
  const changed = await changedCheckout("auto-land");
  const { start, story, input } = await confirmedStart(changed);

  const block = start.handoff.formatted ?? "";
  expect(block).toMatch(/^Established session/u);
  expect(input.startsWith(`${block}\n\n`)).toBe(true);
  expect(input.endsWith(`\n\n${story}\n\n${text}`)).toBe(true);
  expect(checkoutState(changed.project)).toBe(changed.before);
});
