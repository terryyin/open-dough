# First acceptance migration attempt

Original slice 1 stopped incomplete at 15 active minutes on 2026-11-15.
No commits or publications. All owned verification reached terminal results.
The sizing assumption that all shared-runtime and reusable-family closure
rewiring fit one slice proved false. Most failures were physical-directory
assumptions in shell sources, fixture copies, counterexamples and shim discovery.

The entire attempt is safely parked at `/tmp/seed371-attempt1/`: binary patch,
changed/new files with SHA-256 manifest, move map, consumer trace and literal
63-check command. All copied files were verified before restoring only the
286 attempt-owned tracked paths and removing its 203 new files. Coordinator
plan/source-review edits remain. Canonical historical comparison and replay
record bytes were untouched. No commands remain running.

## Terminal evidence

With `/opt/homebrew/bin` first on PATH, two jobs and `caffeinate -s -i`:
- `npm test -- Distribution/tests/native-comparison/native-comparison-refresh.sh Distribution/tests/native-comparison/native-comparison-pairs.sh Distribution/tests/native-comparison/native-comparison-incomplete.sh`: pass after fixture snapshots included moved runtime/cases.
- `npm test -- Distribution/tests/git-publication/git-publication-native.sh`: pass after shell-owner shim discovery repair.
- `npm test -- Distribution/tests/makeme/makeme-native-use.sh Distribution/tests/installation/dough-update-local-guidance-rejection.sh`: pass.
- `npm run typecheck:dashboard`: pass.
- Scheduling passed its post-repair check in a two-check command whose publication failure was subsequently repaired and passed separately. Identity/preparation passed the later four-check command.

The 63-check command in `seed371-slice1-full-focused.sh` exited 1.
Outstanding at the stop:
- admission reuse fixture copies old background CI native probe path;
- owned-context and one-shot counterexamples locate assessors beside old support;
- browser-group-shards reports zero actual selected specs in each browser group;
- standalone comparison-run sourcing uses unset `source_dir`, producing output
  from an otherwise passing Codex-owned-proof check.
Its older publication/scheduling failures have later focused passes above.
Consumer dispositions and acceptance were not completed. None of this attempt
is accepted solely from those passing commands: reuse only matching boundaries.

## Refined continuation

Split original acceptance movement into shared-runtime relocation (Structure)
and acceptance-family invocation (Behavior). Shared runtime is one immediate
prerequisite with its own physical-directory proof loop; acceptance cases then
move against stable shared paths. Comparison and scheduler boundaries remain
cohesive. Four slices remain, below the cap. Scope, ADR direction, one runtime,
one scheduler and historical-evidence protections are unchanged.
