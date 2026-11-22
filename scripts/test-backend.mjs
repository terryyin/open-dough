// Dashboard Backend Test: the backend group's `.unit` Vitest specs in Node
// beside its Playwright specs (./dashboard-group-run.mjs).
import { runDashboardGroup } from "./dashboard-group-run.mjs";
import { backendGroup } from "../dashboard/test-support/support/browserTestGroups.mjs";

process.exitCode = await runDashboardGroup({
  group: backendGroup,
  vitestConfig: "backend.vitest.config.mts",
  engine: "node",
  name: "Dashboard Backend Test",
});
