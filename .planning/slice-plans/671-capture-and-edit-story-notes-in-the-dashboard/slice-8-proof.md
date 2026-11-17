# Slice 8 acceptance

Root inspected hook defaults/note wording, busy/cancel/suspended dialog handling,
public recording reset versus internal unmount release, four note-voice cases,
native microphone observations, exact corrected Taken-line POST and real
workspace restart readback. No remaining product mismatch.

[Consumer and proof record](slice-8-consumers.md) retains exact F1/F2/E1
commands, terminal results and source commitment mapping; [guidance rows](slice-8-guidance-consumers.md)
retain the rest of the generated trace. F1 23 passed49.5s, E1 16 passed53.8s,
F2 8 passed13.9s; final caller-supplied keyboard-stop convention adjustment
renewed four note-voice cases16.8s. Types and whitespace passed. Initial six
strict status-selector failures repaired by observing the collection's actual
announcement; exact text/cardinality/composer-removal checks remain.

Commitment3 directly reuses rerun contextual Taken→new launch→Done/no workspace
retention;5 now has actual line-context restart;39–43 and70 exercise permission,
recording, transcription, setup, correction/save and Dictate. No audio hardware
claim beyond the native synthetic microphone. Implementer about9 active minutes.

## Reorganization decision before delivery

Read-only Prettier API measurement shows new story-note-voice.spec.ts expands
from168 raw to282 formatted lines. Separate its successful Taken capture and
transcript-review cases from setup, cancellation and failure recovery in a
story-note-voice-recovery.spec.ts sibling. These are independent behavioral
purposes using the existing shared note/microphone helpers; keep those helpers
and observations. Refactor owns this slice-8 test organization and renews all
four moved/retained note-voice cases; unchanged launch/store/real-restart proof
remains applicable unless another edit invalidates its boundary.

StoryNotesDialog formats to223 lines and new voice page object to76; no split
needed for either. voicePage remains untouched228 as planned.

Freshness settled unchanged selected source and plan at trunk
`1a21d9a44ca019ec95392437995f622c5a5cfd7a`. New attachment preparation is
only an agent announcement; no selected-story or sibling-outcome change.
Other upstream changes add release guidance, unrelated planning records and
worker preparation before fixture-server start. Current checkout proof basis
is unchanged; final integration needs target CI on the merged harness.

Fresh independent refactor delivered the settled behavioral split and renewed
all four cases (12.9s), types and whitespace. No production edits or other
candidate; all formatted sources fit250. Root updated plan/proof-map and
39–42 observation paths. Existing F1 other cases, E1 and F2 remain valid.
[Exact refactor trace/proof](slice-8-refactor.md); about10 active minutes.
