import { readFileSync, rmSync } from "node:fs";
import assert from "node:assert/strict";
import { taskUsage } from "../../server/usageHistory.ts";
import {
  test,
  expect,
  response,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  at,
  nativeFile,
  readImported,
  runImport,
  keepOperationalLaunch,
} from "../../tests/usage-history/importHarness.ts";
const wrapperAt = "2026-11-14T08:00:00.000Z";
const launchAt = "2026-11-14T07:00:00.000Z";
test("rejected assignment survives missing inputs, later genuine assignment restores eligibility and launch timing stays authoritative", ({
  home,
  root,
}) => {
  const session = "replay";
  const meta = { type: "session_meta", payload: { id: session } };
  const turn = { type: "turn_context", payload: { turn_id: "turn" } };
  const wrapper = {
    type: "response_item",
    timestamp: wrapperAt,
    payload: {
      role: "user",
      content: [
        { text: "<recommended_plugins>PRIVATE-PLUGIN</recommended_plugins>" },
      ],
    },
  };
  nativeFile(root, session, [
    meta,
    turn,
    wrapper,
    response(session, "turn", "one", { output_tokens: 9 }),
  ]);
  runImport(home, root);
  const corrected = readImported(home);
  const task = Object.values(corrected.tasks)[0];
  assert(task);
  expect(task.launchedAt).toBeNull();
  expect(taskUsage(corrected, task.id).requests).toBe(0);
  rmSync(root, { recursive: true });
  expect(readImported(home)).toEqual(corrected);
  runImport(home, root);
  const missing = readImported(home);
  expect(missing.tasks).toEqual(corrected.tasks);
  expect(missing.observations).toEqual(corrected.observations);
  expect(missing.associations).toEqual(corrected.associations);
  nativeFile(root, session, [
    meta,
    turn,
    wrapper,
    {
      type: "response_item",
      timestamp: at,
      payload: {
        role: "user",
        content: [
          {
            text: "<environment_context>PRIVATE-CONTEXT</environment_context>\nDo this genuine work",
          },
        ],
      },
    },
    response(session, "turn", "one", { output_tokens: 9 }),
  ]);
  runImport(home, root);
  const supported = readImported(home);
  expect(Object.keys(supported.tasks)).toEqual([task.id]);
  expect(supported.tasks[task.id]).toMatchObject({
    launchedAt: at,
    assignmentEvidence: expect.arrayContaining([
      expect.objectContaining({ status: "rejected", at: wrapperAt }),
      expect.objectContaining({ status: "supported", at }),
    ]),
  });
  expect(taskUsage(supported, task.id).tokens.output).toBe(9);
  keepOperationalLaunch(home, launch(session, "turn", launchAt));
  const operational = `${home}/.open-dough/dashboard/agent-launches.json`;
  const bytes = readFileSync(operational, "utf8");
  runImport(home, root);
  const retained = readImported(home);
  expect(retained.tasks[task.id]).toMatchObject({
    kind: "launch",
    launchedAt: launchAt,
  });
  expect(retained.tasks[task.id]?.assignmentEvidence).toEqual(
    supported.tasks[task.id]?.assignmentEvidence,
  );
  expect(taskUsage(retained, task.id).tokens.output).toBe(9);
  expect(readFileSync(operational, "utf8")).toBe(bytes);
  rmSync(root, { recursive: true });
  runImport(home, root);
  expect(readImported(home).tasks[task.id]).toEqual(retained.tasks[task.id]);
});
