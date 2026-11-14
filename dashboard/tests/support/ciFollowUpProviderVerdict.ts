// Exact provider conclusion fields under test, including absent/null/future values.
import { apiRun } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-actions-api-test-fixtures.mjs";
import type { CiRunAnswer } from "./baseCiActions.ts";

export function providerVerdict() {
  let raw: { value: string | null | undefined } | undefined;
  return {
    set(value: string | null | undefined) {
      raw = { value };
    },
    of(run: CiRunAnswer) {
      return {
        ...apiRun(run),
        ...(run.attempt !== 1 && raw !== undefined
          ? { conclusion: raw.value }
          : {}),
      };
    },
  };
}
