---
id: SEED-011
status: active
planted: 2026-09-15
planted_during: Maintainer capture of Pygardon's custom CI watcher request
trigger_when: Execute-plan needs feedback from a project's own CI server
scope: medium
---

# SEED-011: Customize CI observation for a project's own server

## Goal

A developer using execute-plan with a project-owned CI server receives accurate,
actionable asynchronous CI feedback and repair support without spending AI
tokens on routine observation. Pygardon, which runs its own Docker CI server,
is the intended first adopter after release. This advances the backlog's direction of coherent
story execution and delivery.

## Stories

<a id="customize-project-ci-watcher"></a>

### 1. Customize execute-plan's CI watcher for a project's own CI server

**Status:** Execution started on 2026-09-15; configuration location resolved as
`.planning/open-dough.json`; Slice 1 delivered.

**Slice plan:** [Custom CI watcher](../quick/034-customize-project-ci-watcher/PLAN.md).

**Goal:** Release public Open Dough support for a project-owned CI adapter,
with a usable standalone manual and trustworthy asynchronous failure evidence.
Routine observation uses no AI. The maintainer will then take the release to
Pygardon, implement its adapter, and evaluate the real repair loop there.

## Value and scope challenge

This increment gives a project the released mechanism and instructions needed
to connect its CI to existing feedback and repair. Verify Open Dough's command,
coverage, evidence, and notification boundaries using controlled adapters.
A real Pygardon failure-to-repair loop is valuable subsequent learning, but is
explicitly outside this story's acceptance and release prerequisites. Do not
claim that controlled proof establishes Pygardon's actual integration.

The strongest simpler alternative is a project script the developer runs
manually and pastes into the agent. It can provide evidence, but leaves the
developer responsible for noticing failures and reconnecting them to ongoing
execution. The selected story earns its scope by doing that asynchronously
through the existing workflow. Do not build a replacement notification system.

Existing observation is already script-driven and supports failure, incomplete,
and lost-coverage events. Preserve those capabilities while replacing the
GitHub-specific assumptions needed for one project integration. Token-free
polling is an existing property to retain, not a separate new subsystem.

## Scope

### Required delivery

- One optional customization entry in the existing project configuration.
  Empty or absent selects GitHub Actions. A configured project command/adapter
  supplies its CI-specific interpretation. Ordinary installation and updates
  deliver the support and preserve the project's choice.
- The smallest adapter contract needed to discover and follow one selected CI
  check, identify each run/attempt and exact checked SHA, map its state to a
  usable outcome, and obtain failure evidence. Pygardon owns server-specific
  reading and mapping. Do not require it to mimic GitHub's job hierarchy or
  numbered attempts merely because GitHub uses them.
- Reuse the observer and asynchronous host delivery through ordinary and repair
  pushes. Scripted observation and result interpretation make no AI calls;
  pending/success observations do not wake an agent. Failures or actionable
  observation/coverage problems reach the agent at the existing safe boundary.
  Repeated polling of the same evidence must not repeatedly interrupt repair;
  a distinct failed attempt remains observable.
- Retrieve and process failure logs locally before agent delivery. A simple
  project-specific filter and a finite enforced excerpt limit suffice. Supply
  the attempt identity, checked SHA, and relevant bounded evidence; indicate
  truncation or unavailable evidence so partial diagnostics remain honest.
- Supply a short standalone adapter manual in the released, installable
  documentation. Cover configuration, the command/result contract, outcome and
  coverage interpretation, and a minimal example of local evidence filtering.
  Keep it out of skill references and ordinary skill context. Its delivery is
  part of this feature, not an unrelated documentation follow-up.
- Publish the tested support and manual in a new Open Dough release. End this
  story at released availability; the maintainer owns subsequent Pygardon
  adoption and brings any findings back as new Open Dough input.

### Correctness constraints

These are necessary for trustworthy feedback, not optional later enhancements:

- Never use another SHA's result as coverage. An unchecked working-branch SHA
  remains **uncovered**, even if `main` is green. A matching queued/running
  attempt is pending, not a success. Lack of a discovered run is not itself a
  code failure: allow the existing bounded observation policy to account for
  discovery delay, and report absent coverage without starting a code repair.
- Distinguish CI failure from inability to observe CI. An unreachable endpoint,
  invalid adapter result, or unknown status cannot become success. Report the
  observation limitation through the existing bounded error/coverage path;
  do not silently fall back to GitHub after an explicitly selected adapter fails.
- Routine observation consumes no AI tokens. Full logs stay outside agent
  context; local processing must precede bounded diagnostic delivery.
