# Choose clear follow-up context

**Identity:** SEED-415#choose-clear-follow-up-context
**Source:** [Choose clear follow-up context](../../seeds/SEED-415-choose-clear-follow-up-context.md#choose-clear-follow-up-context)

## Goal and scope

From a published whole-story comparison or one recorded session range in
Intent, a developer can start Follow up with the exact reviewed target and
choose which sessions and waiting notes to send. The receiving session gets
the story and current request every time, with each selected item clearly tied
to its own evidence. [Combined comparison follow-up](../../seeds/SEED-418-review-published-session-changes.md#review-selected-sessions-together),
the review's Sessions picker, story-linked admission, and Board cues have
their own stories. File and line entry points use the same composer as the
story's Follow up.

## Current decisions

- Follow the Dashboard North Star's [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  by carrying the comparison, session scope and literal file or line from
  the current review. Follow [Start ad hoc work under a story](../../../docs/dashboard-ux-ui-north-star.md#start-ad-hoc-work-under-a-story)
  by starting a distinct session for the source story and preserving the
  launch recovery path. Fit the existing source and admission owners as
  [SEED-427](../../seeds/SEED-427-review-published-changes.md#review-published-changes)
  and [SEED-426](../../seeds/SEED-426-start-ad-hoc-work-under-a-story.md#start-ad-hoc-work-under-a-story)
  land their changes. The existing whole-story and published-session reads
  give each a testable source before the within-story picker ships.
- One follow-up carries a required source and the developer's explicit
  attachment choices. Use the same eligible-context rule in the composer
  and admission. Admit by stable identity against the configured project
  and reviewed evidence, resolve the chosen facts on the server, and retain
  the resolved input for the attempt. Use Git for published story association
  and session ranges, with matching local evidence supplying retained text.
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).
- Reuse the typed source and admission in `followUpRequest.ts` and
  `followUpAdmission.ts`, the shared first-input composition in
  `unattachedInput.ts`, and the existing Start session composer. Apply the
  paired section boundaries once for all hosts. Keep old accepted inputs
  resumable, and retain the current handling of blank starts, image paths
  and workflow reporting. Keep Start session focused on launch and place
  context selection and disclosure with the Follow up subject.
- Reuse `storyNotesFor`, the waiting-note read and `storyNoteDelivery.ts`.
  Preserve each note's own recorded view and anchor. A confirmed first
  input marks only the versions delivered. Unchecked, refused and uncertain
  delivery leave notes waiting.
- Reuse the published record reader and `admitPublishedSessionFile`, and
  the existing file/line admission for validation of the exact pair, literal
  path, rename and side. Use the reporting reference to join a published
  record to matching local launch details. Keep separate the selected range
  used as the required source and the ranges included as optional evidence.
- Use the [interactive mockup](../../evidence/SEED-415-follow-up-context.html)
  for disclosure and the message example. The source record and executable
  proof own UUIDs, exact Git endpoints and collision handling. Delete the
  mockup and remove its planning links at story wrap-up.

## Decisive premises

The consuming routes below were exercised in this owned checkout at `097bdf38f`
with Node 24.21.0 and a complete offline `npm ci`. Each observation describes
the baseline. The slices supply proof for the new behavior.

| Consuming operation | Observation and result |
| --- | --- |
| Intent's file and line Follow up can reach native first input. The Review changes line menu supplies the same anchor and waiting-note controls. | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- e2e/intent/intent-story-follow-up.spec.ts e2e/review/story-review-diff-line-follow-up.spec.ts e2e/sessions/recently-done-published-sessions.spec.ts --workers=1 --reporter=dot` passed seven cases. The existing Intent old-line case checks the stub Claude input and terminal focus, and the Review changes case exercises opening and Cancel. |
| Admission reads the pinned story and validates file and line against its comparison. First-input confirmation owns note delivery. | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts dashboard/backend-tests/launches/agent-launch-follow-up-story.spec.ts dashboard/backend-tests/launches/agent-launch-follow-up-notes-delivery.spec.ts dashboard/backend-tests/review/published-session-ranges.spec.ts --workers=1 --reporter=dot` passed 14 HTTP launch cases and six range cases. The HTTP fixture reaches the recorded launch and synthetic native host, including refusal before Start for wrong path, line and side. |
| Mounted Follow up reads waiting and unavailable note states and passes the checkbox choice from Start session. | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts --workers=1 --reporter=dot` passed five cases in Chromium. Current waiting notes become checked when they load. The mounted test observes the submitted choice and Cancel without a launch. |
| A published record can identify an individual range on another machine. Current Follow up needs to consume that source. | The E2E published-session spec above selects the second of two recorded pairs with an excluded intervening commit in a dashboard without that launch. Its file reader shows the second pair's file. The backend range spec checks the same pair on file read and refuses a cross-pair file. Against the real published record at `097bdf38f`, the Dashboard parser resolved UUID `b68c8a3e-617d-4277-8da6-5ad5952a9b43` and 13 reachable ranges, dropping the record's `story` field. The current review helper returns no Follow up comparison from the UUID subject, and `followUpSchema.safeParse` rejects a file anchor naming that UUID. Extend these owners in slices 4 and 5. |
| The mockup illustrates target placement and optional inclusion. Its raw tag boundaries need strengthening. | Invoked its `message` function in Node's `vm` with a new-side line, session two and both line notes. Only the selected session and both note anchors appeared. With no optional selection, only the two required sections appeared. A pasted line consisting of `</follow-up>` produced two identical closing lines. Slice 1 proves framing on the real input. |

## Slices

### 1. The receiving session can identify the current request and its target

Type: Behavior
Status: planned

Behavior: From a Done story's published file or line, start a Follow up with a
typed request containing a literal closing tag, or with a blank request. The
receiving first input has a story section and a distinct current request
section with the exact comparison and target. Literal tagged text stays in
the request body. Retained extras already sent by the composer get their own
sections pending their explicit choices in slices 2 and 3.

**Proof.** Extend the existing Intent file/old-line journey and its receiving
first-input assertion. Use the shared backend follow-up cases and literal-path
fixture for exact renamed paths and wrong anchor refusal. Assert the actual
paired boundaries and file/line facts in received input, plus the existing
blank start and terminal focus. Check the Codex, Claude and Cursor first-input
readers, including the accepted-attempt retry and image-path assembly where the
changed output reaches them. Keep the boundary assertion shared among the host
variants that use the same input envelope.

### 2. A developer chooses individual retained sessions

Type: Behavior
Status: planned

Behavior: From a whole-story comparison with two retained sessions, each box
starts unchecked, each disclosure starts closed, and opening or closing one
preserves its selection. Selecting one sends that session's available request
and report. Leaving both clear sends neither. Each choice names one session,
including where two sessions have the same display title.

**Proof.** Extend the browser story Follow up journey to inspect two entries,
operate the disclosure and selection by keyboard, start a new session and
assert that its first input contains just the chosen session. The HTTP launch
test exercises a foreign session reference with a different story and verifies
that no foreign text is disclosed. Change the selection for a new Start and
prove it cannot reuse the wrong attempt. A Continue uses the prior input.
Use `FollowUpSubject` for the choice behavior and keep the `StartSession.tsx`
launch shell within the file-size limit when wiring it up.

### 3. A developer can inspect and attach the waiting notes together

Type: Behavior
Status: planned

Behavior: From a new-side line with two available waiting notes, review the
collapsed group without toggling it, then start with one selected session and
the notes. Each sent note identifies its own recorded target, including when a
note names an old-side line or another path. With all boxes clear, Start sends
only the story and current request as follow-up context. A missing optional
notes group leaves Start available.

**Proof.** Extend the mounted notes chooser for unchecked, disclosure,
unavailable, Cancel and submitted choice. Exercise the line journey through
the receiving first input and assert the request target independently of both
note targets. Keep the HTTP delivery assertions for the exact note versions
after confirmed, refused and uncertain delivery in
`agent-launch-follow-up-notes-delivery.spec.ts`.

### 4. Published sessions can supply context on a second machine

Type: Behavior
Status: planned

Behavior: From a whole-story comparison, a session associated with the story
in a published record is selectable on a machine that holds no local launch
for it. Selecting that session sends its UUID and recorded attributable ranges.
If the same session also has a matching retained launch, one option carries
both the published facts and its available request and report. A session that
only has retained context still sends those available facts when selected.

**Proof.** Use the real-origin published-session fixture with two disjoint
ranges, a story association and a separate reader. Start from the story and
assert the selected UUID and both recorded pairs in the captured first input.
Include a different-story record in the supply and verify the association
boundary. Exercise the match between a published UUID and a retained launch
in the same candidate rule, preserving the available local context if the
optional publication read is unavailable. Keep the published range and listing
reader checks green.

### 5. Follow up from an individual range preserves that exact source

Type: Behavior
Status: planned

Behavior: On a published session's second recorded range, start Follow up
from its file or old-side line and leave optional attachments clear. Git can
have advanced and the machine need not hold the originating launch. The first
input names the source story, session UUID, range, literal path and line side.
Checking the session adds its optional context separately. If the required
comparison is unavailable, the developer sees why and can return to review.

**Proof.** Extend the second-machine published-range review journey or share
its fixture in a focused Follow up spec. Use the active second range in the
shared file and line controls, inspect the received input with no optional
section, and exercise re-opening with the extra session context selected.
At the typed launch boundary, try a mismatched range or path of the same
session. The server refuses before invoking a native host. Keep the story
status and source attribution proof of ordinary Follow up.

## Concern evidence

Slice-plan refinement was unnecessary. Each slice owns an observable change
and proof through the same follow-up model. The current automatic context
choices are interim through slices 2 and 3. This review found no remaining
slice-specific concern.

## Verification and delivery

- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough page objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  when changing selected tests. Use the existing review and Dashboard page
  objects and keep the default timeout for new tests.
- Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  on edits. In particular trace `followUpContextText`, `sameFollowUpSource`,
  `unattachedInput`, `Attach story notes`, stored attempt readers and the
  host prompt fixtures. Verify the changed output with each reached consumer.
- Local gate: run the focused browser and boundary proof named by each slice,
  with `npm run typecheck:dashboard` when the shared contracts change. For a
  full run, follow the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  and use `caffeinate -s -i` on AC power. Hosted CI runs the normal suites.
  Apply the ordinary post-change refactor, commit and publication gates.
