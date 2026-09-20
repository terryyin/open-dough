import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

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

export default defineConfig(
  globalIgnores([
    "node_modules/",
    "dist/",
    "coverage/",
    ".planning/",
    "dashboard/dist/",
    "dashboard/test-results/",
    "dashboard/playwright-report/",
  ]),
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
  prettier,
);
