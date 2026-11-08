// The machine's sessions answers (`./machineSessionObservation.ts`) kept as
// fragments, each with the digest of its serialization: every session entry
// and every attempt on its own, and the rest of each answer. The regular
// answer holds each session's listing (`../src/sessionListing.ts`), each
// with its own digest beside its full one, and the attempts that still need
// attention. The history holds the retained done entries in full, in the same
// order, and every other attempt. It has its own revision, which the regular
// answer's rest names. An entry whose
// kept record is the same document the machine store still holds
// (`./machineJsonStore.ts`) and whose observed facts -- shown workspace,
// workspace state, session state -- read the same keeps the serialization
// and digest it had, so an observation serializes only the entries that
// moved; every attempt is serialized again by each observation. An answer's revision
// is the digest of its fragments' digests: the same answer always has the
// same revision, and a changed one another. A whole answer is put together
// from its fragments only when a viewer needs it in full, once per revision.

import { createHash } from "node:crypto";
import type {
  AttemptObservation,
  LaunchWithState,
} from "../src/agentLaunch.ts";
import { sessionListing } from "../src/sessionListing.ts";
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

// A serialization and its digest.
type Serialized = { readonly json: string; readonly digest: string };

const serialized = (value: unknown): Serialized => {
  const json = JSON.stringify(value);
  return { json, digest: digestOf(json) };
};

// An entry in full, as the history gives it, and as the regular answer lists
// it.
type HeldEntry = {
  readonly entry: LaunchWithState;
  readonly facts: string;
  readonly full: Serialized;
  readonly listed: Serialized;
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
  const full = serialized(entry);
  const listing = sessionListing(entry);
  const listed = listing === entry ? full : serialized(listing);
  return { entry, facts, full, listed };
}

export type AnswerFragments = {
  readonly revision: string;
  // The whole answer, led by its revision, put together on first need.
  readonly serialized: () => string;
};

// An attempt and the digest of its serialization.
type HeldAttempt = {
  readonly attempt: AttemptObservation;
  readonly digest: string;
};

// The rest of an answer: its attempts, and its other fields in order.
type Rest = Readonly<Record<string, unknown>> & {
  readonly attempts: readonly AttemptObservation[];
};

// The answer of `entries` followed by `fields`, as one object would
// serialize with its records first, whose attempts are `attempts`, in place
// of any attempts `fields` name.
function assembled(
  entries: readonly Serialized[],
  attempts: readonly HeldAttempt[],
  fields: Readonly<Record<string, unknown>>,
): AnswerFragments {
  const rest = { ...fields, attempts: attempts.map(({ attempt }) => attempt) };
  const digests = (fragments: readonly { readonly digest: string }[]) =>
    digestOf(fragments.map(({ digest }) => digest).join(""));
  // The other fields, which the serialization leaves out of an undefined key.
  const others = JSON.stringify({ ...rest, attempts: undefined });
  const revision = digestOf(
    `${digests(entries)}${digests(attempts)}${digestOf(others)}`,
  );
  let whole: string | undefined;
  return {
    revision,
    serialized: () => {
      whole ??= `{"revision":${JSON.stringify(revision)},"records":[${entries.map(({ json }) => json).join(",")}],${JSON.stringify(rest).slice(1)}`;
      return whole;
    },
  };
}

type SessionsAnswers = {
  readonly overview: AnswerFragments;
  readonly history: AnswerFragments;
};

// The fragments this server last serialized, reused by its next observation.
export class SessionsAnswerFragments {
  private entries = new Map<string, HeldEntry>();

  // The regular answer of `records` as listings,
  // followed by `rest`'s fields and the history's revision as
  // `historyRevision`, carrying only the attempts of `rest` that are
  // `attending`; and the history of the retained done `records` in full and
  // the other attempts of `rest`.
  answers(
    records: readonly LaunchWithState[],
    rest: Rest,
    attending: ReadonlySet<AttemptObservation>,
  ): SessionsAnswers {
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
    const attempts = rest.attempts.map((attempt) => ({
      attempt,
      digest: digestOf(JSON.stringify(attempt)),
    }));
    const overviewAttempts = attempts.filter(({ attempt }) =>
      attending.has(attempt),
    );
    const historyAttempts = attempts.filter(
      ({ attempt }) => !attending.has(attempt),
    );
    const history = assembled(
      held
        .filter(({ entry }) => entry.doneAt !== undefined)
        .map(({ full }) => full),
      historyAttempts,
      {},
    );
    return {
      overview: assembled(
        held.map(({ listed }) => listed),
        overviewAttempts,
        { ...rest, historyRevision: history.revision },
      ),
      history,
    };
  }
}
