# Execution context and trial protocol

## Current decisions

- **Execution resume (2026-11-16).** Story Branch Mode in
  `/Users/terryyin/git/open-dough/.worktrees/redo-the-effort-story-under-the-test-focus-guida`,
  branch `codex/redo-the-effort-story-under-the-test-focus-guida`, agent
  Aino-chan, publisher `dashboard-territory.local-open-dough`. Established
  Take/candidate `72c22dfe813bf250426c9032cfae75e3e8663459` is published on
  `origin/main` and the execution branch; starting revision
  `4e9cc50ba81cf93a6ba1bc5784f964c207dcac7c`. The originating/default checkout
  is `/Users/terryyin/git/open-dough`; all work stays in the established
  owned worktree. No new claim or workspace is created. Existing planning
  authority is retained; no explicit replan override was supplied.
- **Checkout readiness.** Selected Node `24.21.0` matches `.node-version`.
  `node scripts/setup-native.mjs npm` completed a locked install here;
  `npm run lint -- --staged` exited 0. The tracked pre-commit hook is
  check-only; `npm run format` selects changed files. AC power confirmed
  before the scratch runs.
- **CI observer.** GitHub Actions `terryyin/open-dough`, push workflow
  `ci.yml` (`CI`, id `351271804`), execution-branch target
  `codex/redo-the-effort-story-under-the-test-focus-guida`. Codex coordinator
  `aino-seed391`, stream cell `g660:13`, session `32972`, PID `69942`,
  directory `/tmp/dough-ci-501/watch-kLDg1n`, execution checkout above.
  That stream was stopped at the initial Claude refusal. On the Codex-first
  resume, the same coordinator rearmed stream cell `g666:8`, session `63725`,
  PID `59140`, directory `/tmp/dough-ci-501/watch-nVUAv2`; the old directory
  is terminal `stopped`. The established Take's trunk CI remains unobserved
  by this branch observer.

- **Codex-first amendment (2026-11-16).** Terry authorized Codex first after
  the native Claude trust refusal. B and P now run on Codex defaults; the
  five slices and guidance observations remain. This is cross-host mechanism
  evidence, not a controlled one-variable A/B result. Preserve the refused
  Claude setup unchanged. No trust-setting change or Claude retry is needed
  for this Codex path. The matched Claude replay remains pending its trust
  prerequisite after the Codex-first run; no earlier authority is withdrawn.
- **Scratch B.** `~/open-dough-scratch/seed-391/b-codex-remote.git` is a bare
  repository holding `main` at `4b75c2888` plus one commit that applies
  `git diff 934a51a30^ 934a51a30 -- Distribution/src/skills` to `.agents/skills`
  and `.claude/skills` (`git apply -p4 --directory=<dir>`), and the story branch
  `claude/show-and-keep-the-effort-a-claude-code-launch-ru` at that commit.
  `~/open-dough-scratch/seed-391/b-codex` is a clone of it on that branch; `origin`
  is the bare repository and no other remote exists. The patch is committed
  so B starts from a clean workspace.
- **B's instruction** is A's first message
  (`/dough-execute-plan SEED-388#show-the-effort-a-launch-runs-with` with its
  `Established start` block) with `workspace` set to the clone,
  `publishedSha`, `candidateSha` and `startingRevision` set to the patched
  commit, the `Dashboard reporting context` block removed, and one added
  line: `No publication authority: deliver local-only. Stop at the
  execution-complete record.` Use `$dough-execute-plan` for Codex and supply
  the installed scratch skill path; add no comparison information.
- **User context.** Preserve the copied Claude memory from the refused
  attempt, but do not inject it into Codex as if it were native equivalent
  context. B and P use ordinary Codex user context. Record what their
  transcripts actually show; no claim of memory parity with A.
- **Scratch P.** The same construction at `0e6b0f3dc`: plan directory `664-…`
  removed, the effort story's state block set to
  `{"schemaVersion":1,"refinement":"refined","approach":"unselected"}`, the
  patch applied, all in one commit on `main` of `p-codex-remote.git`, cloned to
  `~/open-dough-scratch/seed-391/p-codex`. Its instruction:
  `$dough-slice-planning SEED-388#show-the-effort-a-launch-runs-with` with
  `Plan only. Publish and announce nothing.` It uses ordinary Codex defaults,
  with effective model/effort recorded; it is not the original Claude
  preparation session's model/effort.
- **One at a time.** P starts after B has finished, so P's scratch test run
  does not load B's.
- **The executing session stays out of B and P.** It sends no message to
  either session after launch. A session that stops with a question is
  recorded as stopped at that point; its question is quoted in the result.
- **Retention.** The scratch directories and B's and P's transcripts stay
  until wrap-up, which removes them after Terry has read the result.

## Owned CI interruption (2026-11-16)

Registered research revision `5ea5ca123ecc8b5b87321adb69a3920bcec8f732` is
`not_required`, with failed applicable basis `83cbf20fa2126546cadd014389278057e6db1220`,
run `43869463784`, attempt 1. [Correction input/evidence](ci-repair.md) owns
the bounded repair; it is independent of the frozen B/P trials. Inventory
agent `slice2_test_inventory` is paused without writes or running commands,
seven active minutes used; after this insertion its work is slice 3.
Stash save was `clean`, OID null, at
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-c6SgQ0/record.json`.
No nested stash is taken. Same observer `/tmp/dough-ci-501/watch-nVUAv2`.

Active-plan refinement retains the delivered slice 1 and all its proof, inserts
one cohesive Structure correction, and shifts research slices 2–5 to 3–6.
Six slices remain within the eight-slice limit. Existing worker preparation
is the selected PFE result; observed hook-only startup is held separate. The
next attempt gets 15 active minutes; completed compatible read-budget and
runner cleanup edits remain in place. No story, claim or backlog identity is
created. The current source review is unchanged; allocations move with owners.

## CI repair publication and return

Accepted repair `d59ab3e84d48eed3cb987f89a6232b1ffa17612b` extends published
research `5ea5ca123ecc8b5b87321adb69a3920bcec8f732`, both accepted on
`refs/heads/codex/redo-the-effort-story-under-the-test-focus-guida`. Same
observer `/tmp/dough-ci-501/watch-nVUAv2`. Exact applicable run 43899583428/1
succeeded; await-revision session 67819 ended with that receipt. Stash restore
returned resumed with no OID or application. Research slice 3 may resume the
same inventory agent from its seven active minutes and frozen A/B inputs.
