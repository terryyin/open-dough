// The machine's sessions answer (`./machineSessionObservation.ts`) kept as
// fragments, each with the digest of its serialization: every session entry
// on its own, and the rest of the answer. An entry whose kept record is the
// same document the machine store still holds (`./machineJsonStore.ts`) and
// whose observed facts -- shown workspace, workspace state, session state --
// read the same keeps the serialization and digest it had, so an
// observation serializes only the entries that moved. The answer's revision
// is the digest of its fragments' digests: the same answer always has the
// same revision, and a changed one another. The whole answer is put together
// from its fragments only when a viewer needs it in full, once per revision.

import { createHash } from "node:crypto";
import type { LaunchWithState } from "../src/agentLaunch.ts";
import { sessionKey } from "../src/sessionReference.ts";

const digestOf = (text: string) =>
  createHash("sha256").update(text).digest("hex");

// What an entry adds to its kept record when observed.
const observedKeys: ReadonlySet<string> = new Set([
  "shownWorkspace",
  "workspaceState",
  "sessionState",
] satisfies (keyof LaunchWithState)[]);

const factsOf = (entry: LaunchWithState) =>
  JSON.stringify(
    [...observedKeys].map((key) => (entry as Record<string, unknown>)[key]),
  );

type HeldEntry = {
  readonly entry: LaunchWithState;
  readonly facts: string;
  readonly json: string;
  readonly digest: string;
};

// Whether two entries hold the same kept record's values, key for key in the
// same order, apart from their observed facts.
function sameKept(a: LaunchWithState, b: LaunchWithState): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key, index) => {
    if (bKeys[index] !== key) return false;
    return (
      observedKeys.has(key) ||
      (a as Record<string, unknown>)[key] ===
        (b as Record<string, unknown>)[key]
    );
  });
}

function serializedEntry(entry: LaunchWithState, facts: string): HeldEntry {
  const json = JSON.stringify(entry);
  return { entry, facts, json, digest: digestOf(json) };
}

export type AnswerFragments = {
  readonly revision: string;
  // The whole answer, led by its revision, put together on first need.
  readonly serialized: () => string;
};

// The fragments this server last serialized, reused by its next observation.
export class SessionsAnswerFragments {
  private entries = new Map<string, HeldEntry>();

  // The answer of `records` followed by `rest`'s fields, as one object would
  // serialize with its records first.
  answer(
    records: readonly LaunchWithState[],
    rest: Readonly<Record<string, unknown>>,
  ): AnswerFragments {
    const previous = this.entries;
    const entries = new Map<string, HeldEntry>();
    const held = records.map((entry) => {
      const key = sessionKey(entry.session);
      const facts = factsOf(entry);
      const before = previous.get(key);
      const kept =
        before !== undefined &&
        before.facts === facts &&
        sameKept(before.entry, entry)
          ? before
          : serializedEntry(entry, facts);
      entries.set(key, kept);
      return kept;
    });
    this.entries = entries;
    const recordsDigest = digestOf(held.map(({ digest }) => digest).join(""));
    const restJson = JSON.stringify(rest);
    const revision = digestOf(`${recordsDigest}${digestOf(restJson)}`);
    let whole: string | undefined;
    return {
      revision,
      serialized: () => {
        whole ??= `{"revision":${JSON.stringify(revision)},"records":[${held.map(({ json }) => json).join(",")}]${restJson === "{}" ? "}" : `,${restJson.slice(1)}`}`;
        return whole;
      },
    };
  }
}
