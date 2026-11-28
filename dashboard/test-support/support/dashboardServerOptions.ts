import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";
import type { FakeClaudeOptions } from "./fakeClaude.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import type { FakeGhTransport } from "./fakeGh.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import type { DashboardServerMode } from "./serverAddress.ts";

export type DashboardCursorRunner = "real" | "stand-in";

// The boundary server in the development project environment.
export const developmentBoundary = {
  mode: "boundary",
  environment: "development",
} as const;

export type DashboardServerOptions = FakeClaudeOptions & {
  // `boundary` starts the local boundaries alone, on a plain HTTP server,
  // for a spec that never opens a page (../../backend-tests/); `dev` and `preview`
  // start Vite.
  readonly mode: DashboardServerMode;
  // Boundary only: mount in this worker with the Cursor runner stand-in.
  readonly mountBoundary?: boolean;
  // Ask for a live server by naming the proof that needs it.
  readonly liveServer?: string | undefined;
  // Catalog projects installed under the fixture machine's HOME.
  readonly projectFolders?: readonly string[] | undefined;
  // Dev only: one the test restarts in place by SIGUSR2 (./serverAddress.ts).
  readonly restartable?: boolean;
  // Boundary only: the project environment the server keeps its project
  // list in (./projectConfiguration.ts); production when unset. Dev is
  // always development and preview always production.
  readonly environment?: ProjectEnvironment | undefined;
  // A development-environment server gets its known projects, as existing
  // dev journeys expect; false observes a genuine empty first start.
  // Existing files are always kept, including empty lists.
  readonly configureDevelopmentProjects?: boolean;
  readonly codex?: boolean;
  readonly codexProtocol?: FakeCodex | undefined;
  // The server's own bound when unset.
  readonly readTimeoutMs?: number | undefined;
  // Rate-limit backoff base (`github-request-admission.mjs`); 1 min unset.
  readonly limitBackoffMs?: number | undefined;
  // Retained-answer budget (`../../server/retainedAnswers.ts`); 64 MiB unset.
  readonly retainedAnswersBytes?: number | undefined;
  // Verified Git observation reuse ms; omitted/undefined forces 0
  // so fake-clock paced checks see one listing each; pass `checkReuseMs` for settled sharing.
  readonly revisionCheckReuseMs?: number | undefined;
  // Whether the test controls the clock reuse windows are measured by
  // (`advanceObservationClock`); the machine's own when unset.
  readonly observationClock?: boolean | undefined;
  // Whether the test ends launch waits itself (`endLaunchWait`), as well
  // as the server's bound (`launchTimeoutMs`) ending them.
  readonly launchWaitEnd?: boolean | undefined;
  // The fake GitHub this server's `gh` asks; a fresh one, closed with the server, when omitted.
  readonly github?: FakeGitHub;
  readonly ghTransport?: FakeGhTransport | undefined;
  // Request-owner endpoint shared with the test's other callers; this server's own when omitted.
  readonly requestOwnerRoot?: string | undefined;
  // Preview only: serve this directory or resolve a shared build instead
  // of building a private copy.
  readonly prebuilt?: string | (() => Promise<string>) | undefined;
  // Extra server environment over the harness's PATH and fake host wiring.
  // Live servers receive it in their child environment. A mounted server
  // applies it to the worker for the lifetime of its boundary.
  readonly extraEnv?: Readonly<Record<string, string>>;
  // Directories placed ahead of the harness binaries on PATH.
  readonly pathPrefix?: readonly string[];
  // This port, which must be free, instead of any free one: a server
  // restarted on a closed one's port answers the page that server opened.
  readonly port?: number | undefined;
  // `stand-in` supplies an accepting Cursor address without a real runner
  // for checks that do not prove Cursor operations. Real runner is the
  // default. Caller-owned restart machines stay on the real route.
  readonly cursorRunner?: DashboardCursorRunner;
};

// What a server start serves from the run's shared artifacts
// (./runArtifacts.ts): a preview serves the app build, and a start that
// serves from source or mounts the boundary in this worker needs no server
// bundle.
export function servedArtifacts(
  mode: DashboardServerMode,
  mounted: boolean,
): { app: boolean; bundle: boolean } {
  return { app: mode === "preview", bundle: !mounted && mode !== "dev" };
}
