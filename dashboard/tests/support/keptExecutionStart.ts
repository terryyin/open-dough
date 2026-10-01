// The kept-start fixture's persisted evidence and bare-origin push gate.
// The resume journeys keep their server lifetimes and assertions in the spec.

import { chmodSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";

export function keptExecutionStart(origin: StartOrigin) {
  const hook = path.join(origin.origin, "hooks", "pre-receive");
  const starts = path.join(
    origin.machine,
    "home/.open-dough/dashboard/execution-starts.json",
  );
  return {
    read: () =>
      (
        JSON.parse(readFileSync(starts, "utf8")) as {
          "open-dough"?: Record<string, Record<string, unknown>>;
        }
      )["open-dough"]?.[queuedIdentity],
    installHook(body: string): void {
      writeFileSync(hook, `#!/bin/sh\n${body}`);
      chmodSync(hook, 0o755);
    },
    removeHook(): void {
      rmSync(hook);
    },
  };
}
