// Shared creation recovery consumes native host facts without borrowing a command.
import { execFileSync } from "node:child_process";
import { test, expect } from "@playwright/test";
import { creationSchema, creationRecovery } from "../src/launchCreation.ts";
import { launchRecordsSchema } from "../src/agentLaunch.ts";
import { creationProblem, creationView } from "../server/launchCreation.ts";
import { codexHost } from "../server/codexHost.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";

const record = creationSchema.parse({
  request: {
    source: "open-dough",
    host: "codex",
    workflow: "ad-hoc",
    title: "Kept intent",
    instruction: "Inspect.",
  },
  creation: {
    workspace: "/saved space's workspace",
    endpoint: "unix:///saved socket",
  },
  launchedAt: "2026-10-01T00:00:00.000Z",
});

test("declared stand-in evidence gates and projects its own safely quoted recovery through GET parsing", () => {
  const args = [
    "/native space's tool",
    "history",
    "$(must remain literal)",
    "a'b",
    "",
  ];
  const boundary = {
    name: "Stand-in native host",
    creationEvidence: () => ({
      unreadableAdvice:
        "Inspect stand-in native history and repair saved evidence.",
      inspectionArgs: args,
    }),
  };
  const unreadable = creationProblem(boundary, "unreadable");
  expect(unreadable).toContain(boundary.name);
  expect(unreadable).toContain("Inspect stand-in native history");
  expect(unreadable).not.toContain("codex");
  expect(unreadable).not.toContain("--remote");
  const view = creationView(record, boundary);
  const answer = launchRecordsSchema.parse({
    records: [],
    creations: [view],
    alerts: { available: false, reason: "Test alerts unavailable" },
    establishing: [],
    establishingPreparation: [],
    keptStarts: [],
    starts: [],
    definitions: [],
  });
  expect(answer.creations[0]?.recovery).toEqual({
    hostName: boundary.name,
    inspectionArgs: args,
  });
  const recovery = creationProblem(boundary, record);
  expect(recovery).toBe(creationRecovery(view));
  expect(recovery).toContain(boundary.name);
  expect(recovery).toContain(shellCommand(args));
  // Execute only Node's argument echo, preserving all supplied argument boundaries.
  const echo = shellCommand([
    process.execPath,
    "-e",
    "process.stdout.write(JSON.stringify(process.argv.slice(1)))",
    "--",
    ...args,
  ]);
  expect(
    JSON.parse(execFileSync("/bin/sh", ["-c", echo], { encoding: "utf8" })),
  ).toEqual(args);
});

test("an absent evidence operation neither gates unreadable records nor borrows Codex recovery", () => {
  const boundary = { name: "No recovery host" };
  expect(creationProblem(boundary, "unreadable")).toBeUndefined();
  expect(creationProblem(boundary, record)).toBeUndefined();
  const view = creationView(record, boundary);
  expect(view.recovery).toEqual({ hostName: boundary.name });
  expect(creationRecovery(view)).toContain(
    "Native history inspection is unavailable",
  );
  expect(creationRecovery(view)).not.toContain("codex");
  expect(creationRecovery(view)).not.toContain("--remote");
});

test("a declared evidence requirement with no inspection arguments still refuses saved creation with unavailable recovery", () => {
  const boundary = {
    name: "Evidence-only host",
    creationEvidence: () => ({
      unreadableAdvice: "Reconcile native evidence.",
    }),
  };
  const recovery = creationProblem(boundary, record);
  expect(recovery).toContain(boundary.name);
  expect(recovery).toContain("Native history inspection is unavailable");
  expect(recovery).not.toContain("codex");
  expect(recovery).not.toContain("--remote");
  expect(creationView(record, boundary).recovery).not.toHaveProperty(
    "inspectionArgs",
  );
});

test("Codex derives its predecessor picker from saved facts without a session ID or stored recovery", () => {
  const view = creationView(record, codexHost);
  expect(view.recovery).toEqual({
    hostName: "Codex",
    inspectionArgs: [
      "codex",
      "resume",
      "--remote",
      record.creation.endpoint,
      "--cd",
      record.creation.workspace,
      "--include-non-interactive",
    ],
  });
  expect(record).not.toHaveProperty("recovery");
});
