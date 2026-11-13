---
id: SEED-344
status: active
planted: 2026-11-13
planted_during: SEED-331#read-ci-history-at-a-glance closure, whose CI repair 4ffa3df4f was another one-off switch to the settling helper
trigger_when: A dashboard journey times out waiting for a revision check after page time passed while a detail read was in flight
scope: story
---

# SEED-344: Browser journeys settle detail reads before passing page time

## Why this matters

`passTimeUntilChecked` in `dashboard/tests/autoRefreshJourney.ts` advances
paused page time until the next revision check, even while a detail read for
a new revision is still inside its wait bound. Passing that bound arms detail
recovery, which suspends revision checks, so no check comes within the minute
and the journey fails. Whether it fails depends on how quickly the read is
answered, so it surfaces as a flake under load or in a single CI shard.

`passTimeUntilCheckedAfterSettled` waits for outstanding reads first. Each
failure so far has been repaired by switching one call site: 11 commits have
moved spec calls to it, most recently `4ffa3df4f` for
`direction-disclosure.spec.ts` during SEED-331's closure (CI run
43394751685, dashboard shard 6/13). On `f258e463b`, 79 plain calls in 36
test files remain, against 31 settled calls. Terry chose to correct the
default rather than keep repairing call sites one at a time.

## Stories

<a id="settle-reads-before-passing-page-time"></a>

### 1. Settle detail reads by default before passing page time to a check

**Identity:** SEED-344#settle-reads-before-passing-page-time
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/615-settle-reads-before-passing-page-time/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"22aa657859490dc0e27d0da3c2fc12f47e6fbc2e7acc745ed424b42403d2290e","plan":"85d46eb556d4c833b91833fe380f8ab8b7e365a01fa2754425e1b22395fdd0c5"}}
```

#### Goal

Maintainers stop getting revision-check timeouts caused by page time passing
over an in-flight detail read. The ordinary "pass time until the next check"
step settles outstanding page reads first. A journey that deliberately keeps a
read held asks for that through a variant whose name says so.

#### Scope

- The default step waits for outstanding page reads before passing page time,
  and its comment states the reason. The separate `AfterSettled` name goes
  away once the default does the same thing.
- Each caller that needs page time to pass while a read stays held uses the
  explicitly named variant. Its journey shows why the read is held. Callers
  that pass with the default need no other change.
- All existing journeys keep their observations and assertions and pass with
  the default case timeout, locally and in hosted CI. Follow
  [the failing/flaky-test policy](../../AGENTS.md#failing-and-flaky-tests)
  and the test-automation rules in [AGENTS.md](../../AGENTS.md#test-automation).
- Other active executions (SEED-324, SEED-332, SEED-334) edit dashboard specs.
  Reconcile with their call sites when merging. Do not rewrite their
  uncommitted work.
- Excluded: product auto-refresh behavior, raising or overriding timeouts,
  `test.slow()`, and waits on wall-clock time.

#### Key examples

1. Direction-disclosure shape: a new revision's detail read is still
   unanswered when the journey asks for the next check. With the default
   step, outstanding reads settle first, the check arrives on its steady
   pace, and detail recovery is never armed.
2. A journey deliberately holds a detail (for example detail-recovery or
   steady-refresh observing membership while a record stays unread) and needs
   page time to pass without waiting for that hold. It calls the named
   held-read variant; the held observation still works and the journey's
   assertions stay the same.
3. Call sites that already used `passTimeUntilCheckedAfterSettled` become
   ordinary callers of the default step; the `AfterSettled` name is gone and
   no behavior change appears in those journeys.
