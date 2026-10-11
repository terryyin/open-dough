# Request owner says why

**Identity:** SEED-063#request-owner-says-why
**Source:** [correction story](../../seeds/SEED-063-dashboard-owned-ci-monitoring.md#request-owner-says-why).
**Prepared:** 2026-10-11 by the execution retrospective of
SEED-063#dashboard-owned-ci-monitoring (plan 224). Planning only; not queued.

## Provenance

Plan 224 delivered shared GitHub request admission in `b5cb2f7b`, `93f43b59`,
`c6c8f9d6`, `deb540bb`, `f9ef7368`, `752f8606`, `51980e45` and `f1345331` on
`claude/monitor-ci-in-the-background-and-wake-execution`. Its story and
obligations G4 and G11 are the original contract. Findings below were read at
`3e2e6138`.

## Current findings

1. An owner that cannot be reached reads as "gh failed" although `gh` was
   never asked: `github-request-owner-link.mjs` swallows the endpoint error,
   `github-requests.mjs` answers `failed`, and `ci-github-actions.mjs` prints
   "gh failed". A root open to other users, a root owned by another user, a
   path too deep for a socket, an owner that did not start and a refused
   greeting all look alike. Observed: `DOUGH_GITHUB_REQUEST_OWNER_ROOT` set to
   a 0755 directory, then `ci-github-diagnostic.mjs workflow owner/repo` printed
   `failed: gh failed`, exit 1, with no `gh api` call.
2. `references/ci-monitor.md` step 1 tells the agent to rerun after "the stated
   wait" for any `logUnavailable`, but only a hold states a wait, as free text.
   An expired log, a log over the answer bound and a failed request have none,
   and a hold on one job's log exits 0.
3. `github-request-owned-calls.mjs` and `ci-mailbox-worker-process.mjs` each
   read the process table with separately learned rules (zombie state, the
   macOS `(name)` form, `<defunct>`, a denied `ps`).
   `github-request-owner-wire.mjs` holds endpoint knowledge (`greeted`'s socket
   ownership check, `scopeOf`, `reachable`) that the 250-line limit moved there.
4. Eight turns, zero calls during a hold, one probe after it and pending-call
   sharing are each proved in `github-requests.test.mjs`,
   `github-request-owner.test.mjs`, `ci-github-acquisition.test.mjs`,
   `dashboard/tests/shared-request-owner.spec.ts` and the older
   `authenticated-read-{turns,cooldown,backoff}` specs.
   `authenticated-read-cooldown-reach.spec.ts:73` asserts an independence only
   its per-server private owner supplies.
   `dashboard/tests/retainedAnswersJourney.ts:209` still describes a limit as
   holding back "no other read of this process".

## Preserved promises and constraints

The `request(args, signal)` contract: it rejects only with the waiter's abort
reason or a timed-out failure, and an unreachable owner stays a failed read
with no private fallback and no upstream call. No credential, path secret or
token in any message or receipt. The fixed `api` operation, privacy checks,
single claim, durable hold and child reconciliation are unchanged. CI text
stays untrusted data. Guidance follows ADR 0006 and the repository's behavior
review.

## Ordered slices

### 1. Say why a request or failed log could not be read
Type: Behavior
Status: planned

Result: a request that never reached `gh` carries a cause a reader can act on
— endpoint not private, endpoint path too long, owner did not start, owner
speaks another version — through the diagnostic entry, the observer's
unavailable reason and the dashboard's failed-read notice. The diagnostic
entry reports a held job log distinctly with its wait in seconds, exits 75 for
it, and reports every other unavailable log with its cause. `ci-monitor.md`
step 1 retries only a directed wait and otherwise classifies from failed steps
and names the missing log. Correct the stale comment in
`retainedAnswersJourney.ts`.

Proof: `github-request-owner-endpoint.test.mjs` cases for each cause through a
consumer process; `ci-github-diagnostic.test.mjs` cases for held versus
unavailable logs and the exit status; the existing diagnostics specs for the
dashboard notice; a secrecy scan of the new messages; a behavior-review walk
of step 1 for an expired log. Full `npm test` and the whole dashboard suite.

### 2. Read the process table in one place
Type: Structure
Status: planned

Internal result: one process-table reading serves the request owner's child
identity and the mailbox worker's validation, and endpoint knowledge returns
from the wire module to the endpoint module. External behavior is unchanged.
A new payload file needs room in `install.sh`'s declaration list at its
250-line limit; make it by a structural move, not by packing.

Proof: `github-request-owned-calls.test.mjs`,
`github-request-owner-replacement.test.mjs` and the mailbox worker's existing
tests pass on the shared reader; the installed-payload checks in `npm test`.

### 3. Prove each request rule once per layer that owns it
Type: Structure
Status: planned

Internal result: remove the retitled `authenticated-read-cooldown-reach` case,
the two generic sharing and hold cases in `ci-github-acquisition.test.mjs`
(with their fixed sleeps) and the two in `github-requests.test.mjs` that the
multi-process tests repeat. Consider moving `authenticated-read-backoff`'s
rule variations to the request source's tests, keeping one dashboard journey.

Proof: each surviving title still fails when its rule is broken (mutate
turns, hold and probe once each); `shared-request-owner.spec.ts`,
`github-request-owner.test.mjs`, `github-request-login.test.mjs`,
`watch-ci-execution-hold.test.mjs` and "a rate limit suspends the observer"
survive; report the acquisition file's time before and after.

## Proof ownership

| Finding | Owner |
| --- | --- |
| 1 unreachable owner reads as "gh failed" | Slice 1 |
| 2 unbounded retry instruction for an unavailable log | Slice 1 |
| 3 process identity twice; endpoint knowledge in the wire module | Slice 2 |
| 4 repeated request-rule proofs and a fixture-supplied assertion | Slice 3 |

## Current decisions

- Whether the owner protocol belongs in the endpoint directory name stays with
  SEED-063#background-ci-failure-delivery (its obligation G12).
- Whether the 250-line limit applies to `install.sh`'s declaration list and to
  guidance files is Terry's decision; this plan works within the limit.
