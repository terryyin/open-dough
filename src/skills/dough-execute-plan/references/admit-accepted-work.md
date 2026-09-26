# Admit accepted work that no backlog list holds

When the current instruction accepts a mission for tracked work and no backlog
list holds it, admit it through the startup command in
[Take queued work](../SKILL.md#take-queued-work) before its substantive work.
Work already queued starts as queued work; work already Taken continues under
its existing claim.

## Prepare the story

First reuse or draft its story in a suitable seed in the originating checkout:
`**Identity:**`, `**Goal:**`, bounded scope, and known expectations. Record its
actual preparation with the product backlog
[record-state](../../dough-product-backlog/references/record-preparation.md)
operation: approach `unselected` while the approach is undecided, `planless`
only under explicit planless authority, or `planned` with its plan. Record no
assessment you have not made. Then add
`--admit --link <seed path>#<anchor> --title <entry title>` to the start
command's flags, with the link relative to the backlog directory.

## Act on the result

The command carries only that story's section (a new seed whole) and its
declared plan into the isolated claim; other local edits stay local and
unpublished. It publishes them, the Taken entry, and your agent profile in one
remote-trunk commit, and lists the carried paths as `admitted`. Admission
requires no ready assessment and grants no execution authority; later
implementation still needs its normal source, approach, and authority. Because
the draft remains in the originating checkout, a deferred local refresh is
expected and leaves the accepted admission intact. `status: "existing"` means
you already hold this claim; continue under it. A refusal starts no dependent
work: `source-refused` names missing identity, preparation, or Goal, already
queued work, or a home listed under another identity; `source-conflict` names
the `path` that fetched trunk changed differently, with both versions kept for
a human decision; `conflict` means another claim holds the work. After an
unconfirmed admission, keep its reported `recovery` fields and stop. An
accepted admission continues with the same checkout-bound setup as any
accepted start.
