# Execute-plan extraction review

Proposed extraction, 2026-09-09. This is maintainer material, not runtime guidance.
The user explicitly requested both skills and their support files, overriding the
extract-guidance skill's usual one-source limit. The source files are
`.agents/skills/execute-plan/SKILL.md` and
`.agents/skills/post-change-refactor/SKILL.md` in the supplied Doughnut checkout.
The original name is `post-change-refactor`, not `post-change-refactoring`.

## Analysis before extraction

Read both full skills, all eight reference files, all 26 CI script/test files,
and the directly relevant navigation, rule pointers, hook registrations, runner,
whitespace helper, and three referenced project skills. Record source SHA-256
values before writing extracted files. The source planning and decomposition
references match Open Dough's current sources byte for byte, so reuse them.

The reusable unit is the execution coordinator plus its independent refactor
pass, asynchronous observer, and minimal native notification adapters. The
source observer is Node standard-library code with no npm dependency. Its
production modules import only sibling modules and Node built-ins. Tests add
fake `gh` executables, process fixtures, hook payloads, and two root-level hook
configuration dependencies. Preserve all tests; relocate configuration to assets.

The source hook registrations contain notification hooks and an unrelated Cursor
trailing-newline editor hook. Only the notification entries belong to this
extraction. No slice-timing hook appears in the inspected dependency chain.
Elapsed slice/refactor time is an instruction contract; polling, request,
shutdown, and hook timeouts are runtime lifecycle bounds. Do not extract the
application's end-to-end timing logs or unrelated tooling.

## Dependency disposition

| Source dependency | Extracted home or client contract |
| --- | --- |
| Execute skill and seven references | `SKILL.md`, `references/`; CI setup added at `references/runtime-setup.md` |
| Post-change skill and refactor checks | `../dough-post-change-refactor/` |
| CI observer, mailbox persistence/worker/stop, host hooks, stream parser | `scripts/` runtime modules listed below |
| Original tests and fake-process fixtures | All retained beside the scripts; deployment/configuration tests added |
| `.cursor/hooks.json` CI entries | `assets/cursor-hooks.json`, merge into client settings only at authorized delivery |
| `.claude/settings.json` CI entries | `assets/claude-hooks.json`, uses Claude's `.claude/skills` delivery root |
| Planning/proof/lifecycle rule pointer | `../dough-story-refinement/references/planning.md` |
| Decomposition/sizing/escalation rule pointer | `../dough-story-decomposition/references/problem-decomposition.md` |
| Slice refinement | `../dough-slice-plan-refinement/SKILL.md` and its existing transitive guidance |
| GSD coexistence rule | Client workflow precedence; explicit execution keeps coordinator ownership and plan state. No new always-applied rule |
| Agent map and stack test rules | Client navigation, subsystem map, focused commands, domain language |
| `scripts/run.sh` / Nix / Cloud VM | Client runtime wrapper; not a portable dependency on a Nix flake |
| `format-changed` skill | Not invoked by source routine wrap-up; client selective formatter command owns component selection |
| Formatting/lint implementations and Git hook | Client preparation/check-only staged-lint contract; do not copy application package maps or alter its hooks |
| `generate-api-client` skill | Conditional client generator, triggers, consumer checks; preserve generated-output prohibition |
| `scripts/check_diff_whitespace.sh` | Client whitespace command and generated-artifact exclusions |
| `bug-fixing` skill | Required minimal fail-for-right-reason → smallest fix → focused green behavior retained in CI repair reference; no sibling skill extraction |
| `unit-testing.mdc` | Stable-boundary/data-over-internal-mocks guidance retained; application-specific fixtures and ADR policy omitted |

The application scripts are intentionally client contracts, not missing runtime
imports. Copying their implementations would import Doughnut's package topology,
generators, Nix environment, and application services. The extracted runtime
has no executable reference to those scripts.

## Runtime files for later promotion

Preserve each skill's relative directory layout. Execute-plan runtime is
`SKILL.md`, every file under `references/`, both `assets/*.json`, and:

- `scripts/ci-failures.mjs`
- `scripts/ci-host-hook.mjs`
- `scripts/ci-mailbox-store.mjs`
- `scripts/ci-mailbox-worker-process.mjs`
- `scripts/ci-mailbox.mjs`
- `scripts/ci-observer-stream.mjs`
- `scripts/ci-runs.mjs`
- `scripts/watch-ci-execution.mjs`
- `scripts/watch-ci.mjs`

Post-change-refactor runtime is its `SKILL.md` and
`references/refactor-checks.md`. Include the existing shared planning/refinement
skills and their transitive references when delivering execute-plan.

