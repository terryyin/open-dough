// Native status and absence evidence through the real recorded-target HTTP boundary.
import { test, expect } from "./support/codexLaunch.ts";
import {
  observationRecord as record,
  saveObservations as save,
  observationStates as states,
  observed,
  passive,
} from "./support/codexObservation.ts";
test.use({ projectFolders: ["open-dough"] });

test("read variants preserve native provenance and require exact missing-target evidence", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  observed(native, "system-error", { type: "systemError" });
  observed(native, "in-progress", { type: "idle" }, "inProgress");
  observed(native, "future-turn", { type: "idle" }, "futureTurnStatus");
  observed(native, "future-flag", {
    type: "active",
    activeFlags: ["futureFlag"],
  });
  observed(native, "absent-flags", { type: "active" });
  native.observations.set("wrong-code", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32000, message: "thread not loaded: wrong-code" },
  });
  native.observations.set("wrong-target", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32600, message: "thread not loaded: another-id" },
  });
  const ids = [...native.observations.keys()];
  save(
    dashboard,
    ids.map((id) => record(dashboard, native, id)),
  );
  expect((await states(dashboard)).map((r) => r.sessionState)).toEqual([
    { kind: "available", availability: "loaded", activity: "failed" },
    { kind: "available", availability: "loaded", activity: "working" },
    {
      kind: "available",
      availability: "loaded",
      activity: "unknown",
      description: "Codex reported native turn status: futureTurnStatus",
    },
    {
      kind: "available",
      availability: "loaded",
      activity: "unknown",
      description: "Codex reported an unrecognized active status",
    },
    {
      kind: "available",
      availability: "loaded",
      activity: "unknown",
      description: "Codex reported an unrecognized active status",
    },
    { kind: "unknown" },
    { kind: "unknown" },
  ]);
  passive(native.calls);
});
