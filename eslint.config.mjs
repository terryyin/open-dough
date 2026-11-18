import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";
import ignores from "./eslint.ignores.mjs";

const linterOptions = {
  reportUnusedDisableDirectives: "error",
  reportUnusedInlineConfigs: "error",
};

// House rules shared by JavaScript and TypeScript sources. Unused variables
// are reported by whichever rule understands the language.
const rules = {
  curly: ["error", "all"],
  eqeqeq: ["error", "always"],
  "no-eval": "error",
  "no-implicit-coercion": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",
  "no-param-reassign": ["error", { props: true }],
  "no-return-assign": ["error", "always"],
  "no-var": "error",
  "object-shorthand": "error",
  "prefer-const": "error",
  "prefer-template": "error",
};
const unusedVars = ["error", { args: "all", caughtErrors: "all" }];

// The modules whose `test` runs a Frontend spec against substitutes.
const frontendTestModules =
  "dashboard/tests/support/frontendApp.ts, dashboard/tests/support/pageTest.ts or dashboard/tests/support/comparisonMountPage.ts";

export default defineConfig(
  globalIgnores(ignores),
  {
    files: ["**/*.{js,cjs,mjs,jsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    linterOptions,
    rules: { ...rules, "no-unused-vars": unusedVars },
  },
  {
    files: ["**/*.{ts,mts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions,
    rules: {
      ...rules,
      // Superseded by the type-aware rule of the same meaning.
      "no-implied-eval": "off",
      "@typescript-eslint/no-unused-vars": unusedVars,
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
    },
  },
  {
    // Dashboard and E2E specs run under the shared page-test base, whose
    // `page` finishes its intercepted reads before teardown.
    files: [
      "dashboard/tests/**/*.{ts,mts,tsx}",
      "dashboard/frontend-tests/**/*.{ts,mts,tsx}",
      "dashboard/backend-tests/**/*.{ts,mts,tsx}",
      "e2e/**/*.{ts,mts,tsx}",
    ],
    ignores: [
      "dashboard/tests/support/pageTest.ts",
      // Run by the quiet-reporter proof under their own configuration; the
      // case module registers tests for the proof spec that imports it.
      "dashboard/tests/fixtures/quiet-reporter/**/*.proof.ts",
      "dashboard/tests/fixtures/quiet-reporter/nested/cases.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@playwright/test",
              importNames: ["test", "default"],
              message:
                "Import `test` from dashboard/tests/support/pageTest.ts (or a fixture module built on it) so the page drains its intercepted reads.",
            },
          ],
        },
      ],
    },
  },
  {
    // Frontend specs run the built app against substitutes, never the real
    // dashboard server, fake GitHub or fake hosts. Names are refused, not
    // modules: their helpers stay importable from dashboardTest.ts. This
    // block replaces the shared one's options for these files, so it
    // restates its restriction.
    files: ["dashboard/frontend-tests/**/*.{ts,mts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@playwright/test",
              importNames: ["test", "default"],
              message: `Import \`test\` from ${frontendTestModules} so the page drains its intercepted reads.`,
            },
          ],
          patterns: [
            {
              regex: "(^|/)dashboardTest\\.ts$",
              importNames: ["test", "default"],
              message: `Frontend specs take \`test\` from ${frontendTestModules}; dashboardTest.ts's \`test\` starts the real dashboard server.`,
            },
            {
              regex: ".",
              importNames: [
                "startDashboardServer",
                "startFakeGitHub",
                "installFakeClaude",
                "installFakeCodex",
                "installFakeCursor",
              ],
              message: `Frontend specs do not start the dashboard server, fake GitHub or a fake host; take \`test\` from ${frontendTestModules} and substitute the services.`,
            },
          ],
        },
      ],
    },
  },
  {
    // Test code finds the repository from its own location, so checks run
    // from any directory.
    files: [
      "dashboard/tests/**",
      "dashboard/frontend-tests/**",
      "dashboard/backend-tests/**",
      "e2e/**",
      "tests/**",
      "Distribution/tests/skills/**",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='process'][callee.property.name='cwd']",
          message:
            "Do not take the repository root from the working directory. Use `repoRoot` from dashboard/tests/support/repositoryRoot.ts in dashboard tests, or `checkoutRoot` from Distribution/src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs elsewhere.",
        },
      ],
    },
  },
  prettier,
);
