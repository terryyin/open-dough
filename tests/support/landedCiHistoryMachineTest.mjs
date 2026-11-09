// Technical isolated-HOME harness for persisted history compatibility checks.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function storeOnMachine(t, history, operation, facts = {}) {
  const home = mkdtempSync(join(tmpdir(), "landed-ci-identity-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const folder = join(home, ".open-dough/dashboard");
  mkdirSync(folder, { recursive: true });
  writeFileSync(
    join(folder, "landed-ci-history.json"),
    JSON.stringify({ "open-dough": history }),
  );
  const store = new URL(
    "../../dashboard/server/landedCiHistoryStore.ts",
    import.meta.url,
  ).href;
  const scope = new URL(
    "../../dashboard/server/ciScopeHistory.ts",
    import.meta.url,
  ).href;
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        "--experimental-transform-types",
        "--input-type=module",
        "-e",
        `import {readLandedCiHistory,keepLandedCiResolution,keepLandedCiProof,keepLandedCiOrder} from ${JSON.stringify(store)}; import {scopeHistoryOf} from ${JSON.stringify(scope)}; import {readFileSync} from 'node:fs'; const facts=JSON.parse(process.argv[1]); ${operation}`,
        JSON.stringify(facts),
      ],
      {
        encoding: "utf8",
        env: { ...process.env, HOME: home, NODE_NO_WARNINGS: "1" },
      },
    ),
  );
}
