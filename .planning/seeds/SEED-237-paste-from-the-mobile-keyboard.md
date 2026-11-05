---
id: SEED-237
status: active
planted: 2026-11-05
planted_during: Terry Yin's request for a Paste button on the dashboard's mobile keyboard
trigger_when: A developer wants to paste from their device into a dashboard session on mobile
scope: story
---

# SEED-237 — Paste from the mobile keyboard

<a id="paste-from-the-mobile-keyboard"></a>

### Paste from the mobile keyboard

**Identity:** SEED-237#paste-from-the-mobile-keyboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/470-paste-from-the-mobile-keyboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"411d1a4281448d2b907b2e248252730d8d5f6653546b41fafb7798190e4260a9","plan":"5b7514f1ba20fe1df716ff70ef592bad3244643226bc844ab14422d433efded8"}}
```

A developer using the dashboard on a phone can tap **Paste** on the virtual
keyboard below the session to paste the device's current clipboard contents
into that session. Preserve the content type wherever the receiving tool
supports it.

- Copy text on the phone and tap **Paste**. The text reaches the current
  session.
- Copy an image on the phone and tap **Paste** in a session whose tool
  supports image paste, such as Claude Code. The tool receives a usable image.

Refined 2026-11-05 with explore, borrow, challenge, clarify, investigate,
UX/UI and architecture.

#### Goal

A developer working a session from a phone (Terry, reaching the dashboard over
its Tailscale HTTPS address) has copied text or a screenshot on the phone and
wants it in the shown session without a desktop. Today the phone key toolbar
above the soft keyboard supplies Esc, Tab, arrows, Enter, Ctrl+C and the
Compose draft, but nothing reads the phone's clipboard; the only route is the
browser's own long-press paste into a visible field, which the terminal does
not offer and Compose offers for text only. The story adds one **Paste** key
to that toolbar: text arrives in the session as one paste, and an image
arrives as a file on this machine whose absolute path is pasted, the same way
the dashboard already hands launch images to every host. The observable
outcome is the pasted content in the session's terminal; whether the agent
then uses it stays the agent's behavior.

#### Scope

Required behavior:

- **Paste key.** The phone key toolbar (coarse-pointer chrome only, as today)
  shows **Paste** without expanding **More**. Activating it reads the phone's
  clipboard through the browser's asynchronous clipboard API from that tap,
  keeps the soft keyboard's current visibility like the other keys, and
  offers the result once on the live attachment. The key never appends
  Enter; the developer submits deliberately.
- **Text.** When the clipboard offers text and no accepted image, the text is
  delivered as one terminal paste on the existing attachment input path (the
  same page → WebSocket → PTY path typing uses). A paste, not typed lines:
  when the native tool has asked for bracketed paste, the text is wrapped as
  the tool expects and line breaks do not submit it; existing typed input
  stays. Terminal control sequences in clipboard text are removed as
  dictation removes them.
- **Image.** When the clipboard offers an image of an accepted launch type
  (PNG, JPEG, GIF or WebP; phones give PNG), the bytes are posted to the
  local dashboard server as one bounded raw body with the launch attachment
  limits (10 MB, accepted types), stored on this machine under the dashboard
  home beside that host-qualified session, and the file's absolute path is
  pasted into the session as text, with nothing else and no Enter. The image
  wins when the clipboard carries both an image and text. Store and request
  never carry image bytes in JSON or in a repository (ADR 0008 keeps this
  machine-local operational state).
- **Feedback and recovery**, in the terminal's status region the dictation
  feedback already uses, each a short sentence: nothing to paste (empty or
  unsupported clipboard); the browser refused or lacks clipboard access, with
  the recovery of pasting into Compose with the keyboard's own Paste; the
  image was refused by the server with its reason (too large, not an
  accepted image, could not be stored); the attachment could not accept input
  (disconnected, ended, refused), with the recovery of reconnecting and
  tapping Paste again. Nothing is kept pending and nothing is replayed: the
  clipboard still holds the content.
- **Unchanged.** Fine-pointer desktop keeps today's terminal paste (the
  browser's own Cmd+V through the terminal) and shows no toolbar. Direct
  typing, Compose Insert, dictation, toolbar keys and their focus behavior
  keep their contracts.

Deferred promises (not rejections):

- Pasting an image on desktop through the terminal's own paste event, and
  pasting both text and image from one clipboard, stay unimplemented.
- Removing pasted session images later (with Delete record or by age) is
  deferred; the files stay under the dashboard home for that session, as
  launch attachments stay with their attempt.
- Any confirmation that the agent read the image is deferred: as for launch
  attachments and dictation, the dashboard confirms a local offer, not a
  native receipt.

Scope limits: no change to how hosts receive images (the path convention of
launch attachments is reused, not redesigned); no physical-device or
remote-connectivity proof beyond the local Chromium journeys the terminal
already uses; no new host-specific paste key bindings; no clipboard
injection on the Mac.

Required restrictions, each with its independent reason: image size and type
limits reuse the launch attachment limits because the same bounded raw body
boundary and the same hosts consume the file; the upload endpoint stays on
loopback behind the existing local-origin check because every dashboard
boundary does (the Tailscale proxy already forwards only same-origin
`/__*` requests).

#### Key examples

1. **Text.** A session's terminal is shown on a phone and attached; the
   clipboard holds `Why is this card clipped?` → tap **Paste** → the
   terminal sends exactly that text on the attachment's input path, the
   native screen shows it at the prompt unsubmitted, the soft keyboard stays
   as it was, and no Enter is sent.
2. **Multi-line text with bracketed paste.** The native tool has enabled
   bracketed paste and the clipboard holds two lines → tap **Paste** → one
   paste wrapped in the bracketed-paste markers reaches the PTY, both lines
   are at the prompt, and nothing is submitted.
3. **Image.** The clipboard holds a PNG screenshot → tap **Paste** → the
   server stores the PNG under the dashboard home for that host-qualified
   session with the bytes unchanged, the terminal sends that absolute path as
   text, the status region says the image was pasted as that file, and no
   Enter is sent. The same path form the launch's `Attached images:` list
   uses, so Claude Code, Codex and Cursor can read it as they read launch
   images.
4. **Nothing to paste.** The clipboard is empty or holds only a type the
   session cannot take → tap **Paste** → nothing is sent; the status region
   says there was nothing to paste.
5. **Clipboard unavailable.** The browser refuses the read (permission
   declined or no clipboard API) → tap **Paste** → nothing is sent; the
   status region says the clipboard could not be read and points to Compose
   with the keyboard's own Paste.
6. **Attachment cannot accept input.** The terminal is disconnected or ended
   → tap **Paste** → nothing is sent and nothing is retained; the status
   region says to reconnect, then tap Paste again. Reconnecting replays
   nothing.
7. **Image refused.** The clipboard holds a 12 MB PNG → tap **Paste** → the
   server refuses it with the launch wording for a too-large image, nothing
   is pasted, and the terminal stays attached.
8. **Desktop unchanged.** On a fine-pointer desktop view the toolbar and
   Paste are absent; Cmd+V through the terminal pastes text as today.

#### UI

Paste is one more key on the existing phone key toolbar, visible beside Enter
without expanding More, with the toolbar's 44px target and label `Paste`.
Feedback appears as one line in the terminal's status region, where dictation
reports, and clears on the next successful paste. On iOS the browser may show
its own paste confirmation before granting the read; the page does nothing
special for it. No layout, component or technology beyond that is chosen.

#### Architecture

Consequences, judged against [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md):

- The page reads the phone clipboard itself, which needs a secure context.
  The phone reaches the dashboard through Tailscale Serve
  (`https://territory.tailb878f6.ts.net` → Caddy on 127.0.0.1:43128 →
  127.0.0.1:4173, observed 2026-11-05), so the context is secure. Plain
  `http://<lan-ip>` access would have no clipboard API; that is a deployment
  fact, not a product promise.
