// This repository's installed publisher and reporting script, run in process.
// Their sender reaches the typed landing handler or completion delivery
// through production admission, so what the sender retains is exactly what
// the receiver prepares and records.
import { appendFileSync, copyFileSync, mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { onTestFinished, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { landingReceiptSchema } from "../../src/launchLanding.ts";
import { admitCompletionRequest } from "../../server/completionAdmission.ts";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { completionEndpoint } from "../../server/completionReporting.ts";
import type { ReportedDone } from "../../server/doneMarks.ts";
import { admitLandingRequest } from "../../server/launchLandingAdmission.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { capturedPublicationSchema } from "../../test-support/support/capturedPublication.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";

// The receiver's side of the sender's one request: production admission, then
// the landing adapter or completion delivery handing a quiet report's Done to
// `doneMarks`; only the fetch stub and Response mapping stay here. A
// `lostReceipt` receiver delivers, then loses its answer on the way back.
const receiver =
  (doneMarks: ReportedDone, lostReceipt = false) =>
  async (
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = new URL(input instanceof Request ? input.url : input);
    const headers = new Headers(init?.headers);
    const wire = {
      method: init?.method,
      origin: headers.get("origin"),
      host: url.host,
      fetchSite: headers.get("sec-fetch-site"),
    };
    const bodyText = typeof init?.body === "string" ? init.body : "";
    try {
      if (url.pathname === completionEndpoint) {
        const receipt = await deliverCompletion(
          await admitCompletionRequest({
            ...wire,
            body: () => Promise.resolve(JSON.parse(bodyText) as unknown),
          }),
          url.origin,
          doneMarks,
        );
        if (lostReceipt) throw new TypeError("fetch failed");
        return Response.json(receipt);
      }
      const { operation, submission } = admitLandingRequest({
        ...wire,
        route: url.pathname,
        bodyText,
      });
      return Response.json(
        await handleLanding(submission, url.origin, operation),
      );
    } catch (error) {
      if (!(error instanceof RefusedRequest)) throw error;
      return Response.json({ error: error.message }, { status: error.status });
    }
  };

type Publication = {
  readonly workspace: string;
  readonly branch: string;
  readonly previouslyPublishedBase: string;
  readonly remote: string;
  readonly targetRef: string;
  readonly landingContext: string;
};

type Publisher = {
  publishExecutionIncrement(
    publication: Publication & { beforePush: () => Promise<void> },
  ): Promise<unknown>;
};

// What stood just before the push: the remote trunk and the pairs the
// receiver had prepared for the launch.
export type BeforePush = {
  trunk?: string | undefined;
  prepared?: readonly object[] | undefined;
};

// Answers every `fetch` in this test through the receiver.
export function bridgeToReceiver(
  doneMarks: ReportedDone = { reported: vi.fn() },
  lostReceipt = false,
) {
  vi.stubGlobal("fetch", receiver(doneMarks, lostReceipt));
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
}

// Publishes through the installed shared publication, as Dough Land runs it
// with no execution observer, reading the trunk and `preparedPairs` before
// its push.
export async function publishInstalled(
  publication: Publication,
  preparedPairs: () => Promise<readonly object[] | undefined>,
) {
  bridgeToReceiver();
  const module = path.join(
    repoRoot,
    ".claude/skills/dough-execute-plan/scripts/execution-increment-publication.mjs",
  );
  const installed = (await import(pathToFileURL(module).href)) as Publisher;
  const beforePush: BeforePush = {};
  const published = capturedPublicationSchema.parse(
    await installed.publishExecutionIncrement({
      ...publication,
      beforePush: async () => {
        const remote = await git(
          publication.workspace,
          "ls-remote",
          publication.remote,
          publication.targetRef,
        );
        beforePush.trunk = remote.stdout.split("\t")[0];
        beforePush.prepared = await preparedPairs();
      },
    }),
  );
  return { ...published, beforePush };
}

type Delivery = {
  deliverManagedExecutionIncrement(request: object): Promise<unknown>;
};
type IncrementRequest = {
  readIncrementCliRequest: (argv: string[]) => Promise<{ request: object }>;
};

// Delivers through the installed `command` under `workspace`'s skills, as its
// CLI runs with `args`, answering the JSON it would print.
export async function deliverInstalled(
  workspace: string,
  command: string,
  args: string[],
) {
  bridgeToReceiver();
  const script = path.join(workspace, ".agents/skills", command);
  const request = path.join(
    path.dirname(script),
    "execution-increment-request.mjs",
  );
  const { readIncrementCliRequest } = (await import(
    pathToFileURL(request).href
  )) as IncrementRequest;
  const delivery = (await import(pathToFileURL(script).href)) as Delivery;
  return JSON.stringify(
    await delivery.deliverManagedExecutionIncrement(
      (await readIncrementCliRequest(args)).request,
    ),
  );
}

// An installed reporting entry, as its module exports it.
export type Reporter = {
  reportCompletion(argv: string[]): Promise<unknown>;
};

// Retries the landing input the sender's handoff retained beside
// `landingContext`, through its surviving reporting entry, as
// `--operation landing --retry <pending>`.
export async function retryInstalledLanding(landingContext: string) {
  bridgeToReceiver();
  const directory = path.dirname(landingContext);
  const { pending } = JSON.parse(
    await readFile(path.join(directory, "landing-current.json"), "utf8"),
  ) as { pending: string };
  const entry = path.join(directory, "dashboard-completion.mjs");
  const reporter = (await import(pathToFileURL(entry).href)) as Reporter;
  return landingReceiptSchema.parse(
    await reporter.reportCompletion([
      "--operation",
      "landing",
      "--retry",
      pending,
    ]),
  );
}

const publisherScripts = [
  "dashboard-completion.mjs",
  "ci-direct-entry.mjs",
  "dashboard-landing.mjs",
  "first-landing-expectation.mjs",
];

const installedScripts = path.join(
  ".claude",
  "skills",
  "dough-execute-plan",
  "scripts",
);

// Copies this repository's real publisher and reporting scripts into
// `directory`, where a launch workspace's installed skill keeps them.
export function installPublisherScripts(directory: string) {
  mkdirSync(directory, { recursive: true });
  for (const script of publisherScripts)
    copyFileSync(
      path.join(repoRoot, installedScripts, script),
      path.join(directory, script),
    );
}

// Installs this repository's real publisher scripts into `workspace`, a
// worktree of the checkout at `integration`, outside the work its commits
// stage.
export function installPublisher(integration: string, workspace: string) {
  installPublisherScripts(path.join(workspace, installedScripts));
  appendFileSync(
    path.join(integration, ".git", "info", "exclude"),
    "/.claude/\n",
  );
}
