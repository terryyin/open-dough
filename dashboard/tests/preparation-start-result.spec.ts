// The one reader of `preparation-assignment.mjs start`'s JSON result
// (../server/preparationResult.ts `readPreparationResult`) and the one table
// that words a stop (`preparationRefusal`).

import { expect, test } from "@playwright/test";
import {
  preparationRefusal,
  readPreparationResult,
} from "../server/preparationResult.ts";

test("reads an announced start's agent and published commit, and a continued one without", () => {
  expect(
    readPreparationResult(
      JSON.stringify({
        ok: true,
        status: "announced",
        agent: "Yui-chan",
        publishedSha: "abc",
      }),
    ),
  ).toEqual({ kind: "established", agent: "Yui-chan", publishedSha: "abc" });
  expect(
    readPreparationResult(
      JSON.stringify({ ok: true, status: "continued", agent: "Yui-chan" }),
    ),
  ).toEqual({ kind: "established", agent: "Yui-chan" });
});

test("reads a stop's status and error, and the agents holding every name", () => {
  expect(
    readPreparationResult(
      JSON.stringify({
        ok: false,
        status: "agent-unavailable",
        error: "every agent name is held on remote trunk",
        occupied: [
          { path: "a", agent: "Yui-chan" },
          { path: "b", unrecognized: "x" },
          { path: "c", agent: "Akiho-chan" },
        ],
      }),
    ),
  ).toEqual({
    kind: "stopped",
    status: "agent-unavailable",
    error: "every agent name is held on remote trunk",
    occupied: ["Yui-chan", "Akiho-chan"],
  });
  expect(
    readPreparationResult(JSON.stringify({ ok: false, status: "not-queued" })),
  ).toEqual({ kind: "stopped", status: "not-queued" });
});

test("reads output that is not a result as unreadable", () => {
  for (const stdout of ["", "usage: x", "{}", '{"ok":true}']) {
    expect(readPreparationResult(stdout)).toEqual({ kind: "unreadable" });
  }
});

test("words every stop status the start command reports", () => {
  const stop = (status: string, error?: string, occupied?: string[]) =>
    preparationRefusal({
      kind: "stopped",
      status,
      ...(error === undefined ? {} : { error }),
      ...(occupied === undefined ? {} : { occupied }),
    });
  expect(stop("not-queued", "x is not queued")).toBe(
    "The story is not queued in Backlog on origin, so it cannot be started. Nothing was launched.",
  );
  expect(stop("source-refused", "fetch failed")).toBe(
    "The story's published source cannot be started: fetch failed. Nothing was launched.",
  );
  expect(stop("invalid-request", "missing branch")).toBe(
    "The start command refused the request: missing branch. Nothing was launched.",
  );
  expect(stop("workspace-selection-failed", "dirty")).toBe(
    "The workspace could not be set up: dirty. Nothing was launched.",
  );
  expect(stop("workspace-not-isolated", "diverged")).toBe(
    "The workspace cannot take a new announcement: diverged. Nothing was launched.",
  );
  expect(stop("workspace-assigned-elsewhere", "end it first")).toBe(
    "The workspace still holds another published assignment: end it first. Nothing was launched.",
  );
  expect(stop("agent-setting-invalid", "bad nerds")).toBe(
    "The project's agent setting is invalid: bad nerds. Nothing was launched.",
  );
  expect(stop("agent-unavailable", "held", ["Yui-chan", "Akiho-chan"])).toBe(
    "Every agent name is held on origin (Yui-chan, Akiho-chan), so no agent is free to prepare the story. Nothing was launched.",
  );
  expect(stop("agent-unavailable")).toBe(
    "Every agent name is held on origin, so no agent is free to prepare the story. Nothing was launched.",
  );
  expect(stop("developer-identity-refused", "no name")).toBe(
    "Git has no usable developer identity for the announcement: no name. Nothing was launched.",
  );
  expect(stop("unpublished", "push rejected")).toBe(
    "The Preparing announcement could not be confirmed on origin: push rejected. Nothing was launched.",
  );
  expect(stop("something-new", "e")).toBe(
    "The preparation start stopped (something-new): e. Nothing was launched.",
  );
  expect(preparationRefusal({ kind: "unreadable" })).toBe(
    "The preparation start gave no result this dashboard could read. Nothing was launched.",
  );
});
