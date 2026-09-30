// Selected-host defaults and admission are proven before native calls.
import { installRefinementSkill } from "./launchCardPage.ts";
import { test, expect, codexSkill } from "./support/codexLaunch.ts";
import { launch, refinementRequest } from "./agentLaunchBoundary.ts";

test.use({ projectFolders: ["open-dough"] });

test("missing Codex options allow defaults, selected options/model are refused before native calls", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  codexSkill(dashboard.home);
  installRefinementSkill(dashboard.home);
  for (const changed of [{ options: ["--explore"] }, { model: "opus" }]) {
    const response = await launch(dashboard, {
      ...refinementRequest,
      host: "codex",
      ...changed,
    });
    expect(response.status).toBe(400);
    expect(native.calls).toEqual([]);
  }
  const response = await launch(dashboard, {
    ...refinementRequest,
    host: "codex",
  });
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toMatchObject({
    kind: "launched",
    record: { firstInput: { state: "confirmed" } },
  });
  expect(
    native.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
});
