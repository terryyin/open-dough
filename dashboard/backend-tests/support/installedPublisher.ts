// This repository's installed publisher, run in process. Its sender reaches
// the typed landing handler through production landing admission, so the
// publisher's retained comparison is exactly what the handler prepares and
// records.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { onTestFinished, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { landingReceiptSchema } from "../../src/launchLanding.ts";
import { admitLandingRequest } from "../../server/launchLandingAdmission.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { capturedPublicationSchema } from "../../test-support/support/capturedPublication.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";

// The receiver's side of the sender's one request: production admission, then
// the landing adapter; only the fetch stub and Response mapping stay here.
async function receive(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : input);
  try {
    const { operation, submission } = admitLandingRequest({
      route: url.pathname,
      method: init?.method,
      origin: new Headers(init?.headers).get("Origin"),
      host: url.host,
      bodyText: typeof init?.body === "string" ? init.body : "",
    });
    return Response.json(
      await handleLanding(submission, url.origin, operation),
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

function bridgeToReceiver() {
  vi.stubGlobal("fetch", receive);
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

type Reporter = { reportCompletion(argv: string[]): Promise<unknown> };

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
