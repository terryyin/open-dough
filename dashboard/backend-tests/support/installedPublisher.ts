// This repository's installed publisher, run in process. Its sender reaches
// the typed landing handler through a bridge that admits only the receiver's
// route, body schema and origin, so the publisher's retained comparison is
// exactly what the handler prepares and records.
import path from "node:path";
import { pathToFileURL } from "node:url";
import { onTestFinished, vi } from "vitest";
import { landingSubmissionSchema } from "../../server/launchLandingAdmission.ts";
import {
  handleLanding,
  landingEndpoint,
  type LandingOperation,
  landingPrepareEndpoint,
} from "../../server/launchLandingReporting.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { capturedPublicationSchema } from "../../test-support/support/capturedPublication.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import { dashboardOrigin } from "./declaredPublisherBranch.ts";

const operations = new Map<string, LandingOperation>([
  [landingPrepareEndpoint, "prepare"],
  [landingEndpoint, "record"],
]);

// The receiver's side of the sender's one request.
async function receive(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : input);
  const operation = operations.get(url.pathname);
  if (
    url.origin !== dashboardOrigin ||
    operation === undefined ||
    init?.method !== "POST" ||
    new Headers(init.headers).get("Origin") !== dashboardOrigin ||
    typeof init.body !== "string"
  )
    throw new Error(`Not the landing receiver: ${url.href}`);
  const submission = landingSubmissionSchema.parse(JSON.parse(init.body));
  try {
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
  readonly beforePush?: () => Promise<void>;
};

type Publisher = {
  publishExecutionIncrement(publication: Publication): Promise<unknown>;
};

// Publishes through the installed shared publication, as Dough Land runs it
// with no execution observer.
export async function publishInstalled(publication: Publication) {
  vi.stubGlobal("fetch", receive);
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
  const module = path.join(
    repoRoot,
    ".claude/skills/dough-execute-plan/scripts/execution-increment-publication.mjs",
  );
  const installed = (await import(pathToFileURL(module).href)) as Publisher;
  return capturedPublicationSchema.parse(
    await installed.publishExecutionIncrement(publication),
  );
}
