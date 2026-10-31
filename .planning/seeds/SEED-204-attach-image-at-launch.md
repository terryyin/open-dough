---
id: SEED-204
status: active
planted: 2026-10-31
planted_during: Terry's request to queue image attachment for dashboard session starts
trigger_when: A developer wants to show the agent an image when starting a dashboard session
scope: one story
---

# SEED-204: Attach an image when starting a session

## Why This Matters

A developer often starts a session about something they can see: a dashboard
glitch, a mockup, an error dialog. Today they must save the image somewhere
and type its path into the instruction. A clipboard screenshot (for example
macOS Control-Shift-Command-4) has no file at all. Attaching the image in the
launch dialog removes that detour for every host.

## Alternatives and Decision

- **Selected:** an attachment tray in the shared launch dialog. Images stay in
  the browser until Start, travel with the launch, are copied into a folder the
  dashboard owns for that launch, and the server appends a numbered list of
  their absolute paths after the developer's text. Every host gets the same
  plain-text paths.
- **Simplest existing alternative:** save the file and type its path. It
  already works, but it cannot take a clipboard screenshot directly, and it
  tempts saving into the workspace, where landing commits every change.
- **Host-native image input** (Codex `turn/start` image items): rejected; the
  hosts have no common native image input, and the story wants one path.
- **Copy into the session's workspace:** rejected; Dough Land commits all of a
  workspace's changes, and story workspaces do not exist until their start
  runs.
- **Borrowed mechanism, e-mail compose attachments:** the launch dialog is the
  compose window, attachment chips are the attachment tray, Start is Send, and
  the dashboard's folder is the mail store; the body references what is
  attached. The analogy breaks at ownership: an e-mail recipient keeps a copy,
  while the agent gets only a path, so the file's lifetime is the dashboard's
  to decide. The GitHub-comment variant, which uploads on
  paste and inserts a link into the text, was considered: it lets the text
  point at an image in place, but it sends data before Start and spends the
  4,000-character instruction limit.

<a id="attach-image-at-launch"></a>

### Attach an image when starting a session

**Identity:** SEED-204#attach-image-at-launch
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/427-attach-image-at-launch/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"07975bc1c45a170c6439afc3fbc7efb39115ea32c89d98f5f19f26c01957b2a5","plan":"5aaa28c62d498ec6d45c11df2410712ca1e97265ed7d57385f1c42966752fe8e"}}
```

**Goal:** A developer starting any dashboard session can attach one or more
images in the launch dialog, and the started session's first input names each
image's local file path, so the agent can open it without the developer saving
or typing paths first.

**Scope:**

Required behavior:

- One attachment capability in the shared launch dialog (`LaunchDialog`), so
  Start session, Start execution and Start refinement gain it identically, with
  the same wording, controls and limits. No per-dialog variant.
- Add images by an Attach images control (file picker, several at once) and by
  pasting an image into the instruction field. Pasted text keeps its normal
  behavior.
- Attached images show in the dialog as a numbered list (`Image 1 ·
  screenshot.png`, with a small preview), each with Remove. Removing renumbers
  the remaining images. The developer may refer to them by number in the text.
- The dialog sends nothing on Cancel or Escape, as today: images reach the
  dashboard server only with Start (Terry, 2026-10-31). A launch that is not accepted closes the
  dialog and discards its images, as it discards the instruction; the
  existing-changes confirmation keeps them, and Continue sends them again.
- The server copies each image into a folder it owns for that launch, outside
  any workspace, and appends after the developer's text an "Attached images"
  list of numbered absolute paths. The list is not counted in the 4,000
  character instruction limit. The same input reaches Claude Code, Codex and
  Cursor, including a story start's handoff and an ad hoc session's
  established-session block.
- The copied images are kept with their launch attempt and removed when that
  settled attempt is pruned after 30 days, so recovery, Continue and a later
  resumed session still find them (Terry, 2026-10-31).
- Images never enter launch records, attempts or start stores as bytes; those
  records hold only the paths.

Required restrictions (each protects the local server's bounded request
handling and what hosts can read as an image):

- Accepted types: PNG, JPEG, GIF and WebP. Each image is at most 10 MB, and a
  launch carries at most 5. A refused file is named with its reason in the
  dialog, and the instruction, other images and choices remain.
- The dashboard overrides no host permission: if a host asks before reading a
  file outside its workspace, the developer answers as usual.

Scope limits (deferred, not rejected):

- Dropping files onto the dialog.
- Non-image attachments, and attaching images to an already running session.
- Showing attachments in session history or the Sessions sidebar.

Boundary assumptions:

- A blank instruction with images is not a blank start: its first input is the
  image list. A Cursor start with a chosen model and only images is therefore
  allowed.
- An ad hoc launch's identity includes its images (by content), so the same
  text with different images is a different session.

**Key examples:**

- Start session with the text "Why is this card clipped?" and a pasted
  screenshot → the session opens, and its first input is the text followed by
  "Attached images: 1. /…/launch-attachments/<launch>/1-pasted.png"; the agent
  reads that file.
- Start refinement on a story with two picked mockups and no text → the first
  input is the skill line, the established preparation handoff, then the two
  numbered paths.
- Attach two images, remove Image 1, then Start → one path is sent, numbered 1.
- Pick a PDF and a 14 MB PNG → both are refused with "Not an image (PNG, JPEG,
  GIF or WebP)" and "Larger than 10 MB"; the text and other attachments remain.
- Attach an image, press Cancel → nothing is uploaded; reopening the dialog
  shows no attachment.
- A Default main start shows Existing changes → Back keeps the images in the
  dialog; Continue with existing changes starts with them.
- A Codex launch whose first input was unconfirmed is continued from Startup
  recovery → the same paths are sent and the files are still there.

**Architecture:**

Attachments are machine-local operational evidence of a launch (ADR 0008), so
they live under the dashboard's machine directory
(`~/.open-dough/dashboard/launch-attachments/<launch attempt>/`), never in a
repository or workspace. The launch request stays the one Start submission;
image bytes must not raise the 32 KB JSON bound for every other request or be
written into the JSON stores, so the plan chooses a transport that keeps them
out of both (for example a bounded raw-body upload like the dictation clip,
claimed by the Start request). Files are written only after the boundary admits
the launch, and a refused launch leaves no files.

## When to Surface

When a developer wants to show the agent an image when starting a dashboard
session.

## Breadcrumbs

- `dashboard/src/LaunchDialog.tsx` — shared launch dialog.
- `dashboard/AGENT-LAUNCH.md`, `dashboard/LAUNCH-START.md`,
  `dashboard/AGENT-LAUNCH-HOSTS.md` — launch contract and first-input
  composition.
- `dashboard/server/instructionAudio.ts` — existing bounded binary upload.
- `dashboard/server/unattachedInput.ts` — ad hoc first input.
