// Continuation refusal wording when a kept unannounced preparation cannot
// continue: printed failure text reaches the Taken card inside the safety wrap.
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  keptPreparation,
  type KeptPreparation,
} from "../../tests/support/keptPreparation.ts";

test.describe("a kept preparation continuation refusal", () => {
  let preparation: KeptPreparation;
  test.beforeEach(async () => {
    preparation = await keptPreparation();
  });
  test.afterEach(async () => {
    await preparation.close();
  });
  test("a continue that prints a failure without readable JSON names that failure on the Taken refusal", async () => {
    await preparation.serve(60_000);
    preparation.server.claudeScenario("launched");
    await preparation.keepUnannouncedByFailingPrecommit();
    const printedFailure = "ownership probe exploded";
    const restore = preparation.wrapPreparationAssignment(
      (original) =>
        `import { spawnSync } from "node:child_process";\nif (process.argv[2] === "continue") {\n  process.stderr.write(${JSON.stringify(`${printedFailure}\\n`)});\n  process.exit(2);\n}\nconst result = spawnSync(process.execPath, [${JSON.stringify(original)}, ...process.argv.slice(2)], { stdio: "inherit" });\nprocess.exitCode = result.status ?? 1;\n`,
    );
    const refused = await preparation.resume();
    expect(refused.kind).toBe("failed");
    expect(refused.explanation).toContain(printedFailure);
    expect(refused.explanation).toContain("The start was kept");
    expect(refused.explanation).toContain(
      "assignment ownership remains unverified",
    );
    expect(refused.explanation).not.toContain(
      "The installed command could not verify continuation.",
    );
    expect(preparation.keptStart()).toBeDefined();
    expect(preparation.server.claudeLaunchCalls()).toEqual([]);
    restore();
    await preparation.expectResumed(preparation.ask);
  });
});
