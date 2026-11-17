# Verification reaches affected consumers before completion is claimed

**Source:** [selected story](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#proof-reaches-unchanged-consumers-of-changed-output)
**Source review:** [source-review.md](source-review.md)
**Identity:** SEED-393#proof-reaches-unchanged-consumers-of-changed-output

## Goal and scope

The story section owns the goal, investigated basis, scope, limits, key
examples and evaluation criteria; this plan adds none. In short: proof reach
is selected by where the changed output is observed, an exclusion needs a
reason the effect does not reach, and claims and counts stay bounded to
observations. One blind Codex redo of the frozen effort execution judges the
change against frozen A.

Exclusions carried from the source: no consumer-trace field, script
heuristic, record schema, parser or blanket full-suite run; test narrowing
and the delivery brief's counting clause stay outside. A no-wording-change
result remains available if slice 1's review shows existing words suffice.

## Existing solution and direction

PFE: the capability exists and is changed in place.
[Executable proof](../../../Distribution/src/skills/dough-story-refinement/references/executable-proof.md)
owns consumer tracing, exclusion and claim limits; the
[consumer-trace script](../../../Distribution/src/skills/dough-execute-plan/scripts/consumer-trace.mjs)
already accepts an effect `--term`;
[decisive premises](../../../Distribution/src/skills/dough-slice-planning/references/settle-decisive-premises.md)
restates the scratch-run selection as “one relevant test run”. The redo
reuses the SEED-391 construction recorded at
`fbfaa116b:.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/`
and the retained bundle `/Users/terryyin/open-dough-scratch/seed-391/retained/replays.bundle`.

[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
§3: executable proof stays the one home; the planning premise links to it.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): the
redo is native acceptance of one candidate, not a host comparison.
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md):
criteria are fixed in the source before the run. No North Star topic applies.

## Current decisions

- Edit only `Distribution/src/skills`; installed copies under `.agents/` and
  `.claude/` change only through a release
  ([skill authoring](../../../.agents/skills/author-open-dough-skills/SKILL.md)).
- Replace words before adding any. Each edit must be traceable to a key
  example; an example the current text already settles gets no new words.
- The redo is a paid native run: Terry triggers it manually (or authorizes
  it in the session), and no automated or repeated case is added. Host:
  Codex CLI with the configured defaults the frozen B used
  (`gpt-6.1-sol` / `xhigh`), confirmed from native metadata.
- Redo input mirrors frozen Codex B: start `c629d0d93` (A's Take plus
  `934a51a30`) with this story's guidance diff applied to both installed
  roots, plan 664 as A left it, the same execute-plan prompt with a local
  bare remote and “No publication authority: deliver local-only. Stop at the
  execution-complete record.” The participant receives no prior outcome or
  this story's text.
- A, frozen Codex B and frozen Claude B are never rerun or changed.

## Proof ownership

| Promise (source scope / example) | Owning slice and observable proof |
| --- | --- |
| Reach follows where the output is observed, including unchanged tests and helpers (ex. 1) | 1: edited executable-proof text walked over the effort change; premise row 1 shows the trace then lists the missed spec; 3: redo's slice-1 trace and runs include E2E `launches/` |
| Another subject is not an exclusion (ex. 2) | 1: edited exclusion sentence walked over the frozen disposition; 3: no redo exclusion of a consumer that reads recorded argv for its subject |
| Narrow change keeps focused proof (ex. 3) | 1: existing “helper used only within one file” sentence unchanged |
| Filtered green run and counts stay bounded (ex. 4, 5) | 1: edited claim sentence walked over both examples; 3: redo return/plan counts checked against its logs |
| Selected proof fails on the old assumption | 3: in the redo checkout before its own fix, or the retained 2026-11-17 diagnostic (`agent-launch-ad-hoc.spec.ts:120`, length 3 vs 5) when the redo changes that line first |
| Judgment against frozen A with residue named | 3: `## Result` of this plan |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| The existing trace, given the observation point as a term, lists the missed consumers | Slice 1 relies on `--term`, adds no script change | 2026-11-17, scratch worktree of `453c2035c` (frozen Codex default commit): `node Distribution/src/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout <scratch> --base 453c2035c^ --term claudeLaunchCalls` → exit 0, 1,206 lines; rows for `e2e/launches/agent-launch-ad-hoc.spec.ts` and `dashboard/tests/support/unattachedLaunchAssertions.ts` (line 25 exact argv `toEqual`); 131 E2E rows. Worktree removed. |
| The frozen exclusion was a subject judgment on a listed row | Slice 1 exclusion wording | Scratch `/tmp/dough-effort-slice1-consumers.md` (not durable) row: `e2e/launches/agent-launch-ad-hoc.spec.ts` … “excluded: journey asserts navigation, actions, options, lifecycle or supplied usage rather than the new default”. Unchanged `:120` at `codex-B`: `expect(call?.argv).toHaveLength(3)`. |
| The redo can be rebuilt from retained evidence | Slice 2 construction | `git bundle list-heads` names `codex-B` `57f805ee2` and `claude-B`; fetch either into the redo clone with `git fetch <bundle> refs/heads/codex-B`. `c629d0d93` is the first commit after A's start (`4b75c2888`) on both heads. 2026-11-17: `codex --version` → 0.169.0; `~/.codex/config.toml` → `gpt-6.1-sol`, `xhigh`, approval `never`, `danger-full-access`, no scratch trust entry: the same as retained `b-codex-launch.json`, whose `codex exec --json` in an untrusted scratch clone exited 0. |