- Image delivery reuses the launch attachment contract (bounded raw body,
  limits, name sanitizing, absolute-path hand-off to the host) and adds one
  small responsibility: a session-scoped image store under the dashboard
  home and a loopback boundary that writes it. Machine-local operational
  state, never repository or workspace content, as ADR 0008 requires and the
  launch attachment claims already state.
- Text delivery stays on the one attachment input path; the attachment gains
  a paste offer beside its insert offer so the terminal's own bracketed-paste
  handling applies. No new transport, process, store format or host contract.
- The rejected alternative, placing the image on the Mac's clipboard and
  sending a host paste key, would mutate developer state outside the
  dashboard and depend on per-host key bindings; it is not pursued.

No conflict with an Accepted decision was found. Vocabulary: Session, Side
panel, phone key toolbar, Paste.

#### Refinement notes

- **Explored.** (a) Paste key reading the clipboard, recommended; (b) rely on
  the browser's long-press paste on the terminal's hidden input, which the
  one-finger scroll handling and the invisible field make unreliable and
  which needs a physical phone to judge; (c) Compose, then the keyboard's own
  Paste, then Insert, which exists today for text only and takes three taps
  behind More. For images: path hand-off (chosen, the launch precedent);
  clipboard injection on the Mac plus a host key (rejected above); base64
  text into the PTY (unreadable by the agent, rejected).
- **Borrowed.** A cloakroom ticket: the item is deposited at a counter and a
  ticket travels with the guest. Here the image is deposited in the dashboard
  home and its path travels into the session; the agent redeems it by reading
  the file. The analogy breaks at redemption: a cloakroom hands the item back
  and knows it did, while nothing confirms the agent read the file, so the
  dashboard promises the offer only.
- **Challenged.** Strongest doubt: a toolbar Paste could meet its wording yet
  submit prematurely if multi-line text were typed line by line; hence
  delivery as a terminal paste with bracketed-paste handling. A second doubt,
  that iOS asks the user to confirm the paste once more, changes the tap
  count on iOS, not the outcome; only a physical iPhone can observe it.
- **Investigated.** Facts: the Tailscale/Caddy route above; WebKit reads
  `text/plain`, `text/html`, `text/uri-list` and `image/png` through the
  asynchronous clipboard API from a click or touch handler
  (<https://webkit.org/blog/10855>); headless Chromium with granted
  clipboard permissions reads an `image/png` item and text back through
  `navigator.clipboard.read()` from a button tap on a loopback origin, in a
  desktop and a Pixel 7 touch context (scratch probe, 2026-11-05); every host
  already receives launch images as an absolute-path list
  ([agent launch](../../dashboard/AGENT-LAUNCH.md),
  [hosts](../../dashboard/AGENT-LAUNCH-HOSTS.md)). Hypotheses left open and
  not blocking: that each host reads a bare pasted path as an image mid
  session (settled only by a paid native run; the launch precedent is the
  evidence), and the iOS confirmation behavior above.
- The planted example named "Clocko"; this refinement reads it as Claude
  Code, whose launch images already arrive by path.
