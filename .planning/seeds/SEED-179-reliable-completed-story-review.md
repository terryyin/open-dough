# Reliable completed-story review

## Selected Stories

<a id="reliable-completed-story-review"></a>

### Reliable completed-story review

**Identity:** SEED-179#reliable-completed-story-review
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Review completed stories whose clean integrations use a printing merge
driver, and keep this repository's backlog and done-catalog merge drivers usable
after the registering worktree is retired.

Repair the completed-story merge-tree parser without weakening resolution
attribution. Register merge drivers against the checkout doing the merge rather
than a disposable worktree, and repair this checkout's stale local configuration.

Expected examples:

- A successful merge driver can print explanatory lines before Git's tree ID;
  published completion review still shows the story's changes.
- A conflicted merge still preserves the existing resolution attribution gaps.
- Registering from a linked worktree and retiring it leaves merges in another
  checkout able to invoke the backlog and done-catalog drivers.

Evidence: five of eight recent clean merges replayed with a working backlog
driver printed before the tree ID and reproduced the parser rejection. The
current shared Git config names scripts in a deleted execution worktree.
