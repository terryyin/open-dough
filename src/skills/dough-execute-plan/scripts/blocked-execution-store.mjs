import { createHash, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, renameSync, realpathSync } from "node:fs";
import { join, isAbsolute } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

export const execute = promisify(execFile);
export const holdCommand = (command, directory) => [
  process.execPath,
  fileURLToPath(new URL("./blocked-execution.mjs", import.meta.url)),
  command,
  "--directory",
  directory,
];
export const digestFile = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
export const readHold = (directory) =>
  JSON.parse(readFileSync(join(directory, "hold.json"), "utf8"));
export function writeJsonFile(directory, name, value) {
  const temporary = join(
    directory,
    `${name}-${process.pid}-${randomUUID()}.tmp`,
  );
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    mode: 0o600,
  });
  renameSync(temporary, join(directory, name));
}
export const writeHold = (directory, record) =>
  writeJsonFile(directory, "hold.json", record);

/**
 * @typedef {object} HeldExecutionInput
 * @property {{identity: string, owner: string, workspace: string, branch: string,
 * revision: string, authority: {description: string, file?: string, sha256?: string}, acceptedProof: unknown[],
 * unfinishedWork: unknown[], outstandingProof: unknown[]}} execution
 * @property {{kind: string, description: string, signalFile: string,
 * observed: string, check: string[]}} condition
 * @property {{host: string, threadId: string, endpoint: string}} continuation
 * @property {{owner: string, recovery: string}} nextObservation
 */

const required = (value, label) => {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Missing ${label}.`);
};
/** @param {HeldExecutionInput} input */
export function validateInput(input) {
  for (const key of ["identity", "owner", "workspace", "branch", "revision"]) {
    required(input.execution?.[key], `execution.${key}`);
  }
  for (const key of ["acceptedProof", "unfinishedWork", "outstandingProof"]) {
    if (!Array.isArray(input.execution[key]))
      throw new Error(`Missing execution.${key}.`);
  }
  required(
    input.execution.authority?.description,
    "execution.authority.description",
  );
  if (input.execution.authority.file !== undefined) {
    required(input.execution.authority.sha256, "execution.authority.sha256");
  }
  if (input.condition?.kind !== "supplier") {
    throw new Error(
      "Use a supplier hold here; running verification retains its existing owner.",
    );
  }
  for (const key of ["description", "signalFile", "observed"]) {
    required(input.condition[key], `condition.${key}`);
  }
  if (
    !Array.isArray(input.condition.check) ||
    !input.condition.check.length ||
    input.condition.check.some((argument) => typeof argument !== "string")
  ) {
    throw new Error("Missing read-only condition.check command array.");
  }
  for (const key of ["owner", "recovery"])
    required(input.nextObservation?.[key], `nextObservation.${key}`);
  if (input.continuation?.host !== "codex")
    throw new Error("This host has no verified automatic delivery binding.");
  required(input.continuation.threadId, "continuation.threadId");
  if (!input.continuation.endpoint?.startsWith("unix:///"))
    throw new Error("Missing native Unix endpoint.");
  for (const path of [
    input.execution.workspace,
    input.execution.authority.file,
    input.condition.signalFile,
  ].filter(Boolean)) {
    if (!isAbsolute(path)) throw new Error("Hold paths must be absolute.");
  }
}

export async function verifyExecution(input) {
  const { execution } = input;
  if (realpathSync(execution.workspace) !== execution.workspace) {
    throw new Error("Execution workspace must be canonical.");
  }
  const git = async (...args) =>
    (await execute("git", args, { cwd: execution.workspace })).stdout.trim();
  if (
    (await git("symbolic-ref", "--short", "HEAD")) !== execution.branch ||
    (await git("rev-parse", "HEAD")) !== execution.revision
  ) {
    throw new Error(
      "Held execution branch or revision changed; reconcile ownership before continuing.",
    );
  }
  if (
    execution.authority.file &&
    digestFile(execution.authority.file) !== execution.authority.sha256
  ) {
    throw new Error(
      "Execution authority/owner evidence changed; its owner must reassess it.",
    );
  }
}

export async function checkCondition(input) {
  const before = digestFile(input.condition.signalFile);
  const [command, ...args] = input.condition.check;
  const result = await execute(command, args, {
    cwd: input.execution.workspace,
  });
  const judgment = JSON.parse(result.stdout);
  if (
    typeof judgment.satisfied !== "boolean" ||
    typeof judgment.evidence !== "string"
  ) {
    throw new Error(
      "Condition check must return {satisfied:boolean,evidence:string}.",
    );
  }
  const after = digestFile(input.condition.signalFile);
  return { stable: before === after, observation: after, judgment };
}

export function verifySameExecution(previous, input) {
  for (const field of ["identity", "owner", "workspace", "branch"]) {
    if (input.execution[field] !== previous.input.execution[field]) {
      throw new Error(
        "Rearm cannot replace the held execution's owner or location.",
      );
    }
  }
  for (const field of ["host", "threadId", "endpoint"]) {
    if (input.continuation[field] !== previous.input.continuation[field]) {
      throw new Error("Rearm must keep the same native continuation.");
    }
  }
}

export const pastHold = (record) => ({
  generation: record.generation,
  observed: record.observed,
  pending: record.pending,
  accepted: record.accepted,
  phase: record.phase,
});

export function attention(record, reason, directory) {
  return Object.assign(record, {
    phase: "attention",
    attention: {
      reason,
      owner: record.input.nextObservation.owner,
      recovery: record.input.nextObservation.recovery,
      inspectCommand: holdCommand("status", directory),
      proof: record.input.execution.outstandingProof,
    },
  });
}
