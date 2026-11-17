# Independent refactor 8

Delivered the settled split: capture/correction and overflow remain in
`dashboard/frontend-tests/stories/story-note-voice.spec.ts`; setup, permission,
Close/Cancel and transcription failures move unchanged to
`dashboard/frontend-tests/stories/story-note-voice-recovery.spec.ts`.
No production refactor candidate or edit. Existing shared microphone and notes
helpers stay; voicePage.ts untouched228. ADR0002/0008 satisfied.

Both sources select MakeMe and page objects. Read-only Prettier sizes172/132;
all changed sources fit250. No selective formatter or hook lint was run.

Renewal command:
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list --workers=1 stories/story-note-voice.spec.ts stories/story-note-voice-recovery.spec.ts`
Four passed12.9s. Typecheck and whitespace passed. Capture spec:19/:59 observes
held permission/transcription, busy, correction/exact contextual POST; :68
observes overflow/shortening/discard and keyboard order. Recovery:20 observes
setup/same-draft/permission refusal; :46 observes Close track release, zero
clip, Cancel abort, no late text and failed draft retained.

Installed trace command:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/capture-and-edit-story-notes-in-the-dashboard --path dashboard/frontend-tests/stories/story-note-voice.spec.ts --path dashboard/frontend-tests/stories/story-note-voice-recovery.spec.ts --term storyNoteVoicePage --term story-note-voice.spec.ts --term story-note-voice-recovery.spec.ts`
Whole checkout7037 files, baseabaf51cf3523. Located rows: shared
storyNoteVoicePage owner run by four renewed purposes; PLAN/proof-map excluded
from executable boundary and updated by root; slice8 consumer/guidance/proof
records retain historical discovery and now link this renewal. No other
production, test or journey consumers. Incoming F1 other cases, E1 and F2
unchanged; no further reruns. Root inspected relocated cases and proof mapping.

Sequential1worker on AC16cores48GiB; load9.20/12.76/10.05 before launch;
no competing owned heavy command. Approximately10 active minutes. No gap,
deferred observation, rename or deletion beyond the described test split.