All `scripts/*.test.mjs` and fixture modules are retained, relocatable developer
support. If shipping client-side self-tests, include that entire test/fixture
set and the hook assets; `ci-observer-stream-fixture.mjs` itself imports a test
fixture. Runtime modules do not import test modules. Keep `RECOGNITION.md`,
`EXTRACTION.md`, and `SOURCE-CHECKSUMS.json` out of the client payload.

Promotion must update both `install.sh` and
`src/install/open-dough-release-version.sh` declarations and aligned payload
fixtures under ADR 0003. No declarations, release metadata, active host settings,
or client copies are changed by this extraction.

Hook merging, preservation of unrelated settings, update/coexistence behavior,
and fresh native delivery in all three hosts need the acceptance evidence
required by ADR 0005 before release. The copied source `alwaysApply` coexistence
rule is not delivered: invoking this skill preserves its execution overlay;
automatically intercepting another workflow requires separately reviewed client
integration. Do not advertise this as a replacement for automatic rule activation.

## Generalization and limits

- Accept a client-selected branch and environment-selected workflow filename/ID
  and exact display name. Verify defaults (`ci.yml`, `CI`) before use.
- Rename the private mailbox namespace to `DOUGH_CI_MAILBOX_ROOT` and
  `/tmp/dough-ci-$UID`; no migration of existing Doughnut observers is attempted.
- Resolve runtime paths for `.agents/skills` and `.claude/skills`; retain the
  four-level checkout identity convention. Use canonical paths to avoid host
  symlink aliases when invoking Node entrypoints.
- Preserve one observer per execution, no model polling, owner isolation,
  acknowledge-after-output, failure retention, exact-handle stop, safe
  pause/stash/repair/resume, and pending-CI-as-unobserved reporting.
- Keep source discovery limits honest: 100 startup runs, 20 later runs, plus
  individually retained unfinished runs. No claim of exhaustive history.
- Codex has a concrete yielded-cell bridge. The source's unimplemented fallback
  suggestion about native async hooks is not claimed as a delivered adapter.
- Slice budgets, file-size limits, domain language, subsystem boundaries, plan
  location, generation, formatting, and test commands come from the client.

## Representative behavior review

Manual instruction walkthroughs, not native agent acceptance:

1. Execute a supplied plan at `delivery/change-plan.md` with target 4 minutes,
   hard limit 9 minutes, a focused stable-boundary command, client formatter,
   check-only commit hook, authorized push branch, and explicit subsystem map.
   Invocation accepts the bounded plan, reads shared proof/sizing rules, delegates
   only implementation, inspects proof, independently refactors, formats once,
   updates the same plan, commits owned work and pushes. CI stays asynchronous.
   A seed-only request is rejected. Missing slice budget stops before delegation.
2. A removal slice deletes a field named by a later outcome. The destructive
   check compares all later slices, including completed ones. An ambiguous
   value/design conflict stops before implementation; it is not silently rewritten.
3. A refactor of the current uncommitted parser change reveals duplicate parse
   policy in an untouched caller in the same subsystem. Scope includes both
   representations; rerun only invalidated supplied proof, return elapsed time
   and `REFACTOR COMPLETE`, and leave committing to the caller. A no-edit pass
   skips tests. Empty scope completes without requiring stack configuration.
4. The same candidate requires coordinated production edits in two named client
   subsystems without concept-specific authorization. Return concept, files,
   why a partial fix is misleading, risk/proof and human choices with
   `REFACTOR JIDOKA STOP`; make no cross-boundary edit and do not commit.

Invocation context, required context, and useful outcomes are covered in these
walkthroughs.

## Automated validation

Run from the Open Dough root with Node 20+:

```sh
node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/*.test.mjs
```

The inherited suite uses substitute GitHub processes; it never requires a token,
starts a real CI workflow, or pushes Git. Lifecycle tests exercise local
subprocesses and recorded host payloads, not the actual native host UI.
Deployment tests copy runtime modules to both client skill roots in canonical
paths containing spaces, execute the actual hook fragments, and require a
readiness event with matching checkout identity. Custom-workflow coverage checks
a non-main branch and rejects unrelated branches and deployment runs.

Validation results and source-integrity confirmation are recorded below after
running checks. Preserve failures rather than interpreting a retry as a repair.

### Results, 2026-09-09

- Node v24.5.0, macOS: the serial command above passed **63/63 tests** in
  16.5 seconds, outside the filesystem sandbox. No network or AI credentials
  were required by the suite.
- Initial sandbox execution failed filesystem-watch cases with `EMFILE`.
  A separate minimal single-directory `fs.watch` probe reproduced the error
  even with an open-file limit of 1,048,575. Treat this as an execution-environment
  limitation, not evidence that watcher behavior passed inside the sandbox.
