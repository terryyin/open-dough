# Compound mobile-selection source replay

## Actual launch, input and return

2026-11-15; actual `collaboration.spawn_agent` arguments were
`task_name: "compound_reviewer"`, `fork_turns: "none"`, and `message` equal to
[the complete retained input](compound-input.md), without its final file newline.
No model or reasoning override was supplied. The returned task identity was
`/root/slice2/compound_reviewer`; its conversation retains the actual launch and
return. [The unmodified reviewer return](compound-return.md) preserves all 43
ids and its unnumbered context. These separate files divide input from output,
not arbitrary line chunks; this record owns the private comparison.

Only the candidate extraction brief and the recovered original Goal, Scope
(including scope limits), Key examples and UI were supplied. No human
amendments were supplied. The reviewer received no plan, product, proof,
historical rows, expected grouping or suspected gap. Source metadata,
investigation, architecture and the seed's second story were not inputs.

Candidate: `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md`
at `8ac10364f82362f3dac2504304a52645ed661456`, unchanged from slice 1.
The extraction message matches slice 1's brief exactly. Recovered with:

```sh
git show ebaf16f6336d2d9111f95984b907a006b67f3c04:.planning/seeds/SEED-316-mobile-terminal-text-selection.md
git show ebaf16f6336d2d9111f95984b907a006b67f3c04:.planning/slice-plans/591-select-and-copy-terminal-text-on-mobile/source-review.md
```

Both terminal commands exited 0. The full historical review stayed private to
this comparison. A terminal Python assertion also passed: the retained message
uses the candidate's normalized instruction and the verbatim recovered source
from `#### Goal` through the end of `#### UI`, before Investigation.

## Private source comparison

43 promises replace the historical 112 rows in this bounded replay. Repeated
Goal/Scope/example journeys share ids, while copy (12), paste (13), terminal
scrolling (35), application scrolling (37) and distinct preservation results
(18–22, 28–30, 38–39, 42–43) remain observable promises. The result retains
phone/tablet and any-host applicability, terminal-held contents, native gesture
affordances, disconnected/ended alternatives and the keyboard/rotation cases.

Examples remain attached: path selection and exact paste (2–3, 7, 9–13), live
return after more output (27–30), line 40 and the entire 200-line buffer (4,
7–8, 14), terminal versus application wrapping (21–22), application scroll
then select (7, 37–39), terminal-owned scrollback (35–36), and fine-pointer
preservation (41–43). A sufficient observation for a grouped promise must
still cover its stated conditions; grouping does not excuse keyboard,
rotation, line-range or transition coverage.

Context has no numbered row: G5's baseline/reason, U1's reading situation,
proof-method explanations and repeated proof targets X5.1–X5.8, physical-phone
proof deferral X5.9, optional styles and unpromised/deferred directions remain
in the return's unnumbered context. The checkable application-drawn breaks,
indentation and landscape result survive as 22–23 despite occurring in scope
limits. No scope limit became a new prohibition. The same-control return
survives as 27 without inventing an exclusive exit rejection rule.

Every old row is accounted for below. Historical trigger rows attach to
results instead of becoming independently allocated promises. The mapping is
comparison evidence, not an alteration or deletion of any returned id.

