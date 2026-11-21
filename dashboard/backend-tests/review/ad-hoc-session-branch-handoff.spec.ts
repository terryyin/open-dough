// A Default main launch's first input carries a branch-entry command whose
// outgoing request, admitted and handled through the typed branch-entry seam,
// binds the original checkout's own branch and entered commit to that launch.
import { execFile } from "node:child_process";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { reportingReference } from "../../../Distribution/tests/support/launchLandingTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  admitSessionBranchEntryRequest,
  handleSessionBranchEntry,
  type BranchEntryRequestAdmission,
  type BranchEntrySubmission,
} from "../../server/sessionBranchEntry.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import { sessionBranchEntryEndpoint } from "../../src/sessionBranchResult.ts";
import type { Checkout } from "../support/doneCaptureCaseMaterialization.ts";
import {
  keep,
  keptRecordOf,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import {
  dashboardOrigin,
  dashboardReporting,
} from "../support/publisherDashboardOrigin.ts";

const host = new URL(dashboardOrigin).host;
const publishedSource = makeMe.aPublishedSource
  .with({ id: source, label: "Open Dough", repository: "terryyin/open-dough" })
  .please();
const handle = (submission: BranchEntrySubmission, origin = dashboardOrigin) =>
  handleSessionBranchEntry(submission, origin, () => publishedSource);

// The case's checkout switched to its own draft branch, entered by a commit.
async function onDraft(checkout: Checkout) {
  const workspace = fs.realpathSync(checkout.integration);
  await git(workspace, "switch", "--quiet", "-c", "draft");
  const { entered } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("entered", { at: minutesAgo(30) }),
  );
  return { workspace, entered };
}