- The first unrestricted concurrent run passed 59/60 inherited tests; the
  Codex natural-completion fixture timed out awaiting `first-failure-recorded`.
  Its isolated run passed, and the complete serial run passed. The cause of that
  concurrent timeout remains undiagnosed; no runtime repair is claimed for it.
  Retain serial execution as the reproducible check here; concurrent stability
  and native host behavior are not established by a passing retry.
- New checks passed for custom workflow/branch filtering and actual hook
  fragment execution after runtime relocation into both platform roots with
  spaces in the checkout path. Fixture paths use canonical filesystem paths;
  arbitrary symlink entrypoint invocation is not claimed.
- All relative Markdown targets and local JS imports in the extracted trees
  resolve. Both frontmatter names match their directory names.
- Recomputed SHA-256 hashes match all **50 inspected source files** in
  `SOURCE-CHECKSUMS.json`; the extraction did not change the source files.

## Agent-facing revision, 2026-09-09

Applied [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and the maintainer's explicit instruction to use the then-Proposed ADR 0001
terminology (a story lives in its seed; an executable plan contains slices).
That draft was not Accepted; recovering it later is a Git history concern.
The skills remain Proposed under ADR 0003, with the delivery evidence
requirements of ADR 0005 unchanged.

The entrypoints now identify the required context, execution order, and return
conditions. Detailed decisions have these authoritative homes:

| Decision | Runtime home |
| --- | --- |
| Story home, plan lifecycle, proof ownership | Existing shared planning reference |
| Slice definition, sizing, learning escalation | Existing shared decomposition reference |
| Human decision stops, failure diagnosis, oversized-slice recovery, premature implementation commits | `references/execution-decisions.md` |
| Implementation assignment and proof handoff | `references/delegation.md` |
| Proof acceptance and coordinator delivery | `references/wrap-up.md` |
| Refactor scope, subsystem authorization, testing, and return markers | `../dough-post-change-refactor/SKILL.md` |
| Refactor candidate checks | `../dough-post-change-refactor/references/refactor-checks.md` |
| Observer ownership, failure repair, and writer pause/resume | `references/ci-monitor.md` |
| CI parameters, runtime prerequisites, and hook registration | `references/runtime-setup.md` |
| Host readiness, delivery identity, and concrete shutdown operations | Current host adapter |

A seed supplies context and is the canonical home of a story. Execution uses a
plan for one selected story and works through its slices. GSD names identify
external tools only. Runtime entrypoints no longer repeat success checklists,
XML workflow labels, refactor testing instructions in delegation, or the full
CI repair sequence in each adapter. The existing stop and completion markers
remain protocol strings. All references remain part of the selected runtime
inventory, including the new execution-decisions reference.

Manual behavior review against the revised instructions confirmed:

- A seed without executable slices stops before implementation. A plan with
  missing slice limits reports the missing context. A valid plan delegates the
  next eligible slice and preserves coordinator delivery.
- A destructive slice conflicting with a later named outcome stops for human
  judgment; an unambiguously stale instruction restarts all slice decisions.
- An oversized slice preserves others' work, records elapsed time and the failed
  assumption, and follows story-level escalation before more slice refinement.
- A clean refactor pass runs no tests. A refactor edit reruns only invalidated
  proof. A cross-subsystem candidate without specific authorization returns the
  existing stop marker before cross-subsystem edits or commit.
- A CI repair pauses writers before stashing, keeps the interrupted slice in
  progress, applies coordinator delivery, restores the exact saved stash, and
  resumes only invalidated proof. Normal and repair pushes retain the observer;
  shutdown never implies green pending CI.

The existing supported-host contract test passed after revision. Local Markdown
file and anchor checks, frontmatter checks, terminology review of both extracted
trees, and `git diff --check` passed. Scripts, tests, and hook assets are byte
unchanged from the previously validated extraction, so its 63-test serial result
is reused for runtime behavior; the full process suite was not rerun for prose
changes. That reuse does not establish native agent acceptance of the revised
instructions. The earlier concurrent timeout remains recorded above.

## Promotion acceptance

The execution acceptance review records actual installed skill use on Codex,
Cursor, and Claude Code, including failure notification and shutdown, a complete
local delivery, refactor edits with focused proof, no-edit refactoring, and a
human-owned subsystem stop. Native Codex testing replaced cross-cell mutable
state and simultaneous terminal reads with an exposed receipt, plan-owned live
identity, and mailbox-based stop. Runtime scripts retain their original
observation behavior; source formatting now satisfies repository lint.

Both skill entrypoints, all required references, nine production scripts, and
two host fragments are declared together in the client payload. Tests and
maintainer records remain in this repository. The maintainer confirmed that v0.3.3 contains these two execution skills
and authorized release after native acceptance.
