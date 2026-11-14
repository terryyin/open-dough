// Each runner owning one group, with one quick case of its own as its
// arguments; `config`, `directory` (the config's testDir) and `root` are
// relative to the repository, `durations` to `directory`.
export const groupRunnerExamples = [
  {
    name: "Dashboard Integrated UI Test",
    script: "test:dashboard:integrated",
    config: "dashboard/integrated.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_INTEGRATED",
    directory: "dashboard",
    root: "dashboard/tests",
    durations: "integrated.longest-first",
    spec: "configuration/project-add-refusal.spec.ts",
    grep: "origin mismatch stays linked to the path",
  },
  {
    name: "Dashboard Frontend Test",
    script: "test:dashboard:frontend",
    config: "dashboard/frontend.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_FRONTEND",
    directory: "dashboard",
    root: "dashboard/frontend-tests",
    durations: "frontend.longest-first",
    spec: "control-reachability-observation.spec.ts",
    grep: "a control revealed by earlier scrolling is still checked",
  },
  {
    name: "Dashboard Backend Test",
    script: "test:dashboard:backend",
    config: "dashboard/backend.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_BACKEND",
    directory: "dashboard",
    root: "dashboard/backend-tests",
    durations: "backend.longest-first",
    spec: "launches/agent-launch-options-rules.spec.ts",
    grep: "the shipped definition is valid",
  },
  {
    name: "E2E Test",
    script: "test:e2e",
    config: "e2e/playwright.config.ts",
    prefix: "OPEN_DOUGH_E2E",
    directory: "e2e",
    root: "e2e",
    durations: "longest-first",
    spec: "runtime/browser-identity.spec.ts",
    grep: "tab, bookmark and touch icons",
  },
] as const;
export type GroupRunnerExample = (typeof groupRunnerExamples)[number];
