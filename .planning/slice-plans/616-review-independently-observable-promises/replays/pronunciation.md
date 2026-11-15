# Pronunciation source replay

## Actual launch, input and return

2026-11-15; actual `collaboration.spawn_agent` arguments were
`task_name: "pronunciation_reviewer"`, `fork_turns: "none"`, and `message`
equal to [the complete retained input](pronunciation-input.md), without its
final file newline. No model or reasoning override was supplied. The returned
task identity was `/root/slice3/pronunciation_reviewer`; its conversation
retains the actual launch and return.

[The unmodified reviewer return](pronunciation-return.md) retains all 39 ids,
P01–P39, its opening applicability qualification and its unnumbered context.
Input, return and this private comparison have separate responsibilities;
their file boundaries are not arbitrary line chunks.

Immediately after the launch, a separate `collaboration.send_message` supplied
this exact operational footer, not source content:

> Workflow policy, not source content: .agents/skills/dough-execute-plan/references/failure-policy.md applies to any encountered failure. For this source-only review, run no tools and read no files.

The footer carries the project's
[failure policy](../../../../.agents/skills/dough-execute-plan/references/failure-policy.md).
It supplies no product, plan, proof or expected result. The launch input and
this later message are recorded separately to preserve their actual ordering.

Only the candidate extraction brief and the recovered original Goal, both
Scope sections, measured baseline, Deferred exclusions, rejected approaches,
Key examples and UI were supplied. No human amendments were supplied. The
reviewer received no plan, product, proof, historical review, expected grouping
or suspected gap. Source metadata and Architecture were not inputs.

Candidate: `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md`
at `f69a6a4d5c297c9a123cf561d201d84d5c5741e1`, unchanged from slices 1 and 2.
The extraction instruction matches the preceding replays. Recovered with:

```sh
git -C /Users/terryyin/git/doughnut show e9f109c3c25b0355a897161f8a8180fdfb22a1a5:.planning/seeds/SEED-124-save-pronunciations-as-note-properties.md
```

The terminal command exited 0. A terminal Python assertion passed: the
retained input uses the candidate's normalized instruction and the verbatim
source from `**Goal.**` through the end of `**UI.**`, before Architecture.
It also confirmed that the candidate, obligation scripts, focused source-review
tests, payload-link check, package manifest and lockfile have no diff against
`f69a6a4d5c297c9a123cf561d201d84d5c5741e1`. HEAD was that same revision.

## Private source comparison

The fresh return keeps the critical qualification explicit in P11: every
pronunciation body occurrence is hidden, including both readings of 顔色 and
one-kana `て` inside `挙げて`, with provenance to UI bullet 3. P18 independently
retains the restriction that pronunciation membership does not make a written
answer correct, including the 多大/ただい example. Its qualification preserves
text that is independently accepted as a title form or alias. This does not
turn a scope exclusion into an invented rejection rule.

A sufficient observation of P11 still owes its inside-word and multiple-value
conditions; a simple whole-word hiding observation alone would be insufficient.
P18 requires its own answer-acceptance observation. Grouping does not remove
either result or the original source qualification. The return's opening
sentence applies property/review promises to Add property, hand-written YAML
and Git publication; sufficient observations must cover those source paths.

Every recovered source section is accounted for below. Source bullet numbers
refer to the retained input's original sections. This comparison does not
rewrite, delete or merge any returned id.

