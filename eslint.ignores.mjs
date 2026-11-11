// ESLint's global ignore patterns. Kept free of imports so scripts/lint.mjs can
// read them without ESLint installed.
export default [
  "node_modules/",
  "dist/",
  "coverage/",
  "src/skills/dough-makeme/scripts/minimatch.bundle.mjs",
  ".planning/",
  "dashboard/dist/",
  "dashboard/test-results/",
  "dashboard/playwright-report/",
];
