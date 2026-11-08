// Public contract for one isolated dashboard test server
// (./dashboardServer.ts): the returned controls, the development boundary
// shortcut, and the Cursor runner arrangement a private fixture may select.
import type { FakeCodex } from "./fakeCodex.ts";
import type { FakeClaudeOptions, FakeClaudeControls } from "./fakeClaude.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import type { DashboardServerMode } from "./serverAddress.ts";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";

export type { DashboardServerMode };

export type DashboardCursorRunner = "real" | "stand-in";

// The boundary server in the dev server's environment: what a spec that
// moved off a dev server starts, keeping the environment it observed there
// (../README.md, "Two tiers").
export const developmentBoundary = {
  mode: "boundary",
  environment: "development",
} as const;

export type DashboardServer = {
  readonly baseURL: string;
  readonly origin: string;
  // The server process. Its process group is the one `close` ends.
  readonly pid: number;
  // The directory this preview-mode server serves, so a test can inspect the
  // actual static assets -- for example, to confirm no credential-like
  // marker was ever written into them. `undefined` in dev mode, which serves
  // source on the fly and writes no build, and in boundary mode, no assets.
  readonly outDir: string | undefined;
  readonly github: FakeGitHub;
  readonly codex: FakeCodex;
  output(): string;
  ghCalls(): string[][];
  ghPid(): number | undefined;
  ghExitedBy(): string | undefined;
  // Runs the clock this server measures shared-observation reuse windows by
  // (../../server/observationClock.ts) `ms` further ahead; only on a server
  // started with `observationClock`.
  advanceObservationClock(ms: number): void;
  close(): Promise<void>;
} & FakeClaudeControls;

export type StartDashboardServerOptions = FakeClaudeOptions & {
  // `boundary` starts the local boundaries alone, on a plain HTTP server,
  // for a spec that never opens a page (../../backend-tests/); `dev` and `preview`
  // start Vite.
  readonly mode: DashboardServerMode;
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
  // Listing reuse ms (`../../server/revisionChecks.ts`); omitted/undefined forces 0
  // so fake-clock paced checks see one listing each; pass `checkReuseMs` for settled sharing.
  readonly revisionCheckReuseMs?: number | undefined;
  // Whether the test controls the clock reuse windows are measured by
  // (`advanceObservationClock`); the machine's own when unset.
  readonly observationClock?: boolean | undefined;
  // The fake GitHub this server's `gh` asks; a fresh one, closed with the server, when omitted.
  readonly github?: FakeGitHub;
  // Request-owner endpoint shared with the test's other callers; this server's own when omitted.
  readonly requestOwnerRoot?: string | undefined;
  // Preview only: serve this already-built directory instead of building a private copy.
  readonly prebuilt?: string | undefined;
  // Extra environment for the spawned server process only, merged over the
  // harness's own PATH/fake-`gh` wiring below. A test uses this to place a
  // credential-shaped value somewhere the production code's own subprocess
  // invocation (`../../server/ghRead.ts`, which forwards its whole
  // environment to `gh`) would see it, without touching this process's own
  // real environment.
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
