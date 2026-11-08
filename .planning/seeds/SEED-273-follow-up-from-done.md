---
id: SEED-273
status: active
planted: 2026-11-08
scope: story
---

# Start a follow-up from recently done work

<a id="follow-up-from-done"></a>

### Start a follow-up from recently done work

**Identity:** SEED-273#follow-up-from-done
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/526-follow-up-from-done/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"53540132c9aacfef4906080225e26307e8b9bbd84a361318ce43128ddeee1453","plan":"e909b78b4c52dab8bd0de3b25af5868f99e6466037c9c825e9ff313883b99655"}}
```

#### Goal

A developer who wants more work on something already done, such as a fix, an
adjustment or a question about a completed story, can start a new agent session
from that story or Done session in **Recently done** when its earlier
conversation can no longer be continued. The new session starts with the
context the dashboard still holds, so the developer writes only the new
request instead of re-explaining the finished work.

Nearly every finished story is in that state: on 2026-11-08 this machine's
records held 1,106 Done story sessions, and all but 7 had their workspace
retired, so they offer only **Read final report**.

#### Scope

Required behavior:

- In the Board's **Recently done** Column, a done story's Story card and a
  standalone Session entry offer **Follow up** when no session the entry holds
  offers **Open terminal**: none is retained, or each one's conversation is
  confirmed unavailable, its saved workspace is missing or unconfirmed, or its
  host has no embedded terminal. **Read final report** stays available beside
  it.
- **Follow up** opens the project's **Start session** dialog, with the same
  host, model, launch options, Attach images, instruction field and Session
  group (Workspace and After checks), the same defaults, capability gating,
  and the same launch checks and confirmations, including existing changes in
  Default main. The dialog names the entry it follows up and lists the
  context it will supply, saying when no session context or final report is
  retained.
- On Start, the session receives the follow-up context together with the
  developer's request, or alone when the request is blank. For a done story:
  its identity, title, completion time, developer and agent, and that the
  story is done, so its seed and plan may have been removed while its records
  remain in the project's history under that identity. For each session the
  entry holds: its workflow and story identity when it had one, its original
  request, its final report when one was submitted, and the revision its work
  landed at when recorded. The context states only what the records hold; a
  Done mark is not evidence that work landed.
- The new session is an ordinary Start session launch: it publishes only what
  its Session choices publish, appears in **Taken** as a local session entry
  labelled by its request, and is resumed by repeating the same follow-up.
  A follow-up of a different entry is a different launch even with the same
  request and choices.
- The source entry stays Done, in its place, with its actions and published
  facts unchanged.

Required restriction:

- An entry that offers **Open terminal** keeps that action and does not offer
  **Follow up**. The goal targets work whose conversation is gone: reopening
  the existing conversation keeps its full context, and a second, thinner
  conversation beside it invites divergent work.

Deferred promises:

- **Follow up** from the Sessions sidebar's **Recently done sessions** rows or
  from Intent.
- Following up while a session can still be reopened.
- Showing the source on the new session's entry, or grouping the follow-up
  session with its source's Story card once it is Done.
- Editing or omitting parts of the supplied context, and carrying the source
  session's attached images.
- Starting a story workflow, or creating a new story, from a done story.

#### Key examples

- **Retired workspace.** SEED-269's Story card is in Recently done, holding its
  Done refinement and execution sessions, whose worktrees were retired, so
  each offers **Read final report**. The card offers **Follow up**. The dialog
  names “SEED-269#recover-terminal-insert — Recover dictation and Paste in the
  embedded terminal” and lists the story, completed 8 Nov 2026 by Terry Yin
  with viktor-chan, and each session's request; both completed quietly, so it
  says no final report was submitted. The
  developer chooses Codex and Isolated workspace · Wait for review, types
  “Paste still drops the last line on iPad; investigate.” and presses Start.
  The session opens in a fresh worktree at fetched trunk with that context and
  request, and appears in Taken labelled by the request. SEED-269 stays in
  Recently done as it was.
- **No session left.** A done story whose sessions expired after 30 days, or
  ran on another machine, offers **Follow up**; the dialog lists only the
  story's identity, title and completion facts and says that no session context
  is retained.
- **Still reopenable.** A standalone ad hoc session marked Done in Default main
  whose Claude Code conversation is available offers **Open terminal** and no
  **Follow up**. Once its conversation is confirmed unavailable, it offers
  **Follow up**; it completed quietly, so the dialog lists its original request
  and says no final report was submitted.
- **Blank request.** A follow-up started blank with Default main · Wait for
  review opens in the project folder with the reporting context and the
  follow-up context only.
- **Same words, different sources.** Following up SEED-269 and SEED-267 each
  with “Continue” and the same choices starts two sessions. Repeating the
  SEED-269 follow-up exactly while its start is retained resumes that start.

#### UI

The source row in the dialog reads like the entry it came from: a story's
identity and title, or a session's label. The context list is read-only and
compact, one line per item (the story, then each session's request and
report), so the developer can see what the agent will receive before Start;
the instruction field stays empty for the new request.

#### Architecture

- A launch is local evidence and never settles or moves a story
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#decision)):
  the follow-up changes neither the done record nor the source session's
  Done mark. The story facts come from the published done record at the shown
  revision; session facts are machine-local launch evidence.
- The follow-up is a Start session request that also names its source entry.
  The server resolves the context from the current records at Start, rather
  than accepting text composed by the page, and supplies it as its own first
  input block. The source joins the ad hoc launch identity (`sameLaunch`),
  which otherwise is project, host, request, Session choices and images.
- The context stays out of the 4,000-character instruction field: a final
  report may hold 16,000 characters, and this machine already holds one of
  4,536.

Reuse the [ad hoc Start session dialog and launch path](../../dashboard/LAUNCH-START.md#start-session)
for the new launch. Use the [existing done and retained session records](../../dashboard/AGENT-LAUNCH-HISTORY.md)
for the source context. A session's local Done status is independent of
whether its changes landed.
