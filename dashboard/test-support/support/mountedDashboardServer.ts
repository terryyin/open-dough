import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";
import { startInProcessBoundaryHttp } from "./inProcessBoundaryHttp.ts";
import { withRestoredEnv } from "./testEnv.ts";

export type DashboardServerLaunch = {
  readonly baseURL: string;
  readonly outDir: string | undefined;
  pid(): number;
  output(): string;
  close(): Promise<void>;
};

let mounted = false;

// Own the worker before fixture creation. Keep ownership through teardown,
// since the mounted boundary still reads the worker's environment while closing.
export async function withMountedDashboard<
  T extends { close(): Promise<void> },
>(start: () => Promise<T>): Promise<T> {
  if (mounted) {
    throw new Error(
      "This worker already has a mounted dashboard server. Use liveServer for a second server.",
    );
  }
  mounted = true;
  try {
    const dashboard = await start();
    const close = dashboard.close.bind(dashboard);
    let closing: Promise<void> | undefined;
    return Object.assign(dashboard, {
      close: () => {
        closing ??= close().finally(() => {
          mounted = false;
        });
        return closing;
      },
    });
  } catch (error) {
    mounted = false;
    throw error;
  }
}

function processOnly(member: "pid" | "output"): never {
  throw new Error(
    `The mounted dashboard server has no ${member}. Use liveServer to prove a separate process.`,
  );
}

export async function launchMountedDashboard(
  options: {
    readonly environment: ProjectEnvironment;
    readonly env: NodeJS.ProcessEnv;
    readonly port: number;
  },
  closeOwned: () => Promise<void>,
): Promise<DashboardServerLaunch> {
  const cleanups: Array<() => void | Promise<void>> = [closeOwned];
  const close = async () => {
    const errors: unknown[] = [];
    for (const cleanup of cleanups.splice(0).reverse()) {
      try {
        await cleanup();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1)
      throw new AggregateError(
        errors,
        "Could not close the mounted dashboard server",
      );
  };
  try {
    const overrides = Object.fromEntries(
      Object.entries(options.env).filter(
        (entry): entry is [string, string] =>
          entry[1] !== undefined && entry[1] !== process.env[entry[0]],
      ),
    );
    cleanups.unshift(withRestoredEnv(overrides));
    const { localBoundaries } = await import("../../server/localBoundaries.ts");
    const boundary = await startInProcessBoundaryHttp(
      localBoundaries.filter(({ name }) => name !== "dough-incident-record"),
      options.environment,
      options.port,
    );
    cleanups.push(boundary.closeHttp, boundary.closeBoundary);
    return {
      baseURL: boundary.origin,
      outDir: undefined,
      pid: () => processOnly("pid"),
      output: () => processOnly("output"),
      close,
    };
  } catch (error) {
    try {
      await close();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Could not start the mounted dashboard server",
        { cause: cleanupError },
      );
    }
    throw error;
  }
}
