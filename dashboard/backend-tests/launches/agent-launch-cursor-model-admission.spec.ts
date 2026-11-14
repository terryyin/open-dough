// The launch boundary's admission of a chosen Cursor model before create-chat
// (../../server/hosts/cursor/): an unsupported effort pair or a missing effort
// is refused and a composed listed id is sent; a model Cursor does not list,
// or one whose session scope cannot be established, is refused before any
// chat is created. The synthetic `cursor-agent` (../../tests/fixtures/fake-cursor)
// lists the models and records native argv. Choosing them in the dialog:
// ../../tests/launches/agent-launch-cursor-model.spec.ts.

import { launch } from "../../tests/agentLaunchBoundary.ts";
import { expect, keptRecord, test } from "../../tests/support/cursorStart.ts";
import {
  cursorEffortModels,
  cursorModels,
  cursorOtherEffortModels,
} from "../../tests/support/fakeCursor.ts";

const effortListing = [
  ...cursorModels,
  ...cursorEffortModels,
  ...cursorOtherEffortModels,
];

test("Cursor effort admission refuses unsupported pairs and accepts a composed listed id", async ({
  dashboard,
  cursor,
}) => {
  cursor.listModels(effortListing);
  const unsupported = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "ad-hoc",
    model: "fixture-orb",
    effort: "medium",
    instruction: "Do work",
  });
  expect(unsupported.status).toBe(400);
  expect(JSON.parse(unsupported.body)).toMatchObject({
    error: expect.stringContaining("reasoning effort"),
  });
  expect(cursor.calls()).toEqual([]);

  const missingEffort = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "ad-hoc",
    model: "fixture-orb",
    instruction: "Do work",
  });
  expect(missingEffort.status).toBe(400);
  expect(cursor.calls()).toEqual([]);

  const ok = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "ad-hoc",
    model: "fixture-orb",
    effort: "low",
    instruction: "Do work",
  });
  expect(JSON.parse(ok.body)).toMatchObject({ kind: "launched" });
  const client = cursor.attaches()[0];
  expect(client?.args).toEqual([
    "--workspace",
    expect.any(String),
    "--resume",
    cursor.sessionId,
    "--model",
    "fixture-orb-low",
  ]);
  expect(keptRecord(dashboard.home).request).toMatchObject({
    model: "fixture-orb",
    effort: "low",
  });
});

test("a launch naming a model Cursor does not list is refused before create-chat", async ({
  dashboard,
  cursor,
}) => {
  const refused = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "ad-hoc",
    model: "not-a-listed-model",
    instruction: "Do work",
  });
  expect(refused.status).toBe(400);
  expect(JSON.parse(refused.body)).toMatchObject({
    error:
      "The selected Cursor model is no longer available. Choose another model or use your Cursor setting.",
  });
  expect(cursor.modelReads()).toHaveLength(1);
  expect(cursor.calls()).toEqual([]);
});

test("a chosen-model launch whose scope cannot be established is refused before create-chat", async ({
  dashboard,
  cursor,
}) => {
  cursor.breakSharedConfig();
  const refused = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "ad-hoc",
    model: "gpt-5.2",
    instruction: "Do work",
  });
  expect(JSON.parse(refused.body)).toMatchObject({
    kind: "failed",
    explanation: expect.stringContaining(
      "could not be copied into a configuration for this session",
    ),
  });
  expect(cursor.calls()).toEqual([]);
  expect(cursor.attaches()).toEqual([]);
});
