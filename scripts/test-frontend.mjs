// Dashboard Frontend Test: the frontend group's mounted Vitest specs in
// Chromium beside its retained Playwright specs (./dashboard-group-run.mjs).
import { runDashboardGroup } from "./dashboard-group-run.mjs";
import { frontendGroup } from "../dashboard/test-support/support/browserTestGroups.mjs";

process.exitCode = await runDashboardGroup({
  group: frontendGroup,
  vitestConfig: "frontend.vitest.config.mts",
  engine: "mounted-chromium",
  name: "Dashboard Frontend Test",
});