// Runs the command with Node `fetch` captured instead of sent, and returns
// the one request it made, as the dashboard would admit it.
async function captureBranchEntryCommand(command: string, cwd: string) {
  const dir = fs.mkdtempSync(path.join(tmpdir(), "dough-branch-handoff-"));
  try {
    const preload = path.join(dir, "capture-fetch.mjs");
    const captured = path.join(dir, "captured.json");
    fs.writeFileSync(
      preload,
      `import { writeFileSync } from "node:fs";
globalThis.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  const origin = new Headers(init?.headers).get("Origin");
  const bodyText = typeof init?.body === "string" ? init.body : "";
  writeFileSync(process.env.CAPTURED_FETCH ?? "", JSON.stringify({ url: url.href, route: url.pathname, method: init?.method, origin, host: url.host, bodyText }));
  return Promise.resolve(new Response("{}", { status: 200 }));
};\n`,
    );
    await promisify(execFile)("/bin/sh", ["-c", command], {
      cwd,
      env: {
        ...process.env,
        NODE_OPTIONS: `--import=${pathToFileURL(preload).href}`,
        CAPTURED_FETCH: captured,
      },
    });
    const observed: unknown = JSON.parse(fs.readFileSync(captured, "utf8"));
    return observed as BranchEntryRequestAdmission & { readonly url: string };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const draftPlace = {
  source,
  host: "claude" as const,
  workspace: "/w",
  branch: "draft",
};
const validWire: BranchEntryRequestAdmission = {
  route: sessionBranchEntryEndpoint,
  method: "POST",
  origin: dashboardOrigin,
  host,
  bodyText: JSON.stringify({ ...draftPlace, reference: reportingReference }),
};

function refuse(overrides: Partial<BranchEntryRequestAdmission>) {
  try {
    admitSessionBranchEntryRequest({ ...validWire, ...overrides });
    throw new Error("expected a refusal");
  } catch (error) {
    expect(error).toBeInstanceOf(RefusedRequest);
    return error as RefusedRequest;
  }
}

test("the launch command binds the original checkout's own branch", async () => {
  const { checkout, at } = await aDoneCaptureCase().please();
  const { workspace, entered } = await onDraft(checkout);
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Continue the draft", instruction: "Continue the draft" })
    .startingInDefaultCheckout({
      workspace: checkout.integration,
      startingRevision: checkout.base,
      repository: checkout.gitDirectory,
      branch: "refs/heads/main",
    })
    .inClaudeSession({ sessionId: "default-launch" })
    .launchedAt(at(60))
    .reportingThrough(dashboardReporting)
    .please();
  keep(record);

  const sent = unattachedInput(record.request, undefined);
  const command = /^- branch entry command: (.+)$/m.exec(sent ?? "")?.[1];
  if (command === undefined) {
    throw new Error("No branch entry command in launch input.");
  }

  const observed = await captureBranchEntryCommand(command, workspace);
  expect(observed).toMatchObject({
    url: `${dashboardReporting.origin}${sessionBranchEntryEndpoint}`,
    route: sessionBranchEntryEndpoint,
    method: "POST",
    origin: dashboardReporting.origin,
    host,
  });

  const admitted = admitSessionBranchEntryRequest(observed);
  const receipt = await handle(admitted.submission, admitted.origin);
  expect(admitted).toEqual({
    origin: dashboardReporting.origin,
    submission: {
      source,
      host: record.session.host,
      reference: dashboardReporting.reference,
      workspace,
      branch: "draft",
    },
  });
  expect(receipt).toMatchObject({
    session: record.session.sessionId,
    branchEntry: { workspace, branch: "draft", committedTip: entered },
  });
  expect((await keptRecordOf(record.session.sessionId))?.branchEntry).toEqual(
    receipt.branchEntry,
  );
});

test("a session-addressed handoff binds the named session to its checkout", async () => {
  const { checkout, records } = await aDoneCaptureCase()
    .withDefaultMainLaunch("by-session", { launched: 60 })
    .kept()
    .please();
  const record = records["by-session"];
  const { workspace, entered } = await onDraft(checkout);

  const bodyText = JSON.stringify({
    source,
    host: record.session.host,
    session: record.session.sessionId,
    workspace,
    branch: "draft",
  });
  const admitted = admitSessionBranchEntryRequest({ ...validWire, bodyText });
  const receipt = await handle(admitted.submission, admitted.origin);
  expect(receipt).toMatchObject({
    session: record.session.sessionId,
    branchEntry: { workspace, branch: "draft", committedTip: entered },
  });
  expect((await keptRecordOf(record.session.sessionId))?.branchEntry).toEqual(
    receipt.branchEntry,
  );
});

test.each([
  { name: "cross-origin", wire: { origin: "http://127.0.0.1:9" }, code: 403 },
  { name: "wrong route", wire: { route: "/__agent-launch/other" }, code: 404 },
  { name: "non-POST", wire: { method: "GET" }, code: 405 },
  { name: "malformed body", wire: { bodyText: "{broken" }, code: 400 },
])("admission refuses $name request", ({ wire, code }) => {
  expect(refuse(wire).status).toBe(code);
});

test("an unknown session is refused", async () => {
  keep();
  await expect(
    handle({ ...draftPlace, session: "missing" }),
  ).rejects.toMatchObject({ status: 404 });
});

test("a reporting reference from another origin is refused", async () => {
  keep(
    makeMe.aLaunchRecord
      .adHoc({ title: "Known" })
      .reportingThrough(dashboardReporting)
      .please(),
  );
  await expect(
    handle(
      { ...draftPlace, reference: dashboardReporting.reference },
      "http://127.0.0.1:9999",
    ),
  ).rejects.toMatchObject({ status: 404 });
});

test("a handoff while still on the project's trunk is refused", async () => {
  const { checkout, records } = await aDoneCaptureCase()
    .withDefaultMainLaunch("trunk-launch", { launched: 60 }, (launch) =>
      launch.reportingThrough(dashboardReporting),
    )
    .kept()
    .please();
  const record = records["trunk-launch"];
  const workspace = fs.realpathSync(checkout.integration);

  await expect(
    handle({
      ...draftPlace,
      reference: dashboardReporting.reference,
      workspace,
      branch: "main",
    }),
  ).rejects.toMatchObject({
    status: 409,
    message: "Identify your own branch after leaving the project's trunk.",
  });
  expect(
    (await keptRecordOf(record.session.sessionId))?.branchEntry,
  ).toBeUndefined();
});
