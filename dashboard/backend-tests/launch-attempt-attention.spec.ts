// The overview carries only the attempts that still need attention
// (../../src/launchAttemptSelection.ts). Every page reader of known attempts
// reads the same from them as from all attempts: each story's startup
// (../../src/storyStartup.ts, its unresolved and latest attempts and how its
// latest settled attempt reconciles), which stories it lists, and each
// project's ad hoc recovery (../../src/startupRecoveries.ts). Checked over
// generated machines of several projects, stories and ad hoc sessions.
import {
  laterAttempt,
  needsReconciliation,
  storyOf,
  type AttemptObservation,
} from "../src/agentLaunch.ts";
import { attemptsNeedingAttention } from "../src/launchAttemptSelection.ts";
import type { Reconciliation } from "../src/startupReconciliation.ts";
import { storiesAsked, storyStartup } from "../src/storyStartup.ts";
import { expect, test } from "../tests/support/pageTest.ts";

// A small deterministic generator, so a failure names a repeatable machine.
function generator(seed: number) {
  let state = seed;
  return (choices: number) => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    // The high bits: a power-of-two modulus leaves the low ones periodic.
    return Math.floor(state / 65_536) % choices;
  };
}

const outcomes = [
  undefined,
  { kind: "launched", session: { host: "claude", sessionId: "s" } },
  { kind: "uncertain", reason: "unconfirmed", explanation: "Unknown." },
  { kind: "failed", reason: "start-refused", explanation: "Refused." },
  {
    kind: "failed",
    reason: "start-refused",
    explanation: "Refused.",
    sessionStartKept: true,
  },
] as const;

function machine(seed: number): AttemptObservation[] {
  const pick = generator(seed);
  const count = 1 + pick(8);
  return [...Array(count).keys()].map((index) => {
    const adHoc = pick(4) === 0;
    const outcome = outcomes[pick(outcomes.length)];
    const completion =
      pick(4) === 0
        ? {
            outcome: pick(2) === 0 ? "completed" : "unfinished",
            receivedAt: "2026-11-01T01:30:00.000Z",
          }
        : undefined;
    // Settled by its outcome, or by its session's completed report.
    const settled =
      outcome !== undefined || completion?.outcome === "completed";
    return {
      id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      request: {
        source: ["one", "two"][pick(2)],
        workflow: adHoc ? "ad-hoc" : "execution",
        host: "claude",
        ...(adHoc ? {} : { identity: `SEED-1#story-${String(pick(3))}` }),
      },
      acceptedAt: new Date(Date.UTC(2026, 10, 1, 0, pick(6))).toISOString(),
      publication: { kind: ["none", "unknown", "published"][pick(3)] },
      ...(outcome && { outcome, settledAt: "2026-11-01T01:00:00.000Z" }),
      ...(settled &&
        pick(2) === 0 && { reconciledAt: "2026-11-01T02:00:00.000Z" }),
      ...(completion && { completion }),
      owned: false,
      running: outcome === undefined && pick(2) === 0,
    } as unknown as AttemptObservation;
  });
}

// A page's judgment of a settled attempt against the published snapshot:
// reconciled once noted, otherwise still waiting for it.
const reconciled = (attempt: AttemptObservation): Reconciliation =>
  attempt.reconciledAt === undefined
    ? { kind: "waiting" }
    : { kind: "reconciled" };

const nothingAsked = { submitting: [], unacknowledged: [] };

// What the page's readers read of `known`, project by project.
function pageReading(known: readonly AttemptObservation[]) {
  return ["one", "two"].map((source) => {
    const stories = storiesAsked(
      known.map(({ request }) => request),
      source,
    );
    const startups = stories.flatMap((identity) => {
      const startup = storyStartup(
        nothingAsked,
        known,
        source,
        identity,
        reconciled,
        [],
      );
      return startup === undefined
        ? []
        : [{ identity, state: startup.state, attempt: startup.attempt?.id }];
    });
    const adHoc = known
      .filter(
        ({ request }) =>
          request.source === source && storyOf(request) === undefined,
      )
      .reduce<AttemptObservation | undefined>(laterAttempt, undefined);
    return {
      source,
      startups,
      adHocRecovery:
        adHoc !== undefined && needsReconciliation(adHoc)
          ? adHoc.id
          : undefined,
    };
  });
}

test("every page reader reads the same from the attempts still needing attention as from all", () => {
  let left = 0;
  for (let seed = 1; seed <= 5_000; seed += 1) {
    const all = machine(seed);
    const attending = attemptsNeedingAttention(all);
    const carried = all.filter((attempt) => attending.has(attempt));
    left += all.length - carried.length;
    expect(pageReading(carried), `machine ${String(seed)}`).toEqual(
      pageReading(all),
    );
  }
  // The comparison is not empty: many resolved attempts left the overview.
  expect(left).toBeGreaterThan(1_000);
});
