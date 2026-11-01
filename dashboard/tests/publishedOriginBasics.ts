// Shared published-origin identity: default repository, backlog path, and
// which of a fake-GitHub call targets the ref or the backlog file.

import type { GhCall } from "./support/fakeGitHub.ts";

// The project this dashboard opens by default. Callers that observe another
// project pass its repository explicitly; this default keeps every existing
// single-project journey unchanged.
export const defaultRepository = "terryyin/open-dough";

export const backlogPath = ".planning/PRODUCT-BACKLOG.md";

// Which published file a call asks for: "main" for the ref (or a check
// listing it among the branch heads), the revision for the backlog file read
// at it, or undefined for anything else.
export function publishedTarget(call: GhCall): string | undefined {
  const { request } = call;
  if (
    (request.kind === "ref" && request.ref === "main") ||
    request.kind === "matching-refs"
  ) {
    return "main";
  }
  if (request.kind === "content" && request.path === backlogPath) {
    return request.revision;
  }
  return undefined;
}
