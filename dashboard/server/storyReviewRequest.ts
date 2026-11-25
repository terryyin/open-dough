// The review read's adapter: the query's exact shape becomes one typed read.
// Refusals of that shape answer here; the kept records decide the rest in the
// handler (`storyReview` in `./storyReview.ts`).
import type {
  PublishedSessionReviewRead,
  StoryReviewRead,
} from "../src/storyReviewRead.ts";
import type { ReviewedStorySubject } from "../src/reviewedWorkSubject.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import { RefusedRequest } from "./localOrigin.ts";
import {
  queriedPublishedSessionSubject,
  queriedStorySubject,
} from "./reviewedWorkSubjectAdmission.ts";
import { requireExactQuery } from "./sessionAdmission.ts";

export interface AdmittedStoryReview {
  readonly kind: "story-review";
  readonly read:
    | (StoryReviewRead & { readonly subject: ReviewedStorySubject })
    | PublishedSessionReviewRead;
}

function identityReviewRead(
  url: URL,
): StoryReviewRead & { readonly subject: ReviewedStorySubject } {
  const reference = url.searchParams.get("reference");
  const run = url.searchParams.get("run");
  const completed = url.searchParams.get("completed");
  const taken = url.searchParams.get("taken");
  const historical = url.searchParams.get("historical");
  const initialSync = url.searchParams.get("initialSync");
  requireExactQuery(
    url,
    [
      "source",
      "identity",
      ...(reference === null ? [] : ["reference"]),
      ...(run === null ? [] : ["run"]),
      ...(completed === null ? [] : ["completed"]),
      ...(taken === null ? [] : ["taken"]),
      ...(historical === null ? [] : ["historical"]),
      ...(initialSync === null ? [] : ["initialSync"]),
    ],
    "review",
  );
  if (
    taken !== null &&
    (taken !== "true" ||
      completed !== null ||
      reference !== null ||
      run !== null)
  )
    throw new RefusedRequest(400, "The Taken review request is malformed.");
  if (completed !== null && completed !== "true")
    throw new RefusedRequest(400, "The completed review request is malformed.");
  if (historical !== null && (historical !== "true" || completed !== "true"))
    throw new RefusedRequest(
      400,
      "The historical review request is malformed.",
    );
  const subject = queriedStorySubject(url);
  if (reference !== null && run !== null)
    throw new RefusedRequest(400, "The review names two run identities.");
  if (
    initialSync !== null &&
    initialSync !== "true" &&
    !commitIdSchema.safeParse(initialSync).success
  )
    throw new RefusedRequest(
      400,
      "The initial sync continuation is malformed.",
    );
  return {
    subject,
    ...(reference === null ? {} : { reference }),
    ...(run === null ? {} : { run }),
    ...(completed === null ? {} : { completed: true }),
    ...(taken === null ? {} : { taken: true }),
    ...(historical === null ? {} : { historical: true }),
    ...(initialSync === null
      ? {}
      : {
          initialSync: initialSync === "true" ? (true as const) : initialSync,
        }),
  };
}

export function storyReviewRequest(url: URL): AdmittedStoryReview {
  if (url.searchParams.has("published")) {
    const run = url.searchParams.get("run");
    requireExactQuery(
      url,
      ["source", "identity", "published", ...(run === null ? [] : ["run"])],
      "review",
    );
    if (run !== null && !/^(0|[1-9]\d*)$/.test(run))
      throw new RefusedRequest(400, "The review run is malformed.");
    return {
      kind: "story-review",
      read: {
        subject: queriedPublishedSessionSubject(url),
        ...(run === null ? {} : { run }),
      },
    };
  }
  return { kind: "story-review", read: identityReviewRead(url) };
}
