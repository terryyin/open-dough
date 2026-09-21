import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  executionOwnsInstall,
  integritySnapshot,
  integrityUnchanged,
  prepTraceRel,
  readTraces,
  setupCountRel,
} from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-test-fixtures.mjs";

const setupPattern = /(?:^|[\s;&|])(?:npm\s+ci\b|(?:\.\/)?wrapper\s+prepare\b)/;
const commandPattern =
  /(?:^|[\s;&|])(?:npm\s+run\s+prove\b|(?:\.\/)?wrapper\s+prove\b)/;
const npmOrNixPattern = /(?:^|[\s/\\])(?:npm|nix)(?:\s|$)/i;
const greetingPattern = /greeting\.txt|\bhello-ok\b/;

export function readOptional(path) {
  if (!path || !existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

function collectCommandStrings(value, into, depth = 0) {
  if (value === undefined || value === null || depth > 12) return;
  if (Array.isArray(value)) {
    for (const entry of value) collectCommandStrings(entry, into, depth + 1);
    return;
  }
  if (typeof value !== "object") return;
  if (typeof value.command === "string" && value.command.trim()) {
    into.push(value.command);
  }
  for (const nested of Object.values(value)) {
    if (nested && typeof nested === "object") {
      collectCommandStrings(nested, into, depth + 1);
    }
  }
}

export function extractStreamCommands(streamText) {
  const commands = [];
  for (const line of streamText.split("\n")) {
    if (!line.trim()) continue;
    try {
      collectCommandStrings(JSON.parse(line), commands);
    } catch {
      // Host streams may include non-JSON keepalives; ignore those lines.
    }
  }
  return commands;
}

export function rolesFor(text) {
  const roles = [];
  if (setupPattern.test(text)) roles.push("setup");
  if (commandPattern.test(text)) roles.push("command");
  if (greetingPattern.test(text)) roles.push("delegate");
  return roles;
}

function reconstructInvocations(observation) {
  const invocations = [];
  const failed = observation.ok === false;
  const seen = new Set();
  for (const text of observation.commands ?? []) {
    for (const role of rolesFor(text)) {
      const key = `${role}:${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      invocations.push({
        role,
        command: text,
        cwd: observation.executionCheckout,
        code: failed && role === "setup" ? 1 : 0,
        stdout: "",
        stderr: failed && role === "setup" ? "failed" : "",
      });
    }
  }
  return invocations;
}

function invocationsFromTraces(observation, existing) {
  if (observation.reused === true) return existing;
  const invocations = [...existing];
  const hasRole = (role) => invocations.some((entry) => entry.role === role);
  for (const trace of observation.traces ?? []) {
    if (trace.type !== "setup" && trace.type !== "command") continue;
    if (hasRole(trace.type)) continue;
    invocations.push({
      role: trace.type,
      command: trace.type === "setup" ? "setup" : "command",
      cwd: trace.cwd ?? observation.executionCheckout,
      code: 0,
      stdout: "",
      stderr: "",
    });
  }
  if (
    observation.greeting &&
    !hasRole("delegate") &&
    observation.ok !== false
  ) {
    invocations.push({
      role: "delegate",
      command: "greeting.txt",
      cwd: observation.executionCheckout,
      code: 0,
      stdout: "",
      stderr: "",
    });
  }
  return invocations;
}

function tracesFor(observation) {
  if (Array.isArray(observation.traces)) return observation.traces;
  const paths = [
    observation.tracePath,
    join(observation.executionCheckout, prepTraceRel),
    join(observation.originCheckout ?? "", prepTraceRel),
  ].filter(Boolean);
  for (const path of paths) {
    if (existsSync(path)) return readTraces(path);
  }
  return [];
}

export function nativeEvidence(observation) {
  const traces = tracesFor(observation);
  return {
    traces,
    invocations: invocationsFromTraces(
      { ...observation, traces },
      observation.invocations ?? reconstructInvocations(observation),
    ),
  };
}

function lockfileIntegrity(live) {
  if (live.wrapperDriven === true || live.variant === "wrapper") {
    const marker = join(live.origin, "origin-marker");
    const expected = live.before?.originMarker;
    const markerDigest = existsSync(marker)
      ? createHash("sha256").update(readFileSync(marker)).digest("hex")
      : null;
    return {
      originMarkerUnchanged: !expected || markerDigest === expected,
      originLockUnchanged: true,
      executionLockUnchanged: true,
    };
  }
  if (!live.before) {
    return {
      originMarkerUnchanged: true,
      originLockUnchanged: true,
      executionLockUnchanged: true,
    };
  }
  return integrityUnchanged(
    live.before,
    integritySnapshot(live.origin, live.execution),
  );
}

function readCheckoutText(checkout, name) {
  const path = join(checkout, name);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

export function observeNativePreparation(live) {
  const origin = live.origin;
  const execution = live.execution;
  const missing =
    !origin || !execution || !existsSync(origin) || !existsSync(execution);
  const usedNpmOrNix = (live.commands ?? []).some((text) =>
    npmOrNixPattern.test(text),
  );
  if (missing) {
    return {
      variant: live.variant,
      host: live.host,
      streamStatus: live.streamStatus,
      streamReason: live.streamReason ?? "",
      commands: live.commands,
      responseText: live.responseText ?? "",
      executionCheckout: execution ?? "",
      originCheckout: origin ?? "",
      traces: [],
      setupCount: 0,
      greeting: null,
      greetingInOrigin: false,
      executionOwnsInstall: false,
      originMarkerUnchanged: true,
      originLockUnchanged: true,
      executionLockUnchanged: true,
      wrapperDriven: live.wrapperDriven === true || live.variant === "wrapper",
      generatedOutputInWorktree: false,
      sharedArtifactCacheOutsideWorktree: Boolean(live.artifactCache),
      copiedOriginArtifacts: false,
      usedNpmOrNix,
      ok: live.ok,
      reused: live.reused,
      report: live.report ?? live.responseText ?? "",
      missingCheckout: true,
    };
  }
  const greeting = readCheckoutText(execution, "greeting.txt");
  const wrapperBuilt = existsSync(join(execution, "target", "built"));
  const copiedOrigin = existsSync(join(execution, "target", "origin-only"));
  const wrapperDriven =
    live.wrapperDriven === true || live.variant === "wrapper";
  return {
    variant: live.variant,
    host: live.host,
    streamStatus: live.streamStatus,
    streamReason: live.streamReason ?? "",
    commands: live.commands,
    responseText: live.responseText ?? "",
    executionCheckout: execution,
    originCheckout: origin,
    convention: live.convention,
    traces: tracesFor({
      traces: live.traces,
      tracePath: live.tracePath,
      executionCheckout: execution,
      originCheckout: origin,
    }),
    setupCount:
      live.setupCount ??
      (Number(readCheckoutText(execution, setupCountRel)) || 0),
    greeting,
    greetingInOrigin: existsSync(join(origin, "greeting.txt")),
    executionOwnsInstall: wrapperDriven
      ? true
      : executionOwnsInstall(origin, execution),
    ...lockfileIntegrity({ ...live, wrapperDriven, origin, execution }),
    wrapperDriven,
    generatedOutputInWorktree: wrapperBuilt,
    sharedArtifactCacheOutsideWorktree: Boolean(live.artifactCache),
    copiedOriginArtifacts: copiedOrigin,
    usedNpmOrNix,
    ok: live.ok,
    reused: live.reused,
    report: live.report ?? live.responseText ?? "",
  };
}
