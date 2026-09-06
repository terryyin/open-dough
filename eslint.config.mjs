import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["node_modules/", "dist/", "coverage/", ".planning/"]),
  {
    files: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
    rules: {
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "no-eval": "error",
      "no-implicit-coercion": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-param-reassign": ["error", { props: true }],
      "no-return-assign": ["error", "always"],
      "no-unused-vars": ["error", { args: "all", caughtErrors: "all" }],
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-const": "error",
      "prefer-template": "error",
    },
  },
  {
    files: ["**/*.{ts,cts,mts,tsx}"],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { args: "all", caughtErrors: "all" },
      ],
    },
  },
  prettier,
);
