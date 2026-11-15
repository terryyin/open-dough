# Source review

Launch: fresh reviewer, source text only.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | **Add property** offers `pronunciation` in its existing key choices. Ordinary-note editing; Scope/property bullet 1; UI bullet 1; **多大** example. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P02 | **Add property** initially has no key choice selected. Scope/property bullet 1; **多大** example. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P03 | Ordinary-note editing does not automatically add `pronunciation`. No note receives it unless someone adds it; Scope/property bullet 1. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P04 | Choosing and adding `pronunciation` stores an ordinary YAML property with a plain-text value. Scope/property bullet 2; `pronunciation: ただい` in **多大**. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P05 | A YAML list can hold several pronunciation readings. Scope/property bullet 2; **顔色** has `かおいろ` and `がんしょく`. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P06 | A property row’s existing key-field choices offer `pronunciation`. UI bullet 1. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P07 | `pronunciation` is displayed with the note’s other properties. Scope/property bullet 5. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P08 | `pronunciation` can be edited with the note’s other properties. Scope/property bullet 5. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P09 | Publication includes `pronunciation` in the note’s frontmatter. Scope/property bullet 5. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P10 | The assimilation sequence offers `pronunciation` as its own ordinary-property unit. Scope/property bullet 5; owner confirmation dated 2026-11-11; measured assimilation statement. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P11 | Spelling hides every body occurrence of each pronunciation value. Goal; Scope/property bullet 3. Includes both readings of **顔色**, `ただい` in **多大**, and one-kana `て` inside `挙げて` under the existing matching rule (UI bullet 3). |  | G11 |
| P12 | The Spelling prompt excludes the note’s properties, including `pronunciation`. Scope/property bullet 3: the prompt is the note body without its properties. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P13 | A hidden pronunciation occurrence displays the existing `/.../` hidden-pronunciation mark. UI bullet 2; it indicates a hidden reading. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P14 | Spelling continues hiding the title in the prompt when the note has `pronunciation`. **多大** example explicitly hides both `多大` and `ただい`. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P15 | Spelling accepts the note title as an answer. Scope/property bullet 4; `多大` is correct in the **多大** example. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P16 | Spelling accepts the title’s part before trailing brackets. Scope/property bullet 4; one of the forms accepted today. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P17 | Spelling accepts the note’s aliases. Scope/property bullet 4; another form accepted today. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P18 | Membership in `pronunciation` alone does not make an answer correct. Scope/property bullet 4; `ただい` is incorrect for **多大**. This does not reject text independently accepted as a title form or alias. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P19 | Existing `/…/` body readings remain hidden under today’s Spelling behavior. Scope/property bullet 6; `/じゅわ/` without a property; UI’s `/て/` example; deferred other-notebook context repeats this requirement. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P20 | Before publication, the preview identifies every note that would change by its title. Scope/conversion bullet 2. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P21 | Before publication, the preview gives the reading for every note that would change. Scope/conversion bullet 2. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P22 | Before publication, the preview shows the changed text’s before state for every note that would change. Scope/conversion bullet 2. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P23 | Before publication, the preview shows the changed text’s after state for every note that would change. Scope/conversion bullet 2. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P24 | The preview groups proposed changes by kind of change. Scope/conversion bullet 2; similar changes can be checked together. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P25 | Before publication, the preview lists notes containing `/…/` that would remain unchanged. Scope/conversion bullet 2; skipped-note examples include **音**, **コツ**, **足利義満**, and a note already carrying the property. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P26 | Each listed unchanged note has a reason. Scope/conversion bullet 2; reasons supplied by the conversion restrictions and skipped-note examples. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P27 | An eligible note’s reading becomes its `pronunciation` value. Exactly one match under today’s Spelling rule, plain kana, no existing property, and subject-preservation restriction satisfied; Scope/conversion bullets 3–4. Examples: `ただい`, `みずひき`. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P28 | Conversion removes the marked reading from the body. Same eligibility conditions; Scope/conversion bullet 3; both conversion examples. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P29 | Conversion removes spacing that existed only to hold the marked reading. Where such spacing exists; `「多大　/ただい/」とは…` becomes `「多大」とは…`. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P30 | Conversion removes a bracket pair that existed only to hold the marked reading. Where such brackets exist; `水引（/みずひき/）は、…` becomes `水引は、…`. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P31 | Conversion preserves all other body text, including readings of other words. Scope/conversion bullet 3; inline `甚大（じんだい）` and its explanation remain. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P32 | A note with several recognized `/…/` matches remains unchanged. Scope/conversion bullet 4; **音** contains `/ね/` and `/おん/`. Its preview listing and reason are covered by P25–P26. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P33 | A note whose sole match is not plain kana remains unchanged. Scope/conversion bullet 4; **コツ** contains slash-separated Chinese translations. Listing and reason: P25–P26. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P34 | A note already containing `pronunciation` remains unchanged by the conversion. Scope/conversion bullet 4 and skipped-note example. Listing and reason: P25–P26. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P35 | A note remains unchanged when removing its reading would leave a sentence without its subject. Scope/conversion bullet 4; **足利義満** begins `/あしかが よしみつ/は、…`. Listing and reason: P25–P26. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P36 | Production remains unchanged until the normal notebook publication is accepted. Scope/conversion bullet 5. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P37 | Converted notes retain their identity through publication. Scope/conversion bullet 6: “Converted notes are the same notes.” | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P38 | Converted notes retain their attached memory trackers after publication. Goal; Scope/conversion bullet 6; **多大** conversion example. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |
| P39 | Converted notes retain their attached recall history after publication. Goal; Scope/conversion bullet 6; **多大** conversion example. | slice 1 | observed: fixture-only retained observation marker; no archived product proof |

## Retained return context

Property and review promises apply equally to applicable properties added through **Add property**, typed by hand, or received through Git publication.



- **Purpose:** named reading data supports better note quality; Spelling trains the written form.
- **Conversion delivery:** work happens in the owner’s checkout, by an agent or an unretained script. No conversion code enters this repository. Publication uses `donut notebook publish`. Git diff provides exact-change inspection; production checks supply evidence for retained history.
- **UI scope:** use the existing key-choice controls; no new control is introduced.
- **Owner intervention:** skipped notes may be edited manually or handled individually before publication.
- **Measured baseline:** accepted history `cc485736`, measured 2026-11-11, excluding trash: 750 matching notes; 641 single plain-kana candidates; 56 single non-kana matches; 53 multiple matches; no existing `pronunciation` properties. The source also states 641 additional assimilation units and approximately 11 subject-bearing candidate sentences. These figures remain source context; they do not establish a blanket obligation to convert every candidate despite P35.
- **Deferrals:** other notebooks, removal of legacy slash handling, automatic rewriting of subject-bearing sentences, reading-answer or reading-prompt review, and recording other words’ readings. These do not create additional rejection rules.
- **Rejected approaches and rationale:** no retained temporary conversion script and no production startup migration across every notebook; the latter would alter other owners’ prose without review. The considered title substitution would insert text the author did not write.
