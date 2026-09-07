import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default defineConfig(
  globalIgnores(["node_modules/", "dist/", "coverage/", ".planning/"]),
  {
    files: ["**/*.{js,cjs,mjs,jsx}"],
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
  prettier,
);
