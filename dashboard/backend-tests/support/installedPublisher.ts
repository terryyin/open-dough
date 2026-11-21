// This repository's installed publisher, run in process. Its sender reaches
// the typed landing handler through production landing admission, so the
// publisher's retained comparison is exactly what the handler prepares and
// records.
import { appendFileSync, copyFileSync, mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { onTestFinished, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { landingReceiptSchema } from "../../src/launchLanding.ts";
import { admitLandingRequest } from "../../server/launchLandingAdmission.ts";
import {
  handleLanding,
  type LandingStores,
} from "../../server/launchLandingReporting.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { capturedPublicationSchema } from "../../test-support/support/capturedPublication.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";

// The receiver's side of the sender's one request: production admission, then
// the landing adapter; only the fetch stub and Response mapping stay here.
async function receive(
  stores: LandingStores,
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : input);
  const headers = new Headers(init?.headers);
  try {
    const { operation, submission } = admitLandingRequest({
      route: url.pathname,
      method: init?.method,
      origin: headers.get("origin"),
      host: url.host,
      fetchSite: headers.get("sec-fetch-site"),
      bodyText: typeof init?.body === "string" ? init.body : "",
    });
    return Response.json(
      await handleLanding(submission, url.origin, operation, stores),
    );
  } catch (error) {
    if (!(error instanceof RefusedRequest)) throw error;
    return Response.json({ error: error.message }, { status: error.status });
  }
}

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

function bridgeToReceiver(stores: LandingStores) {
  vi.stubGlobal("fetch", (input: string | URL | Request, init?: RequestInit) =>
    receive(stores, input, init),
  );
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
  stores: LandingStores,
) {
  bridgeToReceiver(stores);
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

type Reporter = { reportCompletion(argv: string[]): Promise<unknown> };

// Retries the landing input the sender's handoff retained beside
// `landingContext`, through its surviving reporting entry, as
// `--operation landing --retry <pending>`.
export async function retryInstalledLanding(
  landingContext: string,
  stores: LandingStores,
) {
  bridgeToReceiver(stores);
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

// Installs this repository's real publisher scripts into `workspace`, a
// worktree of the checkout at `integration`, outside the work its commits
// stage.
export function installPublisher(integration: string, workspace: string) {
  const relative = path.join(
    ".claude",
    "skills",
    "dough-execute-plan",
    "scripts",
  );
  mkdirSync(path.join(workspace, relative), { recursive: true });
  for (const script of publisherScripts)
    copyFileSync(
      path.join(repoRoot, relative, script),
      path.join(workspace, relative, script),
    );
  appendFileSync(
    path.join(integration, ".git", "info", "exclude"),
    "/.claude/\n",
  );
}
