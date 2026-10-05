---
id: SEED-107
status: active
planted: 2026-10-06
planted_during: Terry's request to turn the dashboard's Recent sessions column into a Recently done column backed by a published record of done stories
trigger_when: A developer wants to see which stories were recently finished, and by whom, after story wrap-up has removed them from the product backlog
scope: story
---

# SEED-107: Dashboard recently done

## Why This Matters

When a story is wrapped up, it is removed from the product backlog and its
seed section and plan are deleted. Nothing in the project's current state says
what was recently finished. The dashboard's Recent sessions column shows only
local session records from one machine, so it cannot tell a developer which
stories the team completed, and it shows sessions as a flat list without the
stories they served.

## Story

<a id="recently-done"></a>

### Dashboard shows recently done stories with their sessions

**Identity:** SEED-107#recently-done

**Beneficiary:** A developer watching a project's dashboard who wants to see
which stories were recently finished, who finished them, and the sessions
that did the work.

**Goal:** Story wrap-up keeps a short published record of each done story next
to the product backlog, and the dashboard's Recent sessions column becomes
**Recently done**: one time-ordered list of recently done stories, each
showing its attached sessions inside its card, interleaved with sessions that
belong to no done story.

**Scope (initial, for refinement):**

- A recently done record lives beside the product backlog (for example
  `.planning/RECENTLY-DONE.md` or a JSON file) and is committed and published
  with the wrap-up, so every developer sees it through Git.
- Each entry keeps only what survives cleanup: the story title and identity,
  when it was done, the developer and agent involved, and the host tool used.
  It does not link to the seed section or plan, which wrap-up deletes; anyone
  needing the details recovers them from Git history.
- A script, run when story wrap-up marks the story done, adds the entry and
  drops entries older than the dashboard's existing done-session retention
  (currently 30 days, per [session history](../../dashboard/AGENT-LAUNCH-HISTORY.md)).
- The dashboard column title changes from Recent sessions to Recently done.
- The dashboard merges the published done-story record with its local session
  records: sessions attached to a done story show inside that story's card;
  sessions with no done story keep their current card form. Done stories and
  unattached sessions appear together newest first.

**Open for refinement:**

- Whether the entry records a revision, such as the last delivered revision
  before wrap-up. The wrap-up commit cannot name itself, and the commit that
  added the entry can be found from Git history instead, so the field may be
  unnecessary.
- Markdown or JSON for the record, and whether the backlog script owns it.
- How a done story's time compares with a session's time when ordering the
  merged list, and where a done story's still-open sessions appear.
- How the record's retention relates to the dashboard's own expiry of done
  session records if that rule later changes.
