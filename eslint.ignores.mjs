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
  "dashboard/frontend-tests/playwright-report/",
  "dashboard/backend-tests/test-results/",
  "dashboard/backend-tests/playwright-report/",
  "**/dough-execute-plan/scripts/test-entry-rules-runtime.mjs",
];
