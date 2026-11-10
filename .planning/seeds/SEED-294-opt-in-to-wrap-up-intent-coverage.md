---
id: SEED-294
status: active
planted: 2026-11-10
scope: story
---

# Opt in to Intent Coverage during story wrap-up

<a id="opt-in-to-intent-coverage-at-wrap-up"></a>

### Opt in to Intent Coverage during story wrap-up

**Identity:** SEED-294#opt-in-to-intent-coverage-at-wrap-up
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/571-opt-in-to-wrap-up-intent-coverage/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8250c074e90095544e454c1785cb10251ae7d69c015d2e22a98b0230df1d453b","plan":"cb36b0ed956d6ed120943aca2ad89001619b8693b04dff225c3bed03d8a252a2"}}
```

**Goal:** A project maintainer controls whether completed feature stories incur
an automatic Dough Intent Coverage check during wrap-up. Projects choose that
extra review effort explicitly, while developers retain the targeted check on
demand during review.

**Scope:**

- Read the project-owned `.planning/open-dough.json` at wrap-up. An optional
  boolean `intentCoverage` enables the automatic check only when `true`.
  A missing file, missing key, or `false` skips it and closure continues normally.
- Apply the same selection to direct wrap-up and Execute Plan's authorized
  continuation, for otherwise eligible planned and planless feature stories.
  Enabling the preference retains the existing single-check, scratch restoration,
  report persistence, and nonblocking closure behavior. Existing results survive
  repeat closure without another automatic check.
- Explicit developer requests during review remain available regardless of the
  preference; they do not require changing configuration.
- Read a JSON object, ignore unrelated keys, and leave configuration unchanged.
  An unreadable or malformed file, non-object JSON, or non-boolean
  `intentCoverage` cannot establish opt-in: report the selection error, skip the
  automatic check, and continue independent closure. Do not coerce values or
  create/repair the file.

The required restriction is explicit opt-in before automatic checking, because
the check consumes additional review resources. This does not restrict an
explicit review request. Deferred promises: dashboard configuration editing,
per-story preferences, a new wrap-up flag, changes to the checking technique or
done-record format, and measuring whether routine checking is worthwhile.
The separate configuration-view story owns dashboard inspection. Installation,
release, and project rollout are not part of this increment.

**Key examples:**

| Pre-condition | Trigger | Result |
| --- | --- | --- |
| Completed eligible feature story; file absent, key absent, or `intentCoverage: false` | Direct wrap-up or authorized planned continuation | No automatic check; ordinary closure completes without needing a coverage report. |
| Completed eligible feature story with no existing result; `intentCoverage: true` | Wrap-up | Request one check using the existing skill and preserve its report or concrete unavailable reason through existing completion handling. |
| Same story already has a saved completion result | Repeat wrap-up with either preference value | Preserve the result; do not launch a duplicate check. |
| Automatic checking off | Developer explicitly requests Intent Coverage during review | Run the existing targeted check without enabling automatic checking. |
| File contains unrelated settings as well as `intentCoverage: true` | Wrap-up | Select checking from this project's boolean; preserve all settings. |
| Configuration is unreadable, invalid JSON, an array/null, or has `intentCoverage: "true"` | Wrap-up | Report the file/key problem, launch no automatic check, leave configuration intact, and continue independent closure. |
| Correction or contextual work; preference on | Wrap-up | Retain existing eligibility and proceed to knowledge assimilation without an automatic feature-story check. |

**Investigation and challenge:** At `bfe9f7d87`,
[Story Wrap Up](../../src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage)
unconditionally requests checking for eligible feature stories without an
existing result. Execute Plan's
[continuation](../../src/skills/dough-execute-plan/references/finish-or-stop.md#continue-settled-planned-work-into-wrap-up)
invokes that owner rather than owning another check. The completion CLI already
accepts omitted coverage, verbatim reports, and unavailable reasons; focused
closure tests passed, and a restored scratch fault making coverage mandatory
caused those closure tests to fail.

The strongest doubt is that opting in could be mistaken for evidence that
routine checking pays for itself. The
[earlier pilot decision](SEED-258-dough-intent-coverage.md#alternatives-and-decision)
left that benefit unestablished. This story delivers control over automatic
effort, not an improvement claim about checking. Default-off is already the
selected boundary; no change to that goal is needed.

**Architecture:** Selection belongs to Story Wrap Up; the manual skill still
owns the check and the completion CLI still owns report storage. Use one
project-owned preference shared across hosts under
[ADR 0004 — Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md),
without writing defaults or changing installed managed copies. Keep the rule in
one runtime home and link human-facing configuration documentation to it under
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Author the change in `src/skills/` under
[maintainer guidance](../../AGENTS.md); release remains separate under
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md).
The existing ownership supports this design without a new architecture
decision or a North Star change. No Accepted-ADR conflict was found.