| Source location | Fresh id(s) or retained context |
| --- | --- |
| Goal: named property and hidden reading | P04, P11–P12; quality rationale remains context |
| Goal: move owner's readings and keep history | P27–P31, P37–P39 under conversion eligibility |
| Property Scope 1 | P01–P03 |
| Property Scope 2 | P04–P05; opening qualification preserves hand-written/Git paths |
| Property Scope 3 | P11–P12 |
| Property Scope 4 | P15–P18; written-form reason remains context |
| Property Scope 5 | P07–P10; ordinary-property qualifications retained |
| Property Scope 6 | P19; dependency reason remains context |
| Conversion Scope 1 | context: owner's checkout, unretained agent/script, no repository conversion code |
| Conversion Scope 2 | P20–P26; exact Git-diff inspection remains proof-method context |
| Conversion Scope 3 | P27–P31, including recognized single plain-kana match and absent property |
| Conversion Scope 4 | P25–P26, P32–P35; manual/individual owner intervention remains context |
| Conversion Scope 5 | P36; owner publication command remains delivery context |
| Conversion Scope 6 | P37–P39; production checking remains proof-method context |
| Measured paragraph | context: dated counts and accepted revision; P10 retains property-unit behavior without promising conversion of subject-bearing candidates |
| Deferred 1 | P19 retains legacy hiding; other-notebook conversion and counts remain deferred context |
| Deferred 2 | P19 retains legacy hiding; false-positive examples and removal prerequisite remain context |
| Deferred 3 | P35 retains subject-preservation restriction; title-substitution rationale remains context |
| Deferred 4 | P18 retains actual answer refusal; reading-prompt review remains deferred context |
| Deferred 5 | context: no other-word reading capture; P31 retains existing other-word text |
| Considered and not chosen | context: rejected retained script/startup migration and owner-review rationale |
| Key example 1 | P01–P04: 多大 property-choice journey |
| Key example 2 | P11, P14–P15, P18: 多大 and ただい hidden; written answer accepted, reading refused |
| Key example 3 | P05, P11: 顔色's two readings hidden wherever repeated |
| Key example 4 | P19: legacy /じゅわ/ without a property |
| Key example 5 | P27–P29, P31, P37–P39: spacing removed, other reading and history preserved |
| Key example 6 | P27–P28, P30: 水引 holding brackets removed |
| Key example 7 | P25–P26, P32–P35: all four skipped-note conditions and listing reasons |
| UI 1 | P01, P06; use of existing controls/no new control remains scope context |
| UI 2 | P13: existing hidden-reading mark; full source location retained for its meaning |
| UI 3 | P11: て inside 挙げて; P19: existing /て/ behavior; matching-rule rationale stays attached |

Each numbered row owes a separately checkable result. The dated baseline,
reasons, delivery route, proof-method statements, deferred product directions
and unchosen approaches remain unnumbered context. No conversion or review
restriction was lost. The preview title, reading, before/after states, grouping
and skipped-note reasons can fail independently and retain separate ids.

## Implementation and proof boundary

No concrete replay failure was found; no source-specific rule or candidate
source change was needed. This slice adds acceptance evidence only, with no
CLI/schema, allocation, proof-sufficiency, isolation, reuse, amendment-refresh
or lifecycle effect. It does not inspect Doughnut's product implementation or
the live notebook and does not claim those product results have been delivered.

Reuse [slice 1's complete consumer trace](small-consumers.md) and the focused
pass in [small replay](small.md). Its literal passed command was:

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- Distribution/tests/skills/dough-execute-plan/story-obligations-source-review*.test.mjs Distribution/tests/installation/payload-declaration-links.sh
```

That retained pass covers 24 Node cases and payload declaration links. Candidate
guidance, integration paths, tests, scripts, dependencies and covered boundaries
are unchanged; no test command or consumer trace was repeated. No test was
authored or changed. No failing or flaky verification was encountered.

The settled small replay (26 promises versus 44 historical rows) and compound
replay (43 versus 112) remain unchanged. This third replay supplies bounded
extraction evidence for qualified results and genuine restrictions. It makes
no time/token saving, matched-model, cross-host or ordinary-use improvement
claim. No semantic source-coverage gap was identified in this return.

## Structural retention check

The following literal terminal command exited 0. Its stdout confirmed the
contiguous return and complete comparison below; it also reported resolving
links and, before this command was documented, 133/134/53 lines respectively
for the record, input and return. These structural checks do not prove semantic
coverage; the private comparison above provides that judgment.

```sh
python3 - <<'PY'
from pathlib import Path
import re
root = Path('.planning/slice-plans/616-review-independently-observable-promises/replays')
returned = (root / 'pronunciation-return.md').read_text()
ids = re.findall(r'^\| (P\d+) \|', returned, re.M)
assert ids == [f'P{i:02}' for i in range(1, 40)]
record = (root / 'pronunciation.md').read_text()
comparison = record.split('| Source location |', 1)[1].split('Each numbered row', 1)[0]
covered = set()
for first, last in re.findall(r'P(\d{2})(?:–P(\d{2}))?', comparison):
    covered.update(range(int(first), int(last or first) + 1))
assert covered == set(range(1, 40))
for name in ['pronunciation.md', 'pronunciation-input.md', 'pronunciation-return.md']:
    content = (root / name).read_text()
    assert len(content.splitlines()) <= 250
    for target in re.findall(r'\]\(([^)]+)\)', content):
        assert (root / target.split('#')[0]).exists(), target
    print(f'{name}: {len(content.splitlines())} lines; links resolve')
print('PASS: P01–P39 retained in order and every returned id appears in the private source comparison.')
PY
```
