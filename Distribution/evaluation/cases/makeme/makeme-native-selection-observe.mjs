import { realpathSync } from "node:fs";
import { commonSelectionResolved } from "./makeme-common-selection-observe.mjs";

// A public resolver invocation, not a model's description of one. Its answer
// must identify this fixture's actual settings and the expected source scope.
export function selectionResolved(read, journey, configuration) {
  return (
    commonSelectionResolved(read, {
      configuration,
      selected: journey === "mixed" ? ["backend/tests/access.test.mjs"] : [],
      optedOut: journey === "mixed" ? [] : ["frontend/tests/preview.test.mjs"],
    }) ||
    read.calls.some((call) => {
      if (
        !/(?:^|[;&\n]|-(?:lc|c)\s+['"])\s*(?:\S*\/)?node\s+[^\n;]*select-makeme\.mjs/.test(
          call.command,
        ) ||
        ![0, null].includes(call.exitCode)
      )
        return false;
      for (const line of String(call.output).split("\n")) {
        let answer;
        try {
          answer = JSON.parse(line);
        } catch {
          continue;
        }
        if (
          typeof answer.configuration !== "string" ||
          !answer.configuration.endsWith("/.planning/open-dough.json")
        )
          continue;
        if (configuration !== undefined) {
          try {
            if (
              realpathSync(answer.configuration) !== realpathSync(configuration)
            )
              continue;
          } catch {
            continue;
          }
        }
        const files =
          journey === "mixed" ? ["backend/tests/access.test.mjs"] : [];
        const entries =
          journey === "mixed" ? [{ path: "backend/tests", files }] : [];
        if (
          answer.status ===
            (journey === "mixed" ? "selected" : "not-selected") &&
          JSON.stringify(answer.files) === JSON.stringify(files) &&
          JSON.stringify(answer.entries) === JSON.stringify(entries)
        )
          return true;
      }
      return false;
    })
  );
}
