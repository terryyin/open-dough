---
id: SEED-347
status: active
planted: 2026-11-14
---

# SEED-347 — Start a follow-up session from a file diff

<a id="start-follow-up-from-a-file-diff"></a>

### Start a follow-up session from a file diff

**Identity:** SEED-347#start-follow-up-from-a-file-diff
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/619-follow-up-from-a-file-diff/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"018c93861d23a1452fd90f12e4beb399bd3f78ec2a5ac3bae8fc52bbc8cbdd42","plan":"c021c50899fe3c989c708c68d9ebab8c2fb47594d2fb3a7a4598d13261aa3b68"}}
```

**Beneficiary**

A developer reviewing a Done story's changes in **Review changes**, or a changed
test in that story's **Intent → Changed tests**.

**Goal**

Start a follow-up session directly from a Done story's diff. The agent receives
the story, the file, the comparison the diff shows and, optionally, one line and
its side, so the developer does not have to describe where the change is. The
developer can add instructions in an optional field before starting. This helps
the developer act on what they notice while reviewing how a story changed the
product and its tests.

**Temporary design reference.** The [file follow-up and story notes mockup](../mockups/story-review-and-notes.html)
shows the file header, line-number menu and follow-up dialog. During wrap-up,
keep the shared mockup while either SEED-348 story still needs it. The last
of these three stories to wrap up removes it after the behavior is delivered
and verified.

**Scope**

- For a Done story, show **Follow up** beside the file path at the top of a
  changed file's diff in **Review changes** and in **Intent → Changed tests**.
  In **Review changes**, this applies to whichever comparison is shown,
  **Published completion** or a landed run. It starts a follow-up about the
  whole file.
- In the same diffs, each line number can open a small menu for that line. The
  menu names the line, such as “Old line 85”, and offers **Follow up**. Revealed
  context lines work the same way. The menu works by pointer, touch and keyboard.
  Escape or a click elsewhere closes it and returns focus to the line number.
  Copying code still leaves line numbers out. Moving through the diff by
  keyboard must not add one Tab stop for every line.
- Either action opens the existing [Follow up](../../dashboard/LAUNCH-FOLLOW-UP.md)
  dialog. It keeps the same host, model, Attach images, instruction field,
  Session group, defaults, gating and confirmations. The read-only subject names
  the story as “identity — title”. Its context list adds the repository-relative
  path, the old path for a rename, and the comparison as that file's diff shows
  it. For a file shown as “includes trunk's changes”, the comparison starts at
  that file's own base. A line-level follow-up also lists the line number and
  side (old or new).
- On launch, the session receives the existing story follow-up context, the file
  context above and any instruction. A blank follow-up starts as one does today.
- Offer this on every Done story's diff, even when its card offers **Open
  terminal** instead of **Follow up**. Continuing the earlier conversation does
  not give the agent this file or line. The card's own Follow up rule stays
  unchanged.
- A follow-up from another file, line or side of the same story is a separate
  launch. Repeating the same file, line and side with the same instruction is
  the same launch, under the existing retained-start rule.

**Required restriction**

- The page sends only the file, comparison and line selection. The dashboard
  server checks that this file, and this line on that side, belong to the Done
  story's comparison it reads, then writes the context. It refuses anything that
  does not match, and nothing starts. Page-supplied context text stays refused.
  The existing follow-up rule requires the context to state only what the
  records hold, and the agent must not receive a location the comparison does
  not contain.

**Deferred promises**

- Follow up from an active (Taken) story's diff. Its diff is a local snapshot of
  the worktree, including uncommitted work, and a follow-up session would run
  outside that worktree. A later story needs to decide where such a session runs
  and how its changes relate to the story's own execution. Terry chose Done
  stories only on 2026-11-14. The same applies to a Done story's review while
  it shows its retained workspace. **Follow up** appears once that review shows
  Published completion or a landed run.
- Line ranges or several selected lines.
- **Add note** and **Attach story notes**, owned by
  [capture story notes](SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups)
  and [attach story notes](SEED-348-collect-notes-for-story-follow-ups.md#attach-story-notes-to-follow-ups).
  Until then, the line menu holds only **Follow up**.

**Architecture**

This extends the delivered story follow-up rather than adding a second launch
path. Follow the [file-anchored follow-up direction](../NORTH-STAR.md#follow-ups-name-what-the-developer-was-shown).

**Key examples**

- A Done story's **Review changes** shows **Published completion**
  `24c10ae → 8f2b19c`. The developer chooses **Follow up** on
  `dashboard/tests/intent-story.spec.ts`, types “Check whether the pinned
  revision survives a project switch” and starts. The session receives the
  story context, the file, `24c10ae → 8f2b19c` and the instruction.
- In the same story's **Intent → Changed tests**, the developer opens the line
  menu on old line 85, a removed assertion. They choose **Follow up** and start
  with the instruction empty. The session receives the story, the test file, the
  comparison and old line 85, and its terminal opens.
- On a file renamed from `old/a.ts` to `new/a.ts`, the developer follows up new
  line 12. The dialog and the session context name both paths and new line 12.
- The developer follows up new line 85, then new line 86, in the same story,
  both without instructions. These are two launches, and the second does not
  repeat the first.
