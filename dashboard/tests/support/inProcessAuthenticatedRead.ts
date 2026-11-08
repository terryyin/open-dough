// A private fake GitHub and project catalog for the in-process read boundary.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { installAuthenticatedReadMiddleware } from "../../server/authenticatedRead.ts";
import type { BoundaryInstall } from "../../server/localBoundary.ts";
import { endFakeGh, fakeGhEnv, installFakeGh } from "./fakeGh.ts";
import { startFakeGitHub } from "./fakeGitHub.ts";
import { startInProcessBoundaryHttp } from "./inProcessBoundaryHttp.ts";
import { configureDevelopmentProjects } from "./projectConfiguration.ts";
import { withRestoredEnv } from "./testEnv.ts";

export async function startInProcessAuthenticatedRead({
  extraEnv = () => ({}),
  install = installAuthenticatedReadMiddleware,
}: {
  readonly extraEnv?: (tempRoot: string) => Readonly<Record<string, string>>;
  readonly install?: BoundaryInstall;
} = {}) {
  const cleanups: Array<() => void | Promise<void>> = [];
  const close = async () => {
    const errors: unknown[] = [];
    for (const dispose of cleanups.splice(0).reverse()) {
      try {
        await dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) {
      throw new AggregateError(
        errors,
        "Could not close the in-process read fixture",
      );
    }
  };

  try {
    const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-in-process-read-"));
    cleanups.push(() => {
      rmSync(tempRoot, { recursive: true, force: true });
    });
    const github = await startFakeGitHub();
    cleanups.push(() => github.close());
    const gh = installFakeGh(tempRoot);
    cleanups.push(() => endFakeGh(gh));
    const home = path.join(tempRoot, "home");
    configureDevelopmentProjects(home);
    cleanups.push(
      withRestoredEnv({
        ...fakeGhEnv(gh, github.url),
        HOME: home,
        ...extraEnv(tempRoot),
      }),
    );
    const boundary = await startInProcessBoundaryHttp({
      name: "dough-authenticated-read",
      install,
    });
    cleanups.push(boundary.closeHttp, boundary.closeBoundary);
    return {
      origin: boundary.origin,
      closeBoundary: boundary.closeBoundary,
      gh,
      github,
      tempRoot,
      close,
    };
  } catch (error) {
    try {
      await close();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Could not start the in-process read fixture",
        { cause: cleanupError },
      );
    }
    throw error;
  }
}
