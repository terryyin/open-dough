// Keeps, on a boundary server's machine, an attempt that never settled and
// no server runs (../../src/launchAttemptSelection.ts).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { DashboardServer } from "./dashboardServer.ts";

// Keeps an unsettled copy of the project's first attempt, which no server
// runs, so it still needs reconciliation.
export function keepUnsettledAttempt(server: DashboardServer): string {
  const file = path.join(
    server.home,
    ".open-dough",
    "dashboard",
    "launch-attempts.json",
  );
  const kept = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    Record<string, unknown>[]
  >;
  const project = kept["open-dough"] ?? [];
  const [first] = project;
  if (first === undefined) throw new Error("No kept attempt");
  const unsettled = Object.fromEntries(
    Object.entries(first).filter(
      ([key]) => !["outcome", "settledAt", "reconciledAt"].includes(key),
    ),
  );
  const id = "00000000-0000-4000-8000-0000000000aa";
  project.push({ ...unsettled, id });
  writeFileSync(file, JSON.stringify(kept));
  return id;
}
