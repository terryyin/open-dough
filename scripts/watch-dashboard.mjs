// This owner stays in development; the app and server run from pinned
// origin/main commits built in separate checkouts. A later commit is built only
// when its own CI push exclusions leave a path changed since the running one.
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { setTimeout as wait } from "node:timers/promises";
import {
  resolvePublishedMain,
  stageDeployment,
  startDeploymentPreview,
} from "../dashboard/server/productionDeployment.mjs";
import { qualifyPublishedRange } from "../dashboard/server/productionQualification.mjs";

const developmentRoot = fileURLToPath(new URL("..", import.meta.url));
const cancellation = new AbortController();
const stop = () => cancellation.abort();
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
process.on("SIGHUP", stop);
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
  // The successfully served commit; replaced only after a candidate activates.
  let baseline = await resolvePublishedMain(
    developmentRoot,
    process.env,
    cancellation.signal,
  );
  console.log(`Preparing production dashboard ${baseline.commit}.`);
  staged = await stageDeployment({
    developmentRoot,
    published: baseline,
    signal: cancellation.signal,
  });
  preview = await startDeploymentPreview({
    directory: staged.directory,
    port: Number(values.port),
    signal: cancellation.signal,
  });
  console.log(
    `Production dashboard ${baseline.commit} at ${preview.url} (preview PID ${preview.pid}).`,
  );
  console.log("Development remains available through npm run dev:dashboard.");
  // An ephemeral startup port becomes the fixed production URL for all updates.
  const productionPort = Number(new URL(preview.url).port);
  observePreview(preview);
  // The last range found to hold only excluded changes; never a failed one.
  let skippedRange;
  while (!cancellation.signal.aborted) {
    await wait(Number(values["check-interval"]), undefined, {
      signal: cancellation.signal,
    });
    if (previewExit !== undefined) {
      throw new Error(
        `Production dashboard exited unexpectedly (${previewExit.signal ?? previewExit.code}).`,
      );
    }
    let selected;
    try {
      const latest = await resolvePublishedMain(
        developmentRoot,
        process.env,
        cancellation.signal,
      );
      console.log(`Checked published main: ${latest.commit}.`);
      if (latest.commit === baseline.commit) continue;
      const range = `${baseline.commit}..${latest.commit}`;
      if (range === skippedRange) continue;
      // Pin this commit through build and startup even if main moves on.
      selected = latest;
      const { qualifies } = await qualifyPublishedRange({
        developmentRoot,
        baseline,
        selected,
        signal: cancellation.signal,
      });
      if (!qualifies) {
        skippedRange = range;
        console.log(
          `Skipping production update ${selected.commit}: every change since ${baseline.commit} is excluded by its CI push policy.`,
        );
        continue;
      }
      console.log(`Preparing production dashboard ${selected.commit}.`);
      candidate = await stageDeployment({
        developmentRoot,
        published: selected,
        signal: cancellation.signal,
      });
      await preview.stop();
      preview = undefined;
      try {
        preview = await startDeploymentPreview({
          directory: candidate.directory,
          port: productionPort,
          signal: cancellation.signal,
        });
      } catch (error) {
        cancellation.signal.throwIfAborted();
        try {
          preview = await startDeploymentPreview({
            directory: staged.directory,
            port: productionPort,
            signal: cancellation.signal,
          });
        } catch (restorationError) {
          throw new Error(
            `${selected.commit} failed: ${error.message}; restoring ${baseline.commit} also failed: ${restorationError.message}`,
            { cause: restorationError },
          );
        }
        observePreview(preview);
        console.log(
          `Restored production dashboard ${baseline.commit} at ${preview.url} (preview PID ${preview.pid}).`,
        );
        throw error;
      }
      // Publish active ownership before retiring the superseded checkout.
      // A cleanup failure must never make finally delete the live candidate.
      const retired = staged;
      staged = candidate;
      candidate = undefined;
      baseline = selected;
      observePreview(preview);
      console.log(
        `Production dashboard ${baseline.commit} at ${preview.url} (preview PID ${preview.pid}).`,
      );
      try {
        await retired.remove();
      } catch (error) {
        console.error(
          `Could not remove retired dashboard ${retired.directory}: ${error.message}`,
        );
      }
    } catch (error) {
      cancellation.signal.throwIfAborted();
      if (preview === undefined) throw error;
      console.error(
        `Production update failed${selected ? ` for ${selected.commit}` : ""}: ${error.message}\nKeeping ${baseline.commit} at ${preview.url}; retrying on a later check.`,
      );
    } finally {
      await candidate?.remove();
      candidate = undefined;
    }
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
  process.off("SIGHUP", stop);
}

/** @param {Awaited<ReturnType<typeof startDeploymentPreview>>} running */
function observePreview(running) {
  previewExit = undefined;
  void running.exited.then((exit) => {
    if (preview === running) previewExit = exit;
  });
}
