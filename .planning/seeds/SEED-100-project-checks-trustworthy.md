---
id: SEED-100
status: active
planted: 2026-10-05
planted_during: Maintainer request to separate project findings from DearDough.md, prune resolved ones, and queue the two highest priorities
trigger_when: This repository's own checks give a verdict that depends on load, timing, or how the session was started
scope: unknown
---

# SEED-100: This repository's checks stay trustworthy

## Why This Matters

Executing agents and maintainers publish Open Dough work on the strength of
this repository's checks. The
[project findings](../../ProjectFindings.md#priority-assessment) show two
recurring ways those checks fail them. Dashboard specs fail CI on revisions
that change no code, which leaves trunk red for the next story and costs a
diagnosis the change did not cause. And sessions the dashboard launches
prepare their checkout without the locked dev tools while the readiness check
still passes. Both causes and their fixes live in this repository's dashboard
and its tests, not in the published skills.

## Stories

<a id="dashboard-specs-pass-unchanged-code"></a>

### Dashboard specs pass CI on a revision that changes no code

**Identity:** SEED-100#dashboard-specs-pass-unchanged-code
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/251-dashboard-specs-pass-unchanged-code/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e77531c263068eca5610c9faa453822f00bce2a78d417ace693e155527eac0b0","plan":"0791271a8355788f632eaa2da9b243b7f9d85316ffb5132641c87380368dea99"}}
```

**For / why:** The agent closing a story, and the next agent starting from
trunk, need a red `dashboard` CI job to mean the change broke something. Then
they do not have to diagnose, repair, or work around a failure their change did
not cause.

**Goal:** The dashboard suite passes on CI's runners every time it runs on a
revision that changes no code. A maintainer or agent can show that for any
revision by running the suite there repeatedly, so a spec whose verdict
depends on timing is found on demand instead of on a story's closing commit.

**Findings:**
[dashboard specs whose verdict depends on timing or machine load](../../ProjectFindings.md#dashboard-specs-whose-verdict-depends-on-timing-or-machine-load-first-priority-queued)
(DD-232).

**Scope:**

Decided in refinement: repairing only the two open specs does not reach the
goal. The Cursor spec failed again on a revision that contains its second
repair, and two more launch specs failed within a day on revisions that did
not touch them (see Evidence). The story therefore includes the repeated run
and every repair it shows to be needed.

Required:

- A repeated run of the whole dashboard suite on one chosen revision, on CI's
  runners and with the `dashboard` job's own commands and shards. It starts
  only when someone triggers it and takes the number of repetitions.
- Its result names each spec that failed and in how many repetitions, so one
  result is enough to choose what to repair.
- `agent-launch-acceptance.spec.ts:96` and
  `agent-launch-ad-hoc-cursor.spec.ts:43` are repaired at their cause, along
  with every other spec the repeated run shows failing on an unchanged
  revision.
- The story is done when 20 consecutive repetitions of the whole suite pass
  on one revision that includes all the repairs. At the failure rate observed
  since 2026-10-04 (12 of 60 CI runs), an unrepaired suite passes 20 in a row
  about once in a hundred attempts.
- Where a spec exposes a real product race, the product is repaired and the
  spec keeps its assertion.

Constraints:

- A repair does not retry a failed test, skip or quarantine a spec, or remove
  what the spec proves. The suite runs with `retries: 0`
  (`dashboard/playwright.config.ts`), and this repository treats a spec that
  passes on a rerun as failing (DD-232's standard above).
- Pushes and pull requests keep running the suite once. The repeated run adds
  nothing to their CI time.

Deferred:

- Running the repetition on a schedule or automatically after a push.
- The same verdict on a loaded developer machine. This story promises CI's
  runners; DD-224 and DD-226 stay open under the second finding.
- Other CI jobs (`lint`, `test`).

**Key examples:**

- **Unchanged revision passes every time.** Trunk includes the repairs →
  someone triggers 20 repetitions on that revision → every shard of every
  repetition passes.
- **A timing-dependent spec is found on demand.** A revision still holds a
  spec that fails about one run in five → someone triggers 20 repetitions →
  the result names that spec and the number of repetitions it failed in, and
  the other specs are reported as passing.
- **Kept launch record read while the start writes it.** The start is still
  recording its reporting origin or its outcome when
  `agent-launch-acceptance.spec.ts:96` reads the kept record → the spec runs
  in each of 20 repetitions → it passes each time, still proving the record
  is kept before publication and settles as launched.
- **Pasted Cursor instruction under CI load.** The runner is slow enough that
  the session used to show "First input acceptance uncertain" →
  `agent-launch-ad-hoc-cursor.spec.ts:43` runs in each of 20 repetitions → the
  session shows "First input accepted" each time.
- **Ordinary push is unaffected.** A push changes one Markdown file outside
  the ignored paths → CI runs → the `dashboard` job runs each shard once, as
  it does today, and no repetition starts.

**Evidence:**

- `agent-launch-acceptance.spec.ts:96` failed in CI runs 37169060163 (main,
  `8cb57afc`) and 37206540831 (`2e9d5a70`). Both revisions changed only
  planning records and DearDough.md. Its kept launch record showed an extra
  `reporting` object in one run and a missing `outcome` in the other. It is
  not repaired.
- `agent-launch-ad-hoc-cursor.spec.ts:43` failed in run 37207067477 (main,
  `0cc8895c`, a four-line doc change). It waited 5 s for "First input
  accepted" while the session showed "First input acceptance uncertain".
  `aeb9c33d` and then `48c9bbc7` repaired causes of that, and the spec failed
  the same way afterwards in run 37245324663 (`01f7d61f`, which contains
  both). It is not repaired.
- On 2026-10-05, `agent-launch-card-noted-start.spec.ts:170` failed in runs
  37264804452 and 37266830648, and `agent-launch-start-phases.spec.ts:24` in
  run 37266736909. Those revisions changed story review code and did not
  touch either spec. Whether they are timing-dependent is not yet confirmed;
  the repeated run settles it.
- On 2026-10-04, `system-settings.spec.ts:127` (`e4bfade5`),
  `story-review-action.spec.ts:31` (`6f0e303c`) and
  `agent-launch-attention.spec.ts:79` (`670e776f`) each failed CI for a read
  taken before the page or record settled, and each was repaired only after
  CI caught it.
- One CI run of the nine `dashboard` shards takes about three and a half
  minutes, and the repository is public, so repeated runs cost no money.

<a id="launched-session-development-environment"></a>

### A session the dashboard launches prepares its checkout as a developer shell would

**Identity:** SEED-100#launched-session-development-environment
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** An agent the dashboard launched to work in a project needs its
checkout preparation and project commands to behave as they would in a
developer's shell. Then a passing readiness check means the checkout's own
locked tools ran.

**Goal:** A Claude, Codex, or Cursor session the dashboard launches does not
inherit the dashboard deployment's `NODE_ENV=production` or its
`node_modules/.bin` on `PATH`. Its `npm ci` installs the locked dev
dependencies, and project commands resolve to the checkout's own tools.

**Findings:**
[checks whose result depends on where or how they are run](../../ProjectFindings.md#checks-whose-result-depends-on-where-or-how-they-are-run-second-priority-queued)
(DD-220).

**Evidence:**

- Four dashboard-launched sessions (plans 228, 233, 240, and the 2026-10-05
  findings review) had `NODE_ENV=production`. In three of them
  `npm ci` installed nothing ("audited 1 package"), and the readiness command
  passed on the deployment's `tsc` or the parent checkout's
  `node_modules`. The fourth unset it only because a recorded reminder said to.
- The deployment runs under `npm run preview:dashboard`.
  `dashboard/server/hosts/cursor/runnerProcess.ts` passes `env: process.env`,
  and the Claude, Codex, and terminal spawns under `dashboard/server` pass no
  `env`, so a launched host inherits the server's environment.
- `dashboard/server/productionDeployment.mjs` already builds with dev
  dependencies "whatever NODE_ENV the shell inherited", so the deployment
  itself does not need the launched session to keep `production`.

**Open question for refinement:** Decide whether the launch removes only the
deployment's own additions (`NODE_ENV`, its `.bin` on `PATH`) or starts from
the environment the dashboard itself was started with, and how a spec observes
the difference without a paid native run.

**Boundary:** The dashboard's session launch environment. The published
readiness guidance is out of scope; DearDough.md's ODF-087 keeps that facet.
