# DearDough Process Findings

## DD-003 — Coordinator reread the same execution-context skills on every slice

The Quick 040 coordinator reopened execute-plan wrap-up, CI observation, ADR, formatting/hook, and prior-walkthrough files at each of six slices, and each slice's implementation agent received a full brief. A compact observer/format/push record was later written into the plan, but later turns still reconstructed that context from the skills.

### Occurrences

- Execution: `Quick 040 / 962b4e7`
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `2a75248`; base `0.3.6`
  - Evidence: this execution conversation — repeated reads of wrap-up.md, ci-monitor.md, ADR 0003/0005/0006, PLAN.md, and Quick 036 walkthroughs before slices 1–6; PLAN.md learned the format/push/observer values after slice 1
  - Observed effect: the same gates were rediscovered before later slices instead of being reused from one retained brief
  - Inference: fresh-agent-per-slice is required, so some re-briefing is necessary; the extra coordinator rereading is likely avoidable once observer, format, and push dest are recorded. No token count was available. This is not the worktree-mailbox binding in DD-001.

## DD-004 — New shell in a Markdown-heavy slice reached CI before local shellcheck

Slice 2 added a `find` assertion to `tests/install-omits-internal.sh` and proved the installer omission locally. The file was not run through the repository shellcheck invocation before the first push. CI lint failed on SC2312; slice 3 work was stashed, repaired, and restored.

### Occurrences

- Execution: `Quick 040 / 962b4e7`
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `2a75248`; base `0.3.6`
  - Evidence: conversation CI_FAILURE on `23f0347` run 34448748798 job `lint`; PLAN.md CI-repair learning; commit `e607809`
  - Observed effect: one failed lint job and a stash/repair pause before slice 3 wrap-up
  - Inference: `git diff --check` does not cover ShellCheck; a new `.sh` path needs the same focused `shellcheck --` the lint script uses. One-off cost in this execution; not claimed as a general missing hook.

## DD-005 — Launching the CI observer from the coordinator checkout during worktree execution

Quick 040 ran in `/private/tmp/open-dough-quick-040-consistent-finding-names` but started `ci-mailbox.mjs` from the main checkout's installed execute-plan scripts. The observer received the slice 2 lint failure and did not need a discarded first mailbox.

### Occurrences

- Execution: `Quick 040 / 962b4e7`
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `2a75248`; base `0.3.6`
  - Evidence: this conversation started `node '/Users/terryyin/git/open-dough/.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs'` while the worktree was the edit root; `CI_OBSERVER` `/tmp/dough-ci-501/watch-DCr7nh`; CI_FAILURE for `23f0347` was delivered
  - Observed effect: one observer bound to the coordinator checkout covered the worktree-branch pushes
  - Inference: useful in this execution as a way to avoid DD-001; not shown to be the only correct launch path. Later main-merge CI was unobserved after shutdown, which follows execute-plan (do not wait for CI).
