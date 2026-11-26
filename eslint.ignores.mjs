// ESLint's global ignore patterns. Kept free of imports so scripts/lint.mjs can
// read them without ESLint installed.
export default [
  "node_modules/",
  "dist/",
  "coverage/",
  "**/dough-makeme/scripts/minimatch.bundle.mjs",
  ".planning/",
  "dashboard/dist/",
  "dashboard/test-results/",
  "dashboard/playwright-report/",
  "dashboard/frontend-tests/test-results/",
  "dashboard/backend-tests/test-results/",
  "dashboard/backend-tests/playwright-report/",
  "e2e/test-results/",
  "e2e/playwright-report/",
  "**/dough-execute-plan/scripts/test-entry-rules-runtime.mjs",
  // Frozen project files of a guidance-check case, linted by their own project.
  "Distribution/evaluation/cases/guidance-checks/launch-command-tests/overlay/",
];
