import type { PublishedSource } from "../src/publishedSource.ts";
import { reviewInitialSyncEndpoint } from "../src/reviewInitialSync.ts";
import type { BoundaryMiddlewares } from "./localBoundary.ts";
import { localJsonEndpoints } from "./localJsonEndpoints.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { configuredProject } from "./projectConfiguration.ts";
import type {
  ReviewInitialSync,
  ReviewInitialSyncRequest,
} from "./reviewInitialSync.ts";
import { requireExactQuery } from "./sessionAdmission.ts";

export function admitReviewInitialSync(
  { method, url }: { readonly method?: string | undefined; readonly url: URL },
  lookup: (id: string) => PublishedSource | undefined,
): ReviewInitialSyncRequest {
  if (method !== "GET" && method !== "POST")
    throw new RefusedRequest(405, "Only GET and POST are accepted.");
  requireExactQuery(url, ["source"], "initial sync");
  const source = lookup(url.searchParams.get("source") ?? "");
  if (source === undefined)
    throw new RefusedRequest(404, "Unknown catalog source.");
  return { source, operation: method === "POST" ? "start" : "status" };
}

export function installReviewInitialSyncMiddleware(
  middlewares: BoundaryMiddlewares,
  sync: ReviewInitialSync,
) {
  return localJsonEndpoints(
    [reviewInitialSyncEndpoint],
    (req, pathname, signal) =>
      Promise.resolve(
        sync.answer(
          admitReviewInitialSync(
            {
              method: req.method,
              url: new URL(req.url ?? pathname, "http://local"),
            },
            configuredProject,
          ),
          signal,
        ),
      ),
    () => ({
      status: 503,
      body: { error: "The initial sync request could not be answered." },
    }),
  )(middlewares, null);
}