- Preserve execution ownership, asynchronous repair and notification behavior,
  and the GitHub Actions default. The adapter changes evidence acquisition;
  it does not authorize checkout changes or CI dispatch.

### Deferred promises

No delivery commitment to additional CI providers, remote deployments,
multiple-check aggregation, webhooks, a plugin registry, a configuration UI,
new authentication management, historical analytics, or a new notification
transport. Naturally supported cases need not be rejected.

Do not build CI triggering/retrying, branch-policy management, deployment
observation, or Pygardon's Docker CI server in this story. Pygardon must arrange
checks of the relevant SHA and provide readable failure evidence. Its missing
log endpoint belongs to subsequent Pygardon adoption and does not block this
Open Dough release. No automatic merging to `main` to obtain a green result.

Defer generic log parsing, semantic summarization, exhaustive root-cause
classification, log storage/indexing, and speculative resilience machinery.
Start with bounded useful excerpts and existing observation bounds; learn from
actual insufficiencies. Reuse existing host bridges and their applicable checks
rather than launch a broader host-validation project.

## Key examples and acceptance

1. **Default:** With empty/absent customization, execution uses GitHub Actions
   as before. With a controlled custom command configured, it uses that source without
   requiring a GitHub Actions workflow for the custom check. Repeated pending
   observations and a success make no AI calls.
2. **Failure handoff:** A controlled adapter reports a failing attempt. Its exact
   SHA, identity, and bounded locally selected evidence reach the existing
   repair entry point through the normal notification path. A later simulated
   repair push and matching successful attempt update coverage without a success
   wakeup. Preserve existing repair behavior; no real Pygardon repair is required.
3. **Coverage gap:** The working branch pushes SHA A while the controlled source reports a
   green `main` at SHA B. A remains uncovered, with no invented failure or
   success. A later actual check of A can establish its result. If the server
   cannot be read at all, report observation unavailable instead.
4. **Useful bounded evidence:** A large failing log is processed locally and
   yields a bounded excerpt containing the known failure in the fixture.
   Unavailable logs preserve the known failure and identify the diagnostic gap. A truncation-only excerpt that omits the
   relevant failure does not demonstrate useful feedback.
5. **Usable customization:** The released installation includes the standalone
   manual and support. A project can supply the adapter using that manual;
   ordinary updates preserve configuration. Skills do not link or load the
   manual. Apply existing installation/update checks to these changed promises.

## Dependencies and remaining uncertainty

Pygardon's supplied request says `/api/ci` returns attempt IDs, SHAs, statuses,
and timestamps; detailed log access is planned. Treat this as motivating
context, not a required live input. Open Dough can define and test the small
contract without Pygardon access or a captured response. The maintainer owns
its adapter, server/log readiness, and real failure-to-repair trial after release.
Any gaps found there return as new input, not unfinished scope of this story.

The slice plan selects a small command-array setting, bounded diagnostics, and
an installed manual location. On 2026-09-15, the maintainer selected the
established `.planning/open-dough.json` location and directed ADR 0001 and ADR
0004 to align with it. Define protocol details against the documented needs and
controlled adapter examples; no live Pygardon response or broader abstraction
is required.

**Effort hypothesis:** Moderate, with low confidence until the custom-source
assumptions are checked against controlled command/process examples; preserving accurate coverage and host delivery still requires care.

**Safe stopping point:** The new public release supplies tested customization
support and the standalone manual, preserving GitHub Actions. Pygardon adoption
and real-use learning happen afterward under the maintainer's ownership.

## Breadcrumbs

- Maintainer request and supplied Pygardon request, 2026-09-15: prioritize this
  story first, keep routine observation free of AI calls, retain exact-revision
  coverage, and ship an optional manual outside skill references.
- Existing execution guidance:
  [dough-execute-plan](../../src/skills/dough-execute-plan/SKILL.md).
- Refinement direction, 2026-09-15: challenge value and narrow delivery around
  working feedback before extending details.
- Subsequent explicit scope decision: end at a new public Open Dough release;
  move the real Pygardon adapter and failure-to-repair trial out of this story.
  The maintainer will carry subsequent findings back to Open Dough.
- Scope evidence: existing [CI monitor](../../src/skills/dough-execute-plan/references/ci-monitor.md)
  already uses non-model observation and excludes dispatch/deployment;
  [runtime setup](../../src/skills/dough-execute-plan/references/runtime-setup.md)
  supplies bounded observation and one-workflow scope. Custom-source use must
  remove the GitHub-only setup assumptions where necessary.
- This seed is non-executable planning input, not verified integration evidence.
