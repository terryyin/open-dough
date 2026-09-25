# Attach CI observation on the first Claude managed increment

## Source

**Identity:** SEED-008#attach-first-claude-publication

[Refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#attach-first-claude-publication),
[ODF-092](../../../docs/maintainer/finding-names.md#odf-092).
Second queued story; no Take or implementation is authorized by preparation.

## Goal and scope

A fresh Claude coordinator follows the published managed-delivery invocation,
observes the first accepted implementation revision, receives its CI event at
the next supported interaction, then reuses that observer on a second increment.
Explicit session input wins; otherwise use `CLAUDE_CODE_SESSION_ID` for Claude.
Missing identity or an unavailable bridge yields a useful coverage-gap reason
without misrepresenting publication acceptance.

Exclude publication replay repairs, old hidden-observer cleanup, Plan 097's
verdict acquisition, dashboards, new adapters, general background execution
and wrap-up, idle-session wake-ups and session-ownership transfer. Preserve
existing subagent isolation; the new default is for the owning coordinator.

## Decisions and evidence

Survey base: `c2af9fcdf19c0028cef4d6d0763aa429b7aa53bc` on 2026-09-25.

**Identity source resolved.** Claude Code 2.1.282 was tested in three fresh
sessions: interactive, `--print`, and native `--background`. In each, a Bash
command read `CLAUDE_CODE_SESSION_ID`; SessionStart and PostToolUse hooks
recorded the same value as JSON `session_id` and their environment variable.
All three session IDs were distinct. The launcher removed inherited
`CLAUDE_CODE_SESSION_ID`, supplied no `--session-id`, and loaded only temporary
probe hooks. No CI run or publication was made. The interactive/background
probe directory was trusted through Claude's native prompt; sessions were
closed after observation. These are identity-source results, not acceptance
of managed delivery. No older runtime support was inferred.

An equivalent minimal Bash command for repeating the observed read is:

```sh
python3 -c 'import os; print(os.environ.get("CLAUDE_CODE_SESSION_ID"))'
```

Compare its nonempty output with the same invocation's PostToolUse hook JSON
`session_id`; do not compare against a supplied fixture identity. To repeat,
launch a fresh `claude`, `claude --print`, or `claude --background` session with
an isolated PostToolUse hook capturing that field, ask it to execute the command,
and check equality. Do not dump the full environment. The original probe used
a Python file to append only these fields to temporary JSONL evidence.

Supported contract: [Claude environment variables](https://code.claude.com/docs/en/env-vars)
and [hook input fields](https://code.claude.com/docs/en/hooks#common-input-fields).
Hooks distinguish subagents with additional identity fields. Do not generalize
session ID alone into a substitute for the existing owner key.

**Existing solution (PFE).** `execution-increment-delivery.mjs` already accepts
`--session-json` and passes `session` and `env` into
`execution-increment-observation.mjs`. The latter owns existing-observer reuse,
bridge verification, mailbox start and binding. `ci-host-bridge.mjs` owns the
host identity contract; `ci-host-hook.mjs` owns coordinator/subagent isolation.
The current CLI does not read the documented variable. Change the existing
session-input boundary once and reuse these owners; no new observer launcher,
identity store, path parser or host framework is justified. Inspect shared
callers before placing resolution so verification and binding cannot disagree.
Respect the request's supplied environment in tests and programmatic callers.

**Input rule.** Preserve valid explicit session input and its metadata without
ambient overwrite. With no explicit identity, use a nonempty documented Claude
session environment value. Do not rescue malformed explicit JSON by silently
using another owner. Do not use a Claude variable to infer Cursor or Codex
identity. Explain the supported source and gap recovery where managed delivery
is taught, including `references/trunk-publication.md`; keep one instruction
home linked by related callers. No hard-coded source-project paths in guidance.

**Architecture.** Follow [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for deterministic versus native proof, and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and [maintainer guidance](../../../AGENTS.md) for runtime-facing instructions
and shared source ownership. Preserve the
[North Star](../../NORTH-STAR.md)'s separation of accepted publication, local
checkout refresh and exact-revision coverage. Existing structure is sufficient;
no new architectural decision or direction topic is needed.

## Slice 1 — Observe the first increment in its owning Claude session

**Type:** Behavior
**Status:** planned

**Behavior:** Given a fresh supported Claude coordinator with its documented
session environment, the taught managed-delivery command establishes observation
before the applicable push, registers the actual accepted revision and delivers
its event to that coordinator. A second increment reuses the observer. Explicit
input and genuine observation gaps preserve their defined behavior.

**Implementation and proof:**

1. Extend the existing managed-delivery proof at the actual CLI boundary. Run
   without `--session-json` in a controlled Claude environment; prove the current
   missing-identity gap before changing it. Existing fixtures default to an
   explicit session: remove that precondition for this case, rather than testing
   the old successful path and calling it a fix.
2. Resolve the session at the existing input boundary using the rule above.
   Use one resolved value for verify and bind, preserving metadata and host
   isolation. Update the taught invocation and actionable unavailable reason.
   Keep runtime source edits under `src/skills`; do not hand-edit installed copies.
3. Drive real managed delivery against the existing local bare-remote fixture,
   real mailbox worker and controlled CI adapter. Check attachment before push,
   exact accepted-SHA registration, failure event reaching the owning hook,
   and second-increment reuse with both registered revisions. Confirm another
   coordinator/subagent cannot consume the event. Do not inject a terminal
   mailbox event or let a fixture supply the session object being tested.
4. Cover explicit identity overriding different ambient identity, missing both
   sources, unavailable bridge, and unaffected non-Claude behavior. Retain
   publication acceptance on observation gaps and local-only non-publication.
   Reuse existing checks wherever their preconditions still match.
5. Walk the revised guidance in fresh native Claude interactive and background
   coordinator sessions in a disposable installed-project fixture. Use its local
   bare remote and controlled CI producer; make no hosted publication. Follow
   the taught command without manual probe/start/register repair or injected
   session JSON. Observe the accepted revision's event in each coordinator's
   transcript, then second-increment reuse. Record runtime, candidate and exact
   commands with decisive observations; bound waits and clean owned workers.
6. Apply the execution workflow's post-change refactoring and required checks.
   At wrap-up, record the actual response and implementation commit against
   ODF-092, and its first containing release only when known. Publication alone
   does not resolve the finding.

**Proof ownership (all in Slice 1):**

| Promise / preserved constraint | Proof entry point and decisive observation |
| --- | --- |
| Automatic first-session identity | Extend `execution-increment-managed-delivery.test.mjs` at CLI boundary; no explicit session fixture, yet first delivery attached |
| Accepted revision and owner receive event | Same journey with worker/controlled CI and `ci-host-hook.mjs`; exact SHA in coverage and owner context, no foreign consumption |
| Second increment reuses observer | Same journey; same mailbox/worker identity and two exact registered revisions |
| Explicit input and host separation | Focused input cases plus existing Cursor managed-delivery and Codex bridge checks; ambient Claude identity cannot replace explicit owner or leak into other hosts |
| Useful gaps preserve publication truth | `execution-increment-managed-delivery-gaps.test.mjs`; unset environment deliberately for missing-both case, verify accepted/unobserved versus local-only |
| Fresh foreground/background invocation works | Native journeys in step 5, actual coordinator transcript receives event; identity-only probes reused solely for the prerequisite |

Focused deterministic starting command (repository root):

```sh
node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-gaps.test.mjs src/skills/dough-execute-plan/scripts/ci-host-hook-process.test.mjs
```

Add the focused input test selected during implementation to that run. Keep
native acceptance separate from a green deterministic suite. Reuse unaffected
installation and other-host evidence under ADR 0005; if a shared bridge change
invalidates it, revalidate the affected requirement. Missing native proof remains
unfinished acceptance, not an attached-receipt substitute.

**Sizing and safe stop:** One small identity-resolution correction, one coherent
first-delivery/reuse journey and its native host acceptance. No numeric target
or hard limit is supplied. Splitting out identity parsing, documentation or hook
proof would leave the same user outcome incomplete; no Structure slice is
warranted. Stop once all mapped outcomes are proved. If implementation exposes
an independent replay, ownership-transfer or general background-lifecycle defect,
preserve evidence and reassess scope before extending this slice.

## Preparation review and learnings

- All promised outcomes have one proof owner. The plan preserves existing
  observation and publication responsibilities and has no speculative structure.
- Boundary review: retain one slice. No additional refinement or split is needed;
  no blocking scope or proof-design concern was found in this review.
- Runtime identity is verified on 2.1.282; future delivery behavior has not been
  implemented or accepted. Story state records preparation readiness only.
