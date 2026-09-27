---
id: SEED-051
status: active
planted: 2026-09-27
planted_during: Maintainer review of project-owned retrospective findings
trigger_when: The test runner gains or changes a setting or environment it exports
scope: small
---

# SEED-051: Keep the test runner's settings where they belong

## Why This Matters

Maintainers and execution agents accept slices on a green local suite, and CI
runs that suite as split jobs. The runner's own settings reached checks that
start the runner themselves, so CI's split jobs failed where the local run
passed and paused agents behind a repair. Each such setting was then kept from
the runner's jobs one name at a time, so the next new setting leaks the same
way. This addresses the runner's general cause under
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
stop-and-fix principle.

## Stories

<a id="isolate-runner-settings"></a>

### Keep the test runner's own settings from reaching the checks it starts

**Identity:** SEED-051#isolate-runner-settings
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/132-isolate-runner-settings/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3f7f87612b3eee19e5537fe7c7200c413cedcfa5f74859ea84e44c73cd6abdd8","plan":"0c4379c872057cf21631fe9874b36f05335064400b9be8092e89325aeb8d017b"}}
```

**Beneficiary:** Open Dough maintainers and execution agents who rely on the
local suite and CI's split jobs to agree.

**Goal:** No `OPEN_DOUGH_TEST_*` setting given to the runner reaches the checks
it starts, so a check that starts the runner itself runs with only the settings
it chose. A setting added later is covered without further wiring, and a
nested runner behaves the same locally and in each CI share.

**Scope:**

- The runner removes every `OPEN_DOUGH_TEST_*` variable from the environment of
  each job it starts, after reading the ones it uses. This replaces the
  per-setting handling of `OPEN_DOUGH_TEST_SPLIT` and `OPEN_DOUGH_TEST_TIMES`.
- `OPEN_DOUGH_TEST_JOBS` and `OPEN_DOUGH_TEST_DIR` no longer pass through to
  jobs either. A check that starts the runner passes the settings it wants
  explicitly, as the runner's own checks already do.
- A check may still set an `OPEN_DOUGH_TEST_*` variable for what it starts
  itself, such as `OPEN_DOUGH_TEST_FIXTURE_CACHE`.
- `tests/README.md` states the one rule instead of per-setting inheritance.

**Deferred:**

- The environment every check deliberately shares — CI's Git state
  (`GIT_CONFIG_*`), `CI`, and `BASH_ENV` — keeps reaching every check. It is the
  checks' environment, not the runner's own setting.
- Product code under test inheriting that shared environment and hiding a
  product guard, as with `user.useConfigOnly` in plan 120, is not addressed
  here. That one case is repaired by `23a3a759`; the general concern is a
  proof-design question covered by the published guidance tracked as ODF-003
  and ODF-118.
- No classification registry or lint of runner settings, and no change to CI's
  jobs or to shipped product or installer behavior.

**Key examples:**

1. CI's job sets `OPEN_DOUGH_TEST_SPLIT=1/2`; a check starts the runner over its
   own substitute checks → that nested runner runs all of them. (The existing
   split check covers this; it keeps passing without the per-setting unset.)
2. A caller runs the suite with a new `OPEN_DOUGH_TEST_ANYTHING=x` → no job sees
   `OPEN_DOUGH_TEST_ANYTHING`, with no runner change naming it.
3. A caller runs the suite with `OPEN_DOUGH_TEST_JOBS=1` → the runner uses one
   slot, and a check that starts the runner without choosing a count gets the
   default count, not 1.
4. A check exports `OPEN_DOUGH_TEST_FIXTURE_CACHE` before starting its own
   children → they see it.

**Evaluation:** Reintroducing a pass-through of any `OPEN_DOUGH_TEST_*` setting
fails a local check naming it. The suite passes locally and as each CI share
(`OPEN_DOUGH_TEST_SPLIT=<i>/<n> npm test`).

**Findings:** [DD-114](../../ProjectFindings.md#dd-114--a-new-runner-setting-reached-checks-that-start-the-runner-only-cis-split-jobs-showed-it),
its split occurrence (plan 122).

**Completion:** Record the delivered response and its commit on DD-114 in
[ProjectFindings.md](../../ProjectFindings.md).
