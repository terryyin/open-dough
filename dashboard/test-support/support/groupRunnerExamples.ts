// Each runner owning one group, with one quick case of its own as its
// arguments; `config`, `directory` (the configs' directory) and `root` are
// relative to the repository; `job` is its CI job in .github/workflows/ci.yml.
// `direct` names a Playwright config a run may also start from directly;
// Dashboard Frontend Test runs on Vitest through its npm command alone.
export const groupRunnerExamples = [
  {
    name: "Dashboard Frontend Test",
    script: "test:dashboard:frontend",
    config: "dashboard/frontend.vitest.config.mts",
    direct: false,
    project: "mounted-chromium",
    prefix: "OPEN_DOUGH_DASHBOARD_FRONTEND",
    directory: "dashboard",
    root: "dashboard/frontend-tests",
    job: "dashboard-frontend",
    spec: "intent/intent-ci-comparison-head.spec.ts",
    grep: "a Taken comparison keeps the same observed tip",
  },
  {
    name: "Dashboard Backend Test",
    script: "test:dashboard:backend",
    config: "dashboard/backend.playwright.config.ts",
    direct: true,
    project: "chromium",
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
    direct: true,
    project: "chromium",
    prefix: "OPEN_DOUGH_E2E",
    directory: "e2e",
    root: "e2e",
    job: "e2e",
    spec: "runtime/browser-identity.spec.ts",
    grep: "tab, bookmark and touch icons",
  },
] as const;
export type GroupRunnerExample = (typeof groupRunnerExamples)[number];
