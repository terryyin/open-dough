// This owner stays in development; the app and server run from pinned tags.
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { setTimeout as wait } from "node:timers/promises";
import {
  compareDashboardReleases,
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
let candidate;
let previewExit;
try {
  const { values } = parseArgs({
    options: {
      port: { type: "string", default: "4173" },
      "check-interval": { type: "string", default: "30000" },
    },
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
  if (
    !/^[1-9]\d*$/.test(values["check-interval"]) ||
    !Number.isSafeInteger(Number(values["check-interval"])) ||
    Number(values["check-interval"]) > 2_147_483_647
  ) {
    throw new Error(
      "Check interval must be a positive number of milliseconds.",
    );
  }
  let release = await resolveDashboardRelease(
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
  // An ephemeral startup port becomes the fixed production URL for all updates.
  const productionPort = Number(new URL(preview.url).port);
  observePreview(preview);
  while (!cancellation.signal.aborted) {
    await wait(Number(values["check-interval"]), undefined, {
      signal: cancellation.signal,
    });
    if (previewExit !== undefined) {
      throw new Error(
        `Production dashboard exited unexpectedly (${previewExit.signal ?? previewExit.code}).`,
      );
    }
    const latest = await resolveDashboardRelease(
      developmentRoot,
      process.env,
      cancellation.signal,
    );
    console.log(
      `Checked production release: ${latest.tag} (${latest.commit}).`,
    );
    if (latest.tag === release.tag) {
      if (latest.commit !== release.commit) {
        throw new Error(`Published release ${release.tag} changed its commit.`);
      }
      continue;
    }
    const relation = await compareDashboardReleases(
      developmentRoot,
      latest.version,
      release.version,
      cancellation.signal,
    );
    if (relation !== "newer") continue;
    console.log(
      `Preparing production dashboard ${latest.tag} (${latest.commit}).`,
    );
    candidate = await stageDashboardRelease({
      developmentRoot,
      release: latest,
      signal: cancellation.signal,
    });
    await preview.stop();
    preview = await startReleasePreview({
      directory: candidate.directory,
      port: productionPort,
      signal: cancellation.signal,
    });
    // Keep the prior tagged tree until replacement really answers at its URL.
    await staged.remove();
    staged = candidate;
    candidate = undefined;
    release = latest;
    observePreview(preview);
    console.log(
      `Production dashboard ${release.tag} at ${preview.url} (preview PID ${preview.pid}).`,
    );
  }
} catch (error) {
  if (!cancellation.signal.aborted) {
    console.error(`Production dashboard could not run: ${error.message}`);
    process.exitCode = 1;
  }
} finally {
  await preview?.stop();
  await candidate?.remove();
  await staged?.remove();
  process.off("SIGINT", stop);
  process.off("SIGTERM", stop);
}

/** @param {Awaited<ReturnType<typeof startReleasePreview>>} running */
function observePreview(running) {
  previewExit = undefined;
  void running.exited.then((exit) => {
    if (preview === running) previewExit = exit;
  });
}
