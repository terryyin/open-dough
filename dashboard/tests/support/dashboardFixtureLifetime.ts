// The resources one dashboard test server owns. Its native Claude attachments
// can be outside Vite's process group, so observe their exit after server.stop
// before removing the state their signal handlers still use. Cursor clients
// belong to their retained runner, stopped only by the machine owner. A
// stand-in runner (./cursorRunnerStandIn.ts) is released here instead of the
// real stop path, and never treated as a native runner PID.
import { rmSync } from "node:fs";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import type { ClaudeAttach } from "./fakeClaude.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { endFakeGh, type FakeGhPaths } from "./fakeGh.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import type { CursorRunnerStandIn } from "./cursorRunnerStandIn.ts";
import { endAtExit, processRunning, signal } from "./processGroup.ts";
import { waitUntil } from "./waitUntil.ts";

export function dashboardFixtureLifetime({
  tempRoot,
  home,
  ownsMachine,
  ownedAttaches,
  codex,
  gh,
  github,
  standIn,
}: {
  readonly tempRoot: string;
  readonly home: string;
  readonly ownsMachine: boolean;
  readonly ownedAttaches: () => readonly ClaudeAttach[];
  readonly codex: FakeCodex | undefined;
  readonly gh: FakeGhPaths;
  readonly github: FakeGitHub | undefined;
  readonly standIn: CursorRunnerStandIn | undefined;
}): (ghCallPidsBeforeStop?: readonly number[]) => Promise<void> {
  // SIGTERM hangs up the retained runner's clients and exits it. A stand-in's
  // address names this worker; never signal that pid as if it were the runner.
  let failedRunnerStop: number | undefined;
  const withdrawRunnerStopAtExit =
    standIn === undefined
      ? endAtExit(() => {
          const pid = readCursorRunnerAddress(home)?.pid ?? failedRunnerStop;
          if (pid !== undefined) signal(pid, "SIGTERM");
        })
      : // Sync only: never SIGTERM this worker. The listener ends with the process.
        endAtExit(() => {
          standIn.withdrawAddress();
        });
  return async (ghCallPidsBeforeStop = []) => {
    const errors: unknown[] = [];
    // Preserve each failure while still retiring the other owned services.
    const close = async (resource: () => void | Promise<void>) => {
      try {
        await resource();
      } catch (error) {
        errors.push(error);
      }
    };
    await close(async () => {
      const running = () =>
        ownedAttaches().filter((attach) => processRunning(attach.pid));
      if (
        !(await waitUntil(() => running().length === 0, { timeoutMs: 5_000 }))
      ) {
        // Capture the records before cleanup removes the fake's state.
        const remaining = running().map(({ pid, id, endedBy }) => ({
          pid,
          id,
          endedBy: endedBy ?? null,
        }));
        throw new Error(
          `This server's Claude attachments did not exit: ${JSON.stringify(remaining)}`,
        );
      }
    });
    if (standIn !== undefined) {
      await close(async () => {
        await standIn.release();
        withdrawRunnerStopAtExit();
      });
    } else if (ownsMachine) {
      await close(async () => {
        // Retain the existing exit fallback even if cleanup later removes HOME.
        failedRunnerStop = readCursorRunnerAddress(home)?.pid;
        await stopCursorRunner(home);
        failedRunnerStop = undefined;
        withdrawRunnerStopAtExit();
      });
    } else {
      withdrawRunnerStopAtExit();
    }
    if (codex !== undefined) await close(() => codex.close());
    // Its owner's gh calls write into tempRoot and ask github.
    await close(() => endFakeGh(gh, ghCallPidsBeforeStop));
    if (github !== undefined) await close(() => github.close());
    await close(() => {
      rmSync(tempRoot, { recursive: true, force: true });
    });
    if (standIn !== undefined) {
      const unexpectedFailure = standIn.failureAfterCleanup();
      if (unexpectedFailure !== undefined) errors.push(unexpectedFailure);
    }
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) {
      const details = errors
        .map((error) =>
          error instanceof Error ? error.message : String(error),
        )
        .join("\n");
      throw new AggregateError(
        errors,
        `The dashboard test server's fixtures did not close:\n${details}`,
      );
    }
  };
}
