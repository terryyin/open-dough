Property and review promises apply equally to applicable properties added through **Add property**, typed by hand, or received through Git publication.

| ID | Independently observable promise | Source conditions and retained examples |
|---|---|---|
| P01 | **Add property** offers `pronunciation` in its existing key choices. | Ordinary-note editing; Scope/property bullet 1; UI bullet 1; **多大** example. |
| P02 | **Add property** initially has no key choice selected. | Scope/property bullet 1; **多大** example. |
| P03 | Ordinary-note editing does not automatically add `pronunciation`. | No note receives it unless someone adds it; Scope/property bullet 1. |
| P04 | Choosing and adding `pronunciation` stores an ordinary YAML property with a plain-text value. | Scope/property bullet 2; `pronunciation: ただい` in **多大**. |
| P05 | A YAML list can hold several pronunciation readings. | Scope/property bullet 2; **顔色** has `かおいろ` and `がんしょく`. |
| P06 | A property row’s existing key-field choices offer `pronunciation`. | UI bullet 1. |
| P07 | `pronunciation` is displayed with the note’s other properties. | Scope/property bullet 5. |
| P08 | `pronunciation` can be edited with the note’s other properties. | Scope/property bullet 5. |
| P09 | Publication includes `pronunciation` in the note’s frontmatter. | Scope/property bullet 5. |
| P10 | The assimilation sequence offers `pronunciation` as its own ordinary-property unit. | Scope/property bullet 5; owner confirmation dated 2026-11-11; measured assimilation statement. |
| P11 | Spelling hides every body occurrence of each pronunciation value. | Goal; Scope/property bullet 3. Includes both readings of **顔色**, `ただい` in **多大**, and one-kana `て` inside `挙げて` under the existing matching rule (UI bullet 3). |
| P12 | The Spelling prompt excludes the note’s properties, including `pronunciation`. | Scope/property bullet 3: the prompt is the note body without its properties. |
| P13 | A hidden pronunciation occurrence displays the existing `/.../` hidden-pronunciation mark. | UI bullet 2; it indicates a hidden reading. |
| P14 | Spelling continues hiding the title in the prompt when the note has `pronunciation`. | **多大** example explicitly hides both `多大` and `ただい`. |
| P15 | Spelling accepts the note title as an answer. | Scope/property bullet 4; `多大` is correct in the **多大** example. |
| P16 | Spelling accepts the title’s part before trailing brackets. | Scope/property bullet 4; one of the forms accepted today. |
| P17 | Spelling accepts the note’s aliases. | Scope/property bullet 4; another form accepted today. |
| P18 | Membership in `pronunciation` alone does not make an answer correct. | Scope/property bullet 4; `ただい` is incorrect for **多大**. This does not reject text independently accepted as a title form or alias. |
| P19 | Existing `/…/` body readings remain hidden under today’s Spelling behavior. | Scope/property bullet 6; `/じゅわ/` without a property; UI’s `/て/` example; deferred other-notebook context repeats this requirement. |
| P20 | Before publication, the preview identifies every note that would change by its title. | Scope/conversion bullet 2. |
| P21 | Before publication, the preview gives the reading for every note that would change. | Scope/conversion bullet 2. |
| P22 | Before publication, the preview shows the changed text’s before state for every note that would change. | Scope/conversion bullet 2. |
| P23 | Before publication, the preview shows the changed text’s after state for every note that would change. | Scope/conversion bullet 2. |
| P24 | The preview groups proposed changes by kind of change. | Scope/conversion bullet 2; similar changes can be checked together. |
| P25 | Before publication, the preview lists notes containing `/…/` that would remain unchanged. | Scope/conversion bullet 2; skipped-note examples include **音**, **コツ**, **足利義満**, and a note already carrying the property. |
| P26 | Each listed unchanged note has a reason. | Scope/conversion bullet 2; reasons supplied by the conversion restrictions and skipped-note examples. |
| P27 | An eligible note’s reading becomes its `pronunciation` value. | Exactly one match under today’s Spelling rule, plain kana, no existing property, and subject-preservation restriction satisfied; Scope/conversion bullets 3–4. Examples: `ただい`, `みずひき`. |
| P28 | Conversion removes the marked reading from the body. | Same eligibility conditions; Scope/conversion bullet 3; both conversion examples. |
| P29 | Conversion removes spacing that existed only to hold the marked reading. | Where such spacing exists; `「多大　/ただい/」とは…` becomes `「多大」とは…`. |
| P30 | Conversion removes a bracket pair that existed only to hold the marked reading. | Where such brackets exist; `水引（/みずひき/）は、…` becomes `水引は、…`. |
| P31 | Conversion preserves all other body text, including readings of other words. | Scope/conversion bullet 3; inline `甚大（じんだい）` and its explanation remain. |
| P32 | A note with several recognized `/…/` matches remains unchanged. | Scope/conversion bullet 4; **音** contains `/ね/` and `/おん/`. Its preview listing and reason are covered by P25–P26. |
| P33 | A note whose sole match is not plain kana remains unchanged. | Scope/conversion bullet 4; **コツ** contains slash-separated Chinese translations. Listing and reason: P25–P26. |
| P34 | A note already containing `pronunciation` remains unchanged by the conversion. | Scope/conversion bullet 4 and skipped-note example. Listing and reason: P25–P26. |
| P35 | A note remains unchanged when removing its reading would leave a sentence without its subject. | Scope/conversion bullet 4; **足利義満** begins `/あしかが よしみつ/は、…`. Listing and reason: P25–P26. |
| P36 | Production remains unchanged until the normal notebook publication is accepted. | Scope/conversion bullet 5. |
| P37 | Converted notes retain their identity through publication. | Scope/conversion bullet 6: “Converted notes are the same notes.” |
| P38 | Converted notes retain their attached memory trackers after publication. | Goal; Scope/conversion bullet 6; **多大** conversion example. |
| P39 | Converted notes retain their attached recall history after publication. | Goal; Scope/conversion bullet 6; **多大** conversion example. |

Unnumbered source context retained:

- **Purpose:** named reading data supports better note quality; Spelling trains the written form.
- **Conversion delivery:** work happens in the owner’s checkout, by an agent or an unretained script. No conversion code enters this repository. Publication uses `donut notebook publish`. Git diff provides exact-change inspection; production checks supply evidence for retained history.
- **UI scope:** use the existing key-choice controls; no new control is introduced.
- **Owner intervention:** skipped notes may be edited manually or handled individually before publication.
- **Measured baseline:** accepted history `cc485736`, measured 2026-11-11, excluding trash: 750 matching notes; 641 single plain-kana candidates; 56 single non-kana matches; 53 multiple matches; no existing `pronunciation` properties. The source also states 641 additional assimilation units and approximately 11 subject-bearing candidate sentences. These figures remain source context; they do not establish a blanket obligation to convert every candidate despite P35.
- **Deferrals:** other notebooks, removal of legacy slash handling, automatic rewriting of subject-bearing sentences, reading-answer or reading-prompt review, and recording other words’ readings. These do not create additional rejection rules.
- **Rejected approaches and rationale:** no retained temporary conversion script and no production startup migration across every notebook; the latter would alter other owners’ prose without review. The considered title substitution would insert text the author did not write.
