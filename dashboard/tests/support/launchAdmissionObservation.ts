import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ProductionWatcher } from "./productionWatcher.ts";
import { waitForWatcherFile } from "./watcherEvents.ts";

type AdmissionEvent =
  | { readonly kind: "closed" }
  | { readonly kind: "drained"; readonly settled: readonly string[] };

function admissionEvents(file: string): AdmissionEvent[] {
  return readFileSync(file, "utf8")
    .split("\n")
    .slice(0, -1)
    .map((line) => JSON.parse(line) as AdmissionEvent);
}

export async function observeLaunchAdmission(
  home: string,
  environment: NodeJS.ProcessEnv,
) {
  const drainEvents = path.join(home, "launch-admission-events");
  await writeFile(drainEvents, "");
  const observer = fileURLToPath(
    new URL("./watchLaunchAdmission.mjs", import.meta.url),
  );
  return {
    drainEvents,
    env: {
      ...environment,
      DOUGH_WATCHER_DRAIN_EVENTS: drainEvents,
      NODE_OPTIONS: [
        environment["NODE_OPTIONS"],
        `--import=${JSON.stringify(observer)}`,
      ]
        .filter(Boolean)
        .join(" "),
    },
  };
}

export function waitForLaunchAdmissionClosed(
  watcher: ProductionWatcher,
  drainEvents: string,
) {
  return waitForWatcherFile(watcher, drainEvents, () =>
    admissionEvents(drainEvents).find((event) => event.kind === "closed"),
  );
}

export function settledAtFirstDrain(
  watcher: ProductionWatcher,
  drainEvents: string,
) {
  return waitForWatcherFile(
    watcher,
    drainEvents,
    () =>
      admissionEvents(drainEvents).find((event) => event.kind === "drained")
        ?.settled,
  );
}
