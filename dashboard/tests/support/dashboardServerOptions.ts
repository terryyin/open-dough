import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";
import type { FakeClaudeOptions } from "./fakeClaude.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import type { DashboardServerMode } from "./serverAddress.ts";

export type DashboardServerOptions = FakeClaudeOptions & {
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
  // Preview only: serve this directory or resolve a shared build instead
  // of building a private copy.
  readonly prebuilt?: string | (() => Promise<string>) | undefined;
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
};
