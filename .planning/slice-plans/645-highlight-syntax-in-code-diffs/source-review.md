# Source review

Launch: 2026-11-15, fresh general-purpose subagent (no conversation inheritance, fork or resume) by the execution coordinator before slice 1 delegation. Input: only the selected story section's Goal, Scope, deferred promises, Key examples, UI and Architecture text of SEED-351#highlight-syntax-in-code-diffs, verbatim, with the instruction to read no files, change nothing, and return numbered commitments, examples and exclusions.

Returned exclusions and deferrals (not commitments): X1 grammars beyond the seven; X2 styling by an Intent `syntax` hint; X3 emphasis of changed words; X4 a control to turn styling off or choose a palette; X5 diff-only token colour adjustments (S7c); X6 server or contract change (A5); X7 new UI control, label or message (U1, S8e).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer reviewing a story in the dashboard reads each file diff with its code's syntax styled, so code structure is quick to scan. | slice 2 | |
| G2 | The change in a styled diff stays as easy to follow as it is today. | slice 3 | |
| G3 | Moving between Intent's source reading and a diff shows the same syntax language and the same appearance. | slice 2 | |
| S1 | A story review file diff styles the code of its lines with the token colours Intent's source reading uses (dashboard/src/sourceHighlight.ts). | slice 2 | |
| S2 | Styling applies to every comparison a review shows. | slice 2 | |
| S3a.1 | Intent's source reading and story-review diffs use one syntax-highlighting solution. | slice 2 | |
| S3a.2 | Grammar loading has one shared owner. | slice 2 | |
| S3a.3 | Whole-text tokenization has one shared owner. | slice 2 | |
| S3a.4 | Token representation has one shared owner. | slice 2 | |
| S3a.5 | Rendering has one shared owner. | slice 2 | |
| S3a.6 | Token styling has one shared owner. | slice 2 | |
| S3b | Matching code in the same language, lexical context and system appearance gets the same token colours and syntax styles in both views, on added, removed and revealed lines too. Purpose: no competing implementations and no confusing colour meanings between readers. | slice 2 | |
| S3c | Any palette adjustment needed for readability applies to both views together. | slice 1 | observed: dashboard/src/source-tokens.css single .source-token rule (light 75% mix toward --text, dark high-contrast) imported only by shared SourceTokens.tsx; dashboard-system-appearance.spec.ts commentToken/exportToken expectReadableContrast in dark then light |
| S4a | The file's path selects the grammar from those the dashboard already loads. | slice 2 | |
| S4a.1 | TypeScript: .ts, .mts, .cts | slice 2 | |
| S4a.2 | TSX: .tsx | slice 2 | |
| S4a.3 | JavaScript: .js, .mjs, .cjs, .jsx | slice 2 | |
| S4a.4 | Java: .java | slice 2 | |
| S4a.5 | Python: .py | slice 2 | |
| S4a.6 | Shell: .sh, .bash | slice 2 | |
| S4a.7 | Gherkin: .feature | slice 2 | |
| S4b | A renamed file is styled by its new path. | slice 2 | |
| S4c | Any other file reads as plain text, as it does today. | slice 2 | |
| S5a | Added lines are styled as they read in the new file, using the new side's whole text. | slice 2 | |
| S5b | Unchanged lines, including revealed context lines, are styled as they read in the new file, using the new side's whole text. | slice 2 | |
| S5c | Removed lines are styled as they read in the old file, using the old side's whole text. | slice 2 | |
| S5d | A line inside a comment or string that opens outside the printed hunk is styled as part of that comment or string. | slice 2 | |
| S6a | Each line keeps its +, - or space marker. | slice 2 | |
| S6b | Each line keeps its line numbers. | slice 2 | |
| S6c | Each line keeps its added or removed background. | slice 2 | |
| S6d | Token colour never replaces the marker, line numbers or change background. | slice 2 | |
| S7a | Every token meets the North Star's 4.5:1 text contrast against its line's composed background, on added, removed and unchanged lines, in both light and dark appearance. | slice 2 | |
| S7b | A change of system appearance restyles tokens already shown. | slice 2 | |
| S7c | Intent's source reading and diffs keep one token palette and one style rule, with no diff-only token colour adjustment. | slice 2 | |
| S8a | The diff shows as plain text first, as today. | slice 3 | |
| S8b | Styling arrives once the file's text and grammar have been read. | slice 3 | |
| S8c.1 | Styling's arrival does not move the reading position. | slice 3 | |
| S8c.2 | Styling's arrival does not close an open line menu. | slice 3 | |
| S8c.3 | Styling's arrival does not collapse revealed context. | slice 3 | |
| S8d | If either side's text or the grammar cannot be read, the affected lines stay plain. | slice 3 | |
| S8e | Styling adds no message of its own, including when a read fails. | slice 3 | |
| S9.1 | Copied code is unchanged. | slice 2 | |
| S9.2 | Line-number controls and Follow up are unchanged. | slice 3 | |
| S9.3 | Context expansion and its Retry are unchanged. | slice 3 | |
| S9.4 | The binary note and the no-textual-diff note are unchanged. | slice 3 | |
| S9.5 | What assistive technology reads of each line is unchanged. | slice 2 | |
| U1 | No new control, label or message is added. | slice 3 | |
| U2 | Change kind is conveyed by the marker and the line background, and syntax only by the colour of the code's characters, so neither depends on the other. | slice 2 | |
| A1 | No Accepted decision is affected (ADR 0008). | slice 3 | |
| A2 | Styling stays a browser presentation concern. It uses the existing on-demand highlighter and the shared source-token rendering. | slice 2 | |
| A3 | Styling uses the two reads a diff already makes: its printed hunks and both sides' file text. | slice 2 | |
| A4 | Only choosing the old or new token line belongs to the diff. | slice 2 | |
| A5 | The server and its contracts gain nothing. | slice 3 | |
| A6 | Product wording calls this "syntax styling", as Intent's documentation does, because ADR 0008 gives "Highlight" to the selected Story card. | slice 2 | |
| E1 | Example: Intent and a diff show the same TypeScript code with a keyword, identifier, string and comment. Corresponding tokens get identical colours and syntax styles in source, unchanged, added and removed lines. Switching the system appearance changes both readers together. The diff keeps its markers, line numbers and change backgrounds. | slice 2 | |
| E2 | Example: a modified .ts diff has added, removed and unchanged lines holding `const` and a quoted string. On each kind of line, the keyword and the string differ in colour from each other and from plain identifiers. The added line keeps + and its ready background; the removed line keeps - and its problem background. | slice 2 | |
| E3 | Example: a hunk starts in the middle of a /* … */ comment that opens above the hunk. Its first lines are styled as comment, not as code. | slice 2 | |
| E4 | Example: a removed line was a string in the old file, and the same position is code in the new file. The removed line is styled as a string and the added line as code. | slice 2 | |
| E5 | Example: the reviewer reveals 20 lines above a hunk. The revealed lines arrive styled, and the reading position holds as it does today. | slice 3 | |
| E6 | Example: a comment on an added line in dark appearance reaches 4.5:1 against that line's background. Switching the system to light restyles it in place, again at 4.5:1. | slice 2 | |
| E7 | Example: a README.md or .json diff shows as plain text, exactly as today. | slice 2 | |
| E8 | Example: a file's text at one tree cannot be read, so context expansion shows Retry. The printed diff stays readable as plain text with no further message. After a successful Retry, its lines are styled. | slice 3 | |
| E9 | Example: copying three styled lines puts the same text on the clipboard as copying from the plain diff: markers and code, without line numbers. | slice 2 | |
