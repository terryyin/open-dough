// Keeps, on a boundary server's machine, an attempt that never settled and
// no server runs (../../src/launchAttemptSelection.ts).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LaunchAttemptRecord } from "../../src/agentLaunch.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { DashboardServer } from "./dashboardServer.ts";

// Keeps an unsettled attempt of the project's first attempt's request,
// accepted at the same time, which no server runs, so it still needs
// reconciliation.
export function keepUnsettledAttempt(server: DashboardServer): string {
  const file = path.join(
    server.home,
    ".open-dough",
    "dashboard",
    "launch-attempts.json",
  );
  const kept = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    LaunchAttemptRecord[]
  >;
  const project = kept["open-dough"] ?? [];
  const [first] = project;
  if (first === undefined) throw new Error("No kept attempt");
  const id = "00000000-0000-4000-8000-0000000000aa";
  project.push(
    makeMe.anAcceptedAttempt
      .withId(id)
      .requesting(first.request)
      .acceptedAt(first.acceptedAt)
      .please(),
  );
  writeFileSync(file, JSON.stringify(kept));
  return id;
}
