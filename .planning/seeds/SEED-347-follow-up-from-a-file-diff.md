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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary**

A developer reviewing a story's changes in **Review changes** or a changed test
in the selected story's **Intent → Changed tests** view.

**Goal**

Start a follow-up session directly from the diff so the agent can find the
change the developer is looking at. The developer can add detailed instructions
in an optional text field before starting the session.

**Temporary design reference.** The [file follow-up and story notes mockup](../mockups/story-review-and-notes.html)
shows the file header, line-number menu and follow-up dialog. During wrap-up,
keep the shared mockup while either SEED-348 story still needs it. The last
of these three stories to wrap up removes it after the behavior is delivered
and verified.

**Scope**

- In both views, show a **Follow up** button beside the file path and name at the
  top of the diff. This starts a follow-up about the whole file.
- In both views, clicking a line number opens a menu with a **Follow up** action
  for that line.
- Either action opens the follow-up dialog with an optional instruction field.
  On launch, the session receives the project, story identity and title,
  repository-relative file path, and the comparison shown in the diff. Include
  the old path for a rename and the selected line number and its side of the
  diff for a line-level follow-up. Pass any instruction the developer enters
  along with that context.

**Key examples**

- In **Review changes**, choose **Follow up** from the file header, type what to
  investigate, and start. The session receives the story, file, comparison and
  instruction.
- In **Intent → Changed tests**, click the line number of a removed assertion,
  choose **Follow up**, and start with the instruction field empty. The session
  receives the story, test file, comparison and the selected line on the old
  side of the diff.