| Historical row(s) | Fresh id(s) or retained context |
| --- | --- |
| G1 | 12 |
| G2 | 13 |
| G3 | 35, 37 |
| G4 | 40 |
| G5 | context: existing baseline and goal rationale |
| S1.1, S1.3 | 1 |
| S1.2 | 2 |
| S1.4, S1.5, S1.6 | 3 |
| S1.7 | 9 |
| S1.8 | 10 |
| S1.9 | 11 |
| S1.10 | 12 |
| S1.11 | 15 |
| S1.12 | 16 |
| S1.13 | 17 |
| S2.1, S2.2 | 4 |
| S2.3 | 7 |
| S2.4 | 8 |
| S2.5 | 14 |
| S3.1 | 18 |
| S3.2 | 19 |
| S3.3 | 20 |
| S3.4 | 21 |
| S3.5 | 22 |
| S4.1 | 26 |
| S4.2, S4.3, S4.7 | 27 |
| S4.4, S4.5 | 28 |
| S4.6 | 29 |
| S5.1 | 4, 9–14: terminal-held contents and selection journey |
| S5.2 | 5 |
| S5.3 | 6 |
| S6.1 | 35, 37: heading attached to the two scrolling results |
| S6.2 | 35 |
| S7.1, S7.2, S7.3 | 37 |
| S7.4 | 38 |
| S7.5 | 39 |
| S7.6 | 40 |
| S8.1 | 42, 43 |
| S8.2 | 41 |
| K1.0 | 2, 3, 7, 9, 10, 12, 13: attached phone/path journey trigger |
| K1.1 | 3, 7 |
| K1.2 | 9, 10, 12 |
| K1.3 | 13 |
| K2.0 | 27: attached output-during-pause trigger |
| K2.1 | 27 |
| K2.2, K2.3 | 29 |
| K2.4 | 30 |
| K2.5, K2.6 | 28 |
| K3.0 | 4, 7: attached 200-line/line-40 trigger |
| K3.1 | 7 |
| K3.2, K3.3 | 8 |
| K3.4 | 14 |
| K4.0 | 21: attached 100-character/three-row trigger |
| K4.1 | 13, 21 |
| K4.2 | 22 |
| K5.0 | 37: attached Claude Code conversation trigger |
| K5.1 | 37 |
| K5.2 | 38 |
| K5.3 | 39 |
| K5.4 | 7 |
| K5.5 | 9–14: native selection/copy journey on the earlier screen |
| K6.0 | 35: attached terminal-held/application-not-scrolling trigger |
| K6.1 | 35 |
| K6.2 | 36 |
| K7.0 | 41–43: attached fine-pointer condition |
| K7.1 | 41 |
| K7.2 | 42 |
| K7.3 | 43 |
| U1 | context: small-screen, one-handed, keyboard/session situation |
| U2 | 3, 24–26: visible change; explanatory reason adds no id |
| U3 | 24 |
| U4 | 25 |
| U5 | 26 |
| U6, U7, U8 | 31: visible area, open keyboard and rotation retained |
| U9 | 32 |
| U10 | 27: same-control exit, with no invented rejection rule |
| U11 | 33 |
| U12 | 34 |
| X1.1 | 18, 21, 22: screen fidelity and copy representation |
| X1.2, X1.3 | 22 |
| X1.4 | 23 |
| X1.5 | context: deferred conversation-reading story |
| X2 | context: live long-press not promised, no prohibition invented |
| X3.1 | 4, 14 |
| X3.2 | context: application-held multi-screen selection not promised |
| X3.3 | 3, 7, 35, 37: repeated swipe-then-select route, attached context |
| X4.1, X4.2 | context: optional colors/styles |
| X5.1, X5.2, X5.3, X5.4, X5.5, X5.6, X5.7, X5.8, X5.9 | context: proof method, emulation limit, repeated proof targets and physical-phone proof deferral |

## Implementation and proof boundary

No concrete replay failure was found; no source-specific extraction rule or
source change was needed. This slice adds acceptance evidence only and has no
runtime effect. It changes no CLI/schema, record ownership, proof sufficiency,
isolation, source-review reuse, amendment refresh or lifecycle boundary.

Reuse [slice 1's complete consumer trace](small-consumers.md) and its recorded
focused pass in [small replay](small.md). The actual passed command there was:

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- Distribution/tests/skills/dough-execute-plan/story-obligations-source-review*.test.mjs Distribution/tests/installation/payload-declaration-links.sh
```

That retained observation covers 24 Node cases and payload declaration links.
The candidate guidance, tests, scripts, dependencies, setup and covered
boundaries are unchanged; this slice launches no test command and does not
repeat unchanged proof or the consumer trace. No test was authored or changed.
[Failure policy](../../../../.agents/skills/dough-execute-plan/references/failure-policy.md)
remains applicable; no failing or flaky verification was met.

Terminal structural assertions passed: all 112 historical ids occur exactly
once in this mapping, and the preserved return contains the contiguous ids
1–43. These checks establish retention, not semantic sufficiency; the source
comparison above supplies the latter's bounded evidence.

This is a single isolated extraction replay. It does not prove Dashboard
behavior, native gesture operation, matched-model causality, cross-host native
behavior, ordinary-use improvement, or time/token savings. No uncovered source
result was identified in this replay. Slice 4's CLI/refusal and lifecycle
observations remain with that slice.
