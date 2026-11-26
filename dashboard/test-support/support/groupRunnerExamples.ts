// Each browser group with a quick case and its expected proof project and
// repository-relative config path.
import { backendGroup, e2eGroup, frontendGroup } from "./browserTestGroups.mjs";

export const groupRunnerExamples = [
  {
    group: frontendGroup,
    name: "Dashboard Frontend Test",
    proofConfig: "dashboard/frontend.vitest.config.mts",
    project: "mounted-chromium",
    spec: "intent/intent-ci-comparison-head.spec.ts",
    grep: "a Taken comparison keeps the same observed tip",
  },
  {
    group: backendGroup,
    name: "Dashboard Backend Test",
    proofConfig: "dashboard/backend.playwright.config.ts",
    project: "chromium",
    spec: "launches/agent-launch-options-rules.spec.ts",
    grep: "accepts a definition with or without groups and focuses",
  },
  {
    group: e2eGroup,
    name: "E2E Test",
    proofConfig: "e2e/playwright.config.ts",
    project: "chromium",
    spec: "runtime/browser-identity.spec.ts",
    grep: "tab, bookmark and touch icons",
  },
] as const;
export type GroupRunnerExample = (typeof groupRunnerExamples)[number];
