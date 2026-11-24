// @ts-check
import path from "node:path";

/** @typedef {import("../../../dashboard/server/usageImport.ts").UsageImportOptions} UsageImportOptions */
/** @typedef {Required<Pick<UsageImportOptions, "home" | "store" | "codexRoots" | "claudeRoots">>} UsageImportInputs */
/** @typedef {UsageImportInputs & Required<Pick<UsageImportOptions, "since" | "responses">>} RetainedUsageImportOptions */

export class UsageImportOptionsBuilder {
  /** @param {UsageImportInputs} inputs */
  with(inputs) {
    return {
      /** @returns {RetainedUsageImportOptions} */
      please: () => ({
        ...inputs,
        codexRoots: [...inputs.codexRoots],
        claudeRoots: [...inputs.claudeRoots],
        since: "2026-09-16T00:00:00+08:00",
        responses: path.join(inputs.home, "import-responses.json"),
      }),
    };
  }
}
