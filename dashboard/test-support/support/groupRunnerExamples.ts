// Each runner owning one group, with one quick case of its own as its
// arguments; `config`, `directory` (the config's testDir) and `root` are
// relative to the repository; `job` is its CI job in .github/workflows/ci.yml.
export const groupRunnerExamples = [
  {
    name: "Dashboard Frontend Test",
    script: "test:dashboard:frontend",
    config: "dashboard/frontend.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_FRONTEND",
    directory: "dashboard",
    root: "dashboard/frontend-tests",
    job: "dashboard-frontend",
    spec: "test-harness/control-reachability-observation.spec.ts",
    grep: "a control revealed by earlier scrolling is still checked",
  },
  {
    name: "Dashboard Backend Test",
    script: "test:dashboard:backend",
    config: "dashboard/backend.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_BACKEND",
    directory: "dashboard",
    root: "dashboard/backend-tests",
    job: "dashboard-backend",
    spec: "launches/agent-launch-options-rules.spec.ts",
    grep: "accepts a definition with or without groups and focuses",
  },
  {
    name: "E2E Test",
    script: "test:e2e",
    config: "e2e/playwright.config.ts",
    prefix: "OPEN_DOUGH_E2E",
    directory: "e2e",
    root: "e2e",
    job: "e2e",
    spec: "runtime/browser-identity.spec.ts",
    grep: "tab, bookmark and touch icons",
  },
] as const;
export type GroupRunnerExample = (typeof groupRunnerExamples)[number];
