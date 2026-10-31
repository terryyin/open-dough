# Attach an image when starting a session

**Identity:** SEED-204#attach-image-at-launch
**Source:** [Refined story](../../seeds/SEED-204-attach-image-at-launch.md#attach-image-at-launch)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Every launch dialog (Start session, Start execution, Start refinement) lets
the developer attach up to 5 PNG, JPEG, GIF or WebP images of at most 10 MB
each, by picker or by pasting into the instruction field. The images reach the
server only with Start. The server copies them into
`~/.open-dough/dashboard/launch-attachments/<attempt>/` and appends a numbered
"Attached images" list of their absolute paths after the developer's text in
the first input on every host. They are kept until the settled attempt is
pruned after 30 days. The source owns the decisions (Terry, 2026-10-31), the
deferred promises and the key examples.

Exclusions (deferred in the source): dropping files onto the dialog,
non-image files, attaching to a running session, and showing attachments in
history or the Sessions sidebar.

Useful stopping points: after slice 2, an ad hoc Claude Code session can be
started with picked images. After slice 3, every workflow and host receives
them. Later slices add paste, refusals, lifecycle and images-only starts.

## Design and reuse

Consistent with Accepted
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
attachments are machine-local operational evidence of a launch, kept under the
machine dashboard home (`server/machineHome.ts`), never in a repository or
workspace. The dashboard overrides no host permission (`AGENT-LAUNCH.md`), so
a host that asks before reading outside its workspace is answered by the
developer. No ADR conflict and no North Star topic is warranted.

PFE:

- **Bounded binary upload:** `server/instructionAudio.ts` already reads one
  bounded raw body by content type and length, refusing with 413/415. Reuse
  that reading (generalize it into one bounded body reader if both need it)
  instead of raising the 32 KB `jsonRequestBody.ts` bound that the launch
  request (`agentLaunchAdmission.ts`) and every other JSON boundary share.
  The transport keeps image bytes out of every JSON request and store. A
  single Start submission stays the commit point: for example, the dialog
  sends the images and the launch request together at Start, and nothing goes
  before Start. Execution chooses the concrete encoding.
- **First input composition:** Claude (`server/hosts/claude/launch.ts`),
  Codex (`server/hosts/codex/input.ts`), Cursor (`server/hosts/cursor/prompt.ts`)
  and the ad hoc input (`server/unattachedInput.ts`) each take the developer's
  part as `request.instruction?.trim()`. One shared developer-part function
  (text, then the "Attached images" list) replaces those four reads, so every
  host and workflow gets the same rule. The recorded request keeps only the
  paths, so recovery and Codex's saved first input resend the same text.
- **Per-attempt cleanup:** `replaceAttempts` in `server/launchAttemptStore.ts`
  already collects attempts pruned past retention and removes their kept
  session starts (`removeSessionStart`). Attachment folders are removed at that
  same point, only after a successful write.
- **Ad hoc label and identity:** `hostLaunch.ts` derives the session label
  from the developer's text, and `sameLaunch` (`src/launchRequest.ts`) matches
  ad hoc launches by exact text. The label keeps using the text alone (time
  when blank), and identity adds the images' content digests.

## Outside-in proof

| Promise (source) | Owning slice | Observable proof |
| --- | --- | --- |
| A host can open an image at an absolute path outside its workspace | 1 | Waived by developer (2026-10-31); premise retained without native round |
| Picked images reach the first input as numbered paths to copied files | 2 | Playwright ad hoc spec with fake Claude: argv prompt ends with the list; each file's bytes equal the picked file |
| Remove renumbers and sends only the rest | 2 | Same spec: attach two, remove Image 1, Start |
| Same dialog control in story starts; same list on Codex and Cursor | 3 | Story refinement spec (handoff then list) and ad hoc Codex and Cursor specs reading their first input |
| Pasting an image adds it; pasting text is unchanged | 4 | Playwright paste of an image and of text into the field |
| Non-image, oversized and sixth images are refused with reasons; draft stays | 5 | Playwright dialog spec; focused unit proof that the boundary refuses the same cases with nothing written |
| Cancel uploads nothing; a refused launch leaves no files | 6 | Spec: Cancel then reopen shows none, no attachment folder; boundary refusal leaves none |
| Existing-changes Back keeps images; Continue sends them | 6 | Default main existing-changes spec |
| Recovery and Continue resend the same paths to existing files | 6 | Unconfirmed-input continuation spec |
| Folders removed with their pruned attempt | 6 | Focused store proof with a settled attempt past 30 days |
| Images-only start is not blank; Cursor with model allowed; identity includes images | 7 | Ad hoc specs (Claude, Cursor) and a `sameLaunch` unit proof |

Every slice updates the launch documentation it changes
(`dashboard/AGENT-LAUNCH.md`, `LAUNCH-START.md`, `AGENT-LAUNCH-HOSTS.md`).

## Decisive premises

- **Fake-host route observes the first input.** Consuming operation: the dialog
  submits through the real boundary and fake Claude records argv. Observation
  (2026-10-31, this workspace, after `node scripts/setup-native.mjs npm` and
  `browser`): `npx playwright test --config dashboard/playwright.config.ts
  dashboard/tests/agent-launch-ad-hoc.spec.ts -g "starting with text sends it"
  --reporter=list` → 1 passed; it asserts the instruction in fake Claude's argv
  through `expectNamedAdHocCall`. The test `HOME` is isolated
  (`dashboard.home`), and `machineDashboardPath` resolves through `HOME`, so
  the attachment folder can be checked under it.
- **Where the developer's text is read.** Consuming operations: first-input
  composition, blank detection, label and identity. Observation (2026-10-31):
  `grep -rn "\.instruction\b" dashboard/server dashboard/src` lists the four
  composers above; `src/unattachedSession.ts` (whether an ad hoc request has
  input, which slice 7 must extend to images); `server/hostLaunch.ts` (label);
  `src/launchRequest.ts` `sameLaunch` (identity, slice 7); and readers of the
  already-composed saved first input (Cursor `recoveryReplacement.ts`,
  `unconfirmedReplacement.ts`, Codex `recovery.ts`), which carry the list
  unchanged because it is part of the composed text. Slice 3's per-host proofs
  observe the result on every host, so a missed composer fails there.
- **Hosts can read the copied file.** Only a paid native run can settle it, so
  slice 1 is an early developer-operated probe whose failure stops slices 2–7
  and changes where files are kept.

## Slices

### 1. Each host can open an image outside its workspace

Type: Behavior (early probe, developer-operated, paid)
Status: done
Proof: waived — developer skipped the native host round (2026-10-31); remaining
slices keep the machine-local `launch-attachments` location under ADR 0008

Behavior: a PNG at `~/.open-dough/dashboard/launch-attachments/probe/1-probe.png`
→ the developer starts Claude Code, Codex and Cursor in a project worktree with
"Describe the image at <absolute path>" → each host describes it, possibly
after its usual permission question. Steps the developer performs: copy any
screenshot to that path, run each host's CLI in an Open Dough worktree, answer
any permission prompt, and report what each host said. A host that cannot
read it stops slices 2–7 for replanning (for example a location the host can
read). Remove the probe folder afterwards. Waived in place: probe folder
removed; no native CLI round run.

### 2. A Start session with picked images sends their copied paths

Type: Behavior
Status: done
Proof: accepted — `dashboard/tests/agent-launch-ad-hoc-attachments.spec.ts`
(attach two, remove Image 1, Start → fake Claude argv + copied bytes under test
HOME `launch-attachments`); `dashboard/tests/boundary/developer-part.spec.ts`.
Shared foundation: `LaunchAttachments` in `LaunchDialog`, bounded raw-body
claims, materialize after admit, `developerPart` in all four composers.

Behavior: the Start session dialog with text "Why is this card clipped?" →
the developer chooses Attach images, picks two PNGs, removes Image 1, presses
Start → the dialog showed `Image 1 · <name>` with a preview and Remove, and
renumbered after removal; fake Claude's prompt is the text, a blank line, then
`Attached images:` and `1. <path>`; that path lies under the test home's
`.open-dough/dashboard/launch-attachments/<attempt>/` and holds the picked
bytes. Includes the shared dialog control in `LaunchDialog`, the bounded image
transport, the copy after admission, the shared developer-part function used by
all four composers, and the recorded request holding paths only.

### 3. Story starts and every host receive the same list

Type: Behavior
Status: planned
Proof: story refinement start spec (Claude); ad hoc Codex and Cursor specs

Behavior: a Start refinement dialog with two picked images and no text →
Start → the first input is the skill line, the established preparation
handoff, the reporting context, then the list. Ad hoc Codex and Cursor starts
with one image → Codex's text input item and Cursor's prompt end with the same
list. Adds no per-host branch; fixes any composer slice 2 missed.

### 4. Pasting an image into the instruction field attaches it

Type: Behavior
Status: planned
Proof: Playwright paste into the field

Behavior: clipboard holds an image → paste into the instruction field → it is
listed as the next numbered image (named `pasted.png` when the clipboard gives
no name) and the text is unchanged; pasting text still inserts text.

### 5. Unsuitable images are refused with a reason, keeping the draft

Type: Behavior
Status: planned
Proof: Playwright dialog spec; focused unit proof at the boundary

Behavior: a PDF, a 14 MB PNG, and a sixth image → each is refused in the
dialog with "Not an image (PNG, JPEG, GIF or WebP)", "Larger than 10 MB", or
"At most 5 images"; the text, other images and choices remain. The boundary
refuses the same cases on its own (it bounds what it reads), writing no file
and starting nothing.

### 6. Attachments follow the launch's lifecycle

Type: Behavior
Status: planned
Proof: Playwright specs for Cancel, existing changes and continuation; focused
store proof for pruning

Behavior:

- Attach, then Cancel → no request carried images and no attachment folder
  exists; reopening shows none. A launch the boundary refuses leaves no folder.
- Default main with existing changes → Back keeps the images; Continue with
  existing changes sends them, copied once.
- An unconfirmed first input continued from Startup recovery → the same paths
  are sent and still exist.
- A settled attempt past 30 days is pruned on the next successful attempt
  write → its folder is removed; a refused write removes none.

### 7. An images-only start is a start with input

Type: Behavior
Status: planned
Proof: ad hoc Claude and Cursor specs; `sameLaunch` unit proof

Behavior: Start session with no text and one image → the first input is the
list alone, and the label is the time, as for blank text. A Cursor start with
a chosen model and only an image is admitted (`src/unattachedSession.ts`
counts images as input). Two ad hoc requests with the
same text and different images are different launches; identical ones match.

## Story obligations

### G1. Dropping files onto the dialog
Reported: slice 2 — "Dropping files onto the dialog is out of scope for now."
Story clause: "Dropping files onto the dialog."
Disposition: excluded "Dropping files onto the dialog."
Commitment: X1

### G2. Non-image attachments and attaching to a running session
Reported: slice 2 — "Non-image attachments, and attaching images to an already running session."
Story clause: "Non-image attachments, and attaching images to an already running session."
Disposition: excluded "Non-image attachments, and attaching images to an already running session."
Commitment: X2, X3

### G3. Showing attachments in history or the Sessions sidebar
Reported: slice 2 — "Showing attachments in session history or the Sessions sidebar."
Story clause: "Showing attachments in session history or the Sessions sidebar."
Disposition: excluded "Showing attachments in session history or the Sessions sidebar."
Commitment: X4, X5

## Current decisions

- Images leave the browser only at Start, and are kept with their launch
  attempt until it is pruned (Terry, 2026-10-31, in the source).
- The list is server-composed, after the developer's text, not counted in the
  4,000-character limit, and identical for every host.
- Slice 1 native host probe skipped by developer (2026-10-31). Hosts are
  assumed able to open absolute paths under
  `~/.open-dough/dashboard/launch-attachments/`; if a later host cannot, stop
  and replan the keep location.

## Plan review

Slice-plan refinement was not needed: each slice has one outcome and one
proof loop, and slices 3–7 extend slice 2's single rule (developer part = text
plus list) rather than adding recognizers. No remaining slice-specific concern
beyond slice 1's probe, which bounds the one unobserved premise.

## Local verification

Run each slice's named specs with `--reporter=list` and the focused unit
tests through `bash scripts/test.sh <paths>`. Before publishing, run the full
`npm test` and the dashboard suite, since slice 2 changes the shared first
input of every launch path.
