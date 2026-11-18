// Authenticated-read answers for frontend-only journeys: backlog, files,
// Intent, agents, done catalog/bodies, and revision-move checks.

import { revisionStreamAtParameter } from "../../src/authenticatedReadRules.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";

const emptyCatalog = JSON.stringify({
  schemaVersion: 1,
  records: [],
  unreadable: [],
});

export function answerAuthenticatedRead(
  state: Pick<
    FrontendServiceState,
    | "revision"
    | "branchHeads"
    | "locations"
    | "candidates"
    | "doneBySource"
    | "files"
    | "backlog"
  >,
  params: URLSearchParams,
): { status: number; body: unknown; stream?: boolean } {
  const revision = params.get("revision") ?? state.revision;
  const sourceId = params.get("source") ?? "open-dough";
  // A revision check says whether the project moved from the revision the
  // page shows, and where each watched branch arranged in `branchHeads` is;
  // without arranged heads its stream says only that it moved, answering as
  // a plain read until then.
  const since = params.get("since");
  const at = params.get(revisionStreamAtParameter);
  const watching = state.branchHeads !== undefined;
  if (since !== null || (at !== null && (at !== state.revision || watching))) {
    const changed = (since ?? at) !== state.revision;
    const heads = state.branchHeads;
    const branches =
      heads === undefined
        ? []
        : params
            .getAll("watch")
            .map((branch) => ({ branch, head: heads[branch] ?? null }));
    const body = { revision: state.revision, changed, branches };
    return { status: 200, body, stream: since === null };
  }
  if (params.get("intent") === "locations") {
    return { status: 200, body: state.locations };
  }
  if (params.get("intent") === "test-optimization-candidates") {
    return { status: 200, body: state.candidates };
  }
  if (params.get("agents") === "profiles") {
    return {
      status: 200,
      body: {
        revision,
        profiles: Object.entries(state.files)
          .filter(([path]) => path.startsWith(".planning/agents/"))
          .map(([path, text]) => ({ path, text })),
        settings: state.files[".planning/open-dough.json"] ?? null,
      },
    };
  }
  if (params.get("done") === "catalog") {
    const arranged = state.doneBySource[sourceId]?.catalog;
    if (arranged !== undefined && typeof arranged === "object") {
      if ("gap" in arranged) {
        return { status: 200, body: { revision, gap: arranged.gap } };
      }
      return {
        status: arranged.status,
        body: { error: arranged.error },
      };
    }
    return {
      status: 200,
      body: {
        revision,
        catalog: typeof arranged === "string" ? arranged : emptyCatalog,
      },
    };
  }
  if (params.get("done") === "bodies") {
    const bodies = state.doneBySource[sourceId]?.bodies ?? {};
    const files = params.getAll("file");
    return {
      status: 200,
      body: {
        revision,
        records: files.map((fileName) => ({
          path: `.planning/done/${fileName}`,
          text: bodies[fileName] ?? "",
        })),
      },
    };
  }
  // Which commit an arranged watched branch names now.
  const branch = params.get("branch");
  if (branch !== null && params.get("path") === null && watching) {
    const head = state.branchHeads?.[branch] ?? null;
    return { status: 200, body: { revision, branch, head } };
  }
  const filePath = params.get("path");
  if (filePath !== null) {
    const text = state.files[filePath];
    if (text === undefined) {
      return {
        status: 404,
        body: { error: `Unknown path ${filePath}`, recovery: "transient" },
      };
    }
    if (params.get("committed") === "last") {
      return {
        status: 200,
        body: {
          revision,
          path: filePath,
          committedAt: "2026-11-01T00:00:00.000Z",
        },
      };
    }
    if (params.get("committed") === "added") {
      return {
        status: 200,
        body: {
          revision,
          path: filePath,
          added: {
            commit: revision,
            committerName: "Test",
            committedAt: "2026-11-01T00:00:00.000Z",
            login: "tester",
          },
        },
      };
    }
    return { status: 200, body: { revision, path: filePath, text } };
  }
  return {
    status: 200,
    body: {
      revision: state.revision,
      backlog: state.backlog,
      askedAt: "2026-11-05T08:00:00.000Z",
    },
  };
}
