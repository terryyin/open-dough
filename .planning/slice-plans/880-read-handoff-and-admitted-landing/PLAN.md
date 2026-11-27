# Read the blank Start handoff and admitted landing from Dashboard records

**Identity:** SEED-423#read-handoff-and-admitted-landing-from-dashboard-records

**Source:** [Read the blank Start handoff and admitted landing from Dashboard records](../../seeds/SEED-423-shrink-the-installed-distribution.md#read-handoff-and-admitted-landing-from-dashboard-records)

## Goal and scope

A developer who starts a blank Automatically land session, or who closes a
story admitted from a borrowed checkout, gets the same handoff and the same
published session ranges. Installed scripts read the record the Dashboard
wrote for that launch. The seed's Scope and Key examples are the acceptance
source.

Excluded: the borrowed-checkout refresh rule, the live `open-dough/session-record`,
ordinary session close, later trunk publications that carry no landing
context, and any redesign or file merge of execution start.

## Current findings

Read at `c1c80a3a0`.

- `session-landing-handoff.mjs` reads
  `~/.open-dough/dashboard/agent-launches.json` and re-checks the launch
  before printing. There is no separate ready-handoff record. Settlement
  already formats the established-session block in `unattachedStart.ts`
  through `established-session.mjs`. The policy spec
  `dashboard/backend-tests/launches/agent-launch-start-session-landing-policy.spec.ts`
  expects that text for the matching session, nothing for another
  conversation, and nothing after the checkout's Git directory is replaced.
- `retainLandingComparison` in `dashboard-landing.mjs` writes the retained
  landing with `base` and `revision` and no acceptance time. `validate`
  allows only the fields the Dashboard's strict
  `landingSubmissionSchema` accepts. `adoptAdmittedSession` already reads
  that landing, then prefers `open-dough/accepted-launches/<reference>.json`,
  which `recordAcceptedIncrement` writes and nothing removes.
  `readAcceptedLaunchEvidence` is called only from that closure.
- `resolveLaunchLanding` stamps `uncertainty` with `rangeUncertainty(note, now)`
  at delivery. The shared-checkout note beside the landing context supplies
  the overlap start. The Dashboard's `receivedAt` is the time it received
  the report, later than that stamp.
- `dashboard/server/unattachedStart.ts` is 250 lines, the file-size limit.

## Current decisions

- **One handoff record.** When a blank Automatically land Start settles, the
  Dashboard writes the handoff text it already formats, findable from the
  native session's host and session id, and withdraws it when the launch is
  done or deleted. The installed script resolves that identity, confirms the
  checkout is still the named workspace, branch, and repository, and prints
  the text. It does not read `agent-launches.json` or re-check launch policy.
  The Cursor hook returns that text or an empty object. The writer is a new
  module: `unattachedStart.ts` must not grow past 250 lines.
- **One comparison record.** Claim closure adopts `{ base, candidate }` from
  the retained landing it already reads. The local `landing-current.json`
  selection keeps the acceptance time set by `resolveLaunchLanding` with the
  selected input path. The posted body stays the same, so
  `landingSubmissionSchema` stays strict and `receivedAt` is not the stamp.
  Closure applies `rangeUncertainty` to the note and that stored time.
- **No second range store.** `recordAcceptedIncrement` stops writing
  `open-dough/accepted-launches/<reference>.json`. The reader and the
  `exact` / `matchesLaunch` branch in `adoptAdmittedSession` go. The live
  session record is unchanged.
- **Held closure.** A missing retained landing, or one whose reference or
  pair is not this launch's, throws and leaves the claim checkout in place.
  Deleting the Git-directory copy is not that hold.
- Published session ranges stay the durable comparison, as
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  separates them from machine-local launch evidence. The handoff and the
  retained landing stay local.
- [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  reads landed runs from exact accepted pairs and explains uncertain
  attribution. Slice 2 keeps the exact pair and the shared-checkout mark so
  that explanation still has its source.
- Reuse the formatted handoff and the retained landing. Do not add another
  eligibility check or another copy of the range. The acceptance time is the
  gap on the landing file, not a new comparison store.
- Story Branch Mode or Trunk Mode is chosen at Take; no slice acts from trunk.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The retained landing closure reads has `base` and `revision` and no acceptance time, and that body is the strict Dashboard submission | Slice 2's read of the retained file, and the landing post | Read at `c1c80a3a0`: `retainLandingComparison` and `validate` in `dashboard-landing.mjs`; `landingSubmissionSchema` is `.strict()` and omits `receivedAt` | Closure can adopt the pair from the file. The acceptance time must stay off the posted body. |
| The shared-checkout mark is computed at delivery and stored on the accepted-launches range, whose only reader is admitted closure | Slice 2's adopted mark | Read at `c1c80a3a0`: `resolveLaunchLanding` calls `rangeUncertainty(note, new Date())`; `recordAcceptedIncrement` copies `uncertainty` onto `open-dough/accepted-launches/<reference>.json`; `readAcceptedLaunchEvidence` is called only from `adoptAdmittedSession` | Removing the file loses the mark unless the acceptance time is kept with the retained landing. |
| A blank Automatically land handoff is derived by re-reading the private launch store | Slice 1's script | Read at `c1c80a3a0`: `retainedHandoff` in `session-landing-handoff.mjs` parses `agent-launches.json`; no other ready-handoff record is written | Slice 1 writes the record at settlement and the script prints it. |

## Execution context

- Story Branch Mode. Owned workspace `/Users/terryyin/git/open-dough/.worktrees/read-the-blank-start-handoff-and-admitted-landin`,
  branch `codex/read-the-blank-start-handoff-and-admitted-landin`; starting revision
  `7f32e19b14a7fbbd59db171cf60257a88048a5bc`. Integration checkout
  `/Users/terryyin/git/open-dough`; integration target `origin/main`.
- Take and initial branch candidate `6ecdca66a761efe7046bedc9bb43a0eb1832e89b`, accepted on
  `origin/main` and the remote execution branch.
- Checkout readiness passed with `npm ci` and `npm run typecheck:dashboard`.
- The execution branch observer uses GitHub Actions `ci.yml`, coordinator
  `koharu-423-627e2271`, directory `/tmp/dough-ci-501/watch-ZwcvKe`.
- Slice 1 accepted on the remote execution branch at
  `04ab521011f711d3628c88c81e597efb578b62b8`.

## Ordered slices

### 1. Print the blank Start handoff the Dashboard saved
Type: Behavior
Status: done

Behavior: A blank Automatically land Start has settled for a native session →
the handoff script prints the established session, the taken story, the
landing context, and the reporting context. Another conversation prints
nothing. After the launch is done or deleted, the same session prints
nothing. A checkout whose Git directory was replaced prints nothing until
that directory is restored.

Proof: `dashboard/backend-tests/launches/agent-launch-start-session-landing-policy.spec.ts`,
extended so a done launch and a deleted launch withdraw the handoff. The
existing blank, other-conversation, and replaced-Git-directory cases stay.

Observed through the installed shell and Cursor hook after real Dashboard
Starts. Six focused backend cases passed, including a read
while the private launch document was unavailable, Done and deletion, the
replacement and restoration of the Git directory, and nonblank and review
Starts. The checks also verified the shared reporting header in a native
first input. Dashboard typecheck passed. Existing eligible launches gain the
ready handoff on the next successful launch-record write.

### 2. Adopt the admitted landing from the retained comparison
Type: Behavior
Status: done

Behavior: Two admitted launches have landed from one borrowed checkout, and
the later launch has replaced that checkout's session record → each claim
closure publishes that launch's own base and candidate from its retained
landing. A range accepted while the shared-checkout note said the overlap
had already started carries the shared-checkout mark; a note that starts
after acceptance does not. The accepted-launches file is not written.
Removing the retained landing holds closure: no session record is published
and the claim checkout remains.

Proof: `dashboard/backend-tests/sessions/admitted-session-shared-checkout-completion.spec.ts`.
The two-launch case keeps each published pair. The lost-evidence case
removes the retained landing instead of the Git-directory files. Add the
overlap-at-acceptance mark and the overlap-after-acceptance absence to that
spec. `recordAcceptedIncrement` still updates `open-dough/session-record`:
`node --test Distribution/tests/skills/dough-execute-plan/execution-session-evidence-delivery.test.mjs Distribution/tests/skills/dough-execute-plan/execution-session-evidence-start.test.mjs`.

Focused Dashboard checks observed both exact published pairs, both overlap
orders, live-session replacement, missing and mismatched evidence holds,
no-change closure, and CLI resume. Focused Distribution checks observed
strict wire compatibility, legacy timestamp-free input, live evidence, and
ordinary session close. Dashboard typecheck passed. With a legacy selection,
an overlap note receives the shared-checkout mark because its order relative
to acceptance is unknown.

## Proof ownership and local gate

| Promise (seed) | Slice |
| --- | --- |
| Blank Automatically land handoff text for the matching session | 1 |
| Nothing for another conversation, a non-blank or non-auto-land Start, or a done or deleted launch | 1 |
| Nothing after the Git directory is replaced; the handoff returns when it is restored | 1 |
| Each admitted launch publishes its own retained pair after a shared checkout's session record is replaced | 2 |
| Shared-checkout mark follows the acceptance time and the note | 2 |
| Closure is held when the retained landing is missing or does not match | 2 |
| No accepted-launches file; the live session record still records the running session | 2 |

Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run the focused specs above with
`npm run test:dashboard:backend -- <file>` and the named `node --test`
files, on awake macOS on AC under `caffeinate -s -i` per
[AGENTS.md](../../../AGENTS.md). A full backend or distribution run is not
a local gate: the journeys above are the changed behavior, and the landing
wire schema is unchanged. `npm run typecheck:dashboard` because slice 1 adds
a Dashboard module and slice 2 reads the retained file from closure without
a new wire field.

## Plan review

Slice-plan refinement was not needed: two Behavior slices, each with one
outcome and one proof loop, and neither splits a result that the other
needs. Concern evidence: none identified.