## Concerns

Slice-plan refinement was not needed: one guidance outcome with one proof
loop (1), one paid native observation whose launch needs Terry (2), and one
assessment (3). Slice 2's run is long wall time inside the slice clock; its
active setup is small. Slice 2 waits for Terry's trigger; that is the
plan's only developer-operated step and it changes no scope.

## Ordered slices

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Local gate per slice: the named checks only. Start fully awake
and wrap the redo and any E2E run on AC power in `caffeinate -s -i`
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos));
on battery, stop the redo rather than run it under `-i` alone.

### 1. Proof reach follows where the changed output is observed
Type: Behavior
Status: done
Proof: behavior review of key examples 1–5 against the edited text, quoted
with the sentence that settles each; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`;
`npm run --silent format`; `git diff --stat` shows only the two guidance
files and this plan.

Behavior: an executing agent reading executable proof for a changed launch
default → selects its scratch run and focused proof by the fake host's
recorded launches (the observation point, supplied as `--term`) → includes
every suite whose tests read it, cannot exclude the ad hoc spec for its
subject, and reports filtered runs and counts within what it observed.
`settle-decisive-premises.md` links its behavior-consumer scratch run to that
rule instead of “one relevant test run”. Net added words stay small; prefer
replacing the “suite covering the changed surface” sentence, the exclusion
sentence and the “Limit success claims” sentence.

Accepted 2026-11-17: executable proof's exclusion, suite and claim sentences
replaced (net about +60 words); the premise links to it. Acceptance found the
old rule restated in execute-plan `delegation.md` and `wrap-up.md` (“the
changed surface's suite”); both now defer to executable proof, so the diff
holds four guidance files. Key examples 1, 2, 4, 5 are settled by the edited
sentences, 3 by the unchanged one-file-helper sentence. Proof: the link test
(silent on pass; prints FAIL on a scratch broken link) exit 0;
`node --test` of `ci-supported-host-contract` and `execution-increment-delivery`
(they read `wrap-up.md`): 3 passed, 0 failed. Old phrases remain only in
installed copies (release), planning records and history findings
(ODF-107, ODF-150, ODF-473), which describe released state; wrap-up decides
whether a finding's response line needs updating.

### 2. A blind Codex redo executes the effort plan under the changed guidance
Type: Behavior
Status: done
Proof: launch record (command, cwd, prompt path, CLI version, effective
model/effort from native metadata, power/load, start/end, exit) and the
redo's head; `git -C <redo> diff --stat c629d0d93 <redo start>` lists only
the installed guidance files; the real `origin` refs are unchanged.

Behavior: Terry triggers the prepared launch script (one short path) →
Codex executes plan 664 from the rebuilt start in a scratch clone under
`~/open-dough-scratch/seed-393/` with only a local bare remote → it stops at
its execution-complete record or a recorded stop, and that stop is retained
rather than coached. Before launch, confirm Terry's trigger, AC power and
that no other paid run competes.

Prepared 2026-11-17, not launched: `~/open-dough-scratch/seed-393/`
`b-codex-remote.git` (`main` `4b75c2888`; story branch at `af2fcf278`, one
commit on `c629d0d93` applying `dc483b4dc..7875763cc -- Distribution/src/skills`
to both installed roots), clone `b-codex` (clean, only that origin; plan 664
byte-identical to `c629d0d93`), `b-codex-prompt.txt` (seed-391 prompt with
workspace, SHAs and skill path only changed) and `launch-b-codex.sh` (AC-power,
clean-clone and run-once guards; writes `b-codex-launch.json`). The installed
`delegation.md` differs from source in one context line (“At the active
limit…”), so its two replaced lines were applied with the installed context
kept; the +/- lines match the source diff. Codex CLI 0.169.0, `gpt-6.1-sol`,
`xhigh`, approval `never`, `danger-full-access`, no scratch trust entry, but a
parent `/Users/terryyin` trust entry: disclose as a context difference. The
bare remote carries release tags up to `v0.3.102`, all at or before A's Take.

Ran 2026-11-17 on Terry's in-session go-ahead: `launch-b-codex.sh` from
04:22:16Z to 08:49:42Z, exit 0, AC power, load 15.1/18.7/16.6 at start
(37 a minute earlier, from other work). Native thread
`01a1e7bd-c8e0-7f21-a9a1-f49fe951fcd9`: CLI 0.169.0, `gpt-6.1-sol`, `xhigh`.
Redo head `4c82626a4` (“Record local execution completion…”), clean, eight
commits over `af2fcf278`, final message “Completed all seven slices locally …
Nothing pushed; stopped before wrap-up.” The scratch bare remote is unchanged
(`main` `4b75c2888`, story branch `af2fcf278`); the clone has no other remote.
Real `origin/main` moved `4e92ca857`→`0bf601c73` from unrelated trunk work.
Record `b-codex-launch.json`, events `b-codex-events.jsonl`.

### 3. The redo is judged against frozen A, with residue named
Type: Behavior
Status: planned
Proof: `## Result` quoting the redo's consumer-trace dispositions and run
commands for the E2E launch group, the decisive failing observation, its
return/plan counts beside its logs, and the source's three criteria each
met, missed or not exercised; residue and unverified scope listed.

Behavior: the redo's checkout and transcript → inspected against frozen A
(and frozen Codex B as context) → keep, revise or drop for the slice 1 edit,
or inconclusive with the missing evidence. One run isolates no guidance
effect; disclose host, CLI and context differences and effort only as
secondary evidence.
