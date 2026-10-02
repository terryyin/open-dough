// This owner stays in development; the app and server run from pinned tags.
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  resolveDashboardRelease,
  stageDashboardRelease,
  startReleasePreview,
} from "../dashboard/server/productionReleaseRunner.mjs";

const developmentRoot = fileURLToPath(new URL("..", import.meta.url));
const cancellation = new AbortController();
const stop = () => cancellation.abort();
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
let staged;
let preview;
try {
  const { values } = parseArgs({
    options: { port: { type: "string", default: "4173" } },
  });
  if (
    !/^(0|[1-9]\d*)$/.test(values.port) ||
    Number(values.port) > 65535 ||
    Number(values.port) === 43127
  ) {
    throw new Error(
      "Production port must be 0–65535 and distinct from development's 43127.",
    );
  }
  const release = await resolveDashboardRelease(
    developmentRoot,
    process.env,
    cancellation.signal,
  );
  console.log(
    `Preparing production dashboard ${release.tag} (${release.commit}).`,
  );
  staged = await stageDashboardRelease({
    developmentRoot,
    release,
    signal: cancellation.signal,
  });
  preview = await startReleasePreview({
    directory: staged.directory,
    port: Number(values.port),
    signal: cancellation.signal,
  });
  console.log(
    `Production dashboard ${release.tag} at ${preview.url} (preview PID ${preview.pid}).`,
  );
  console.log("Development remains available through npm run dev:dashboard.");
  const exit = await preview.exited;
  if (!cancellation.signal.aborted) {
    throw new Error(
      `Production dashboard exited unexpectedly (${exit.signal ?? exit.code}).`,
    );
  }
} catch (error) {
  if (!cancellation.signal.aborted) {
    console.error(`Production dashboard could not run: ${error.message}`);
    process.exitCode = 1;
  }
} finally {
  await preview?.stop();
  await staged?.remove();
  process.off("SIGINT", stop);
  process.off("SIGTERM", stop);
}
