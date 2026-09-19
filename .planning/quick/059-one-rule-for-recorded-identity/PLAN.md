# Let one rule decide a recorded identity

Status: planned correction. Created 2026-09-18 by the execution retrospective of
correction 058. No execution is authorized or started by this plan.

## Authoritative correction input

The retrospective of correction 058 ("Restore stable identity and faithful
backlog reconciliation") found that the delivered identity model is decided in
more than one place, and that one of those places stopped deciding anything.
The bounded outcome here is that a recorded identity is established and disputed
by one rule: work cannot enter the backlog under an identity its canonical home
does not name, and a reconciliation that disputes an identity says so as an
identity dispute rather than as an ordinary value clash. This corrects the
delivered core of 058; it does not implement the queued Git/installation story.

Original contract: `30dc6bd:.planning/quick/058-preserve-backlog-merge-intent/PLAN.md`,
especially its "Confirmed identity correction" and slices 4 and 6. Reviewed
execution: `a242412`, `ba88351`, `da64969`, `848f793`, `b6f9515`, `8fae29f`,
`ac92479`, against the baseline `2941a3d`. Correction 058's promises stand: a
recorded identity is independent of the link, relocation is not
re-identification, and no link-agreement refusal returns.

### Current findings and decisive evidence

1. **`add` accepts an identity the linked canonical home does not name.**
   Removing the link-agreement refusals in slice 4 removed the only check `add`
   made, and nothing replaced it. Observed at `ac92479` against a scratch
   project whose seed records `id: SEED-001`:
   `add --identity SEED-999#an-actual-story --link seeds/SEED-001-real.md#an-actual-story --position last`
   exits 0 and writes
   `- [Bogus](seeds/SEED-001-real.md#an-actual-story) — SEED-999#an-actual-story`.
   At `2941a3d` the same request was refused with `identity "…" is not named by
   the link path "…"`. Because a recorded value is never reallocated, a mistyped
   identity becomes that work item's permanent name, and the entry disagrees
   with the home's own `id:` from the moment it is written. `add` reads no
   canonical home at all, so there is no record-based check to fall back on:
   an unknown anchor is accepted as well, at this revision and at the baseline.
   This contradicts `references/identity.md` contract items 4 and 5, which say a
   recorded value is never reallocated and that ambiguity stops for a human.

2. **An identity is decided twice, by two rules with different wording.**
   `identity` is a member of `valueNames` in `product-backlog-version.mjs`, so
   `mergeWork` merges it as an ordinary value beside `title` and `href`, and
   slice 6's `identityClash` then polices the result. A dispute therefore
   surfaces either as the generic "the versions give it different identities"
   clash or as the specific "which work this entry is" clash, depending on which
   path the values took. Both refuse, so no wrong result is published; the cost
   is two rules and two explanations for one question, which the next change to
   identity has to keep in step. `groupWork` in `product-backlog-work.mjs`
   already carries a third refusal about which work item an entry is.

3. **`parseEntryLine` in `product-backlog-document.mjs` has no caller** anywhere
   in `src` or `tests`. It predates correction 058, which neither introduced nor
   exposed it; slices 5 and 6 were flagged as possible callers and used neither.

## Preserved scope and design

- Keep every promise of correction 058. A recorded identity stays independent of
  the link; relocation stays a reference change; the legacy shorthand stays
  readable; `recordsOwnIdentity` stays the predicate for "records a name of its
  own", and `recordsIdentityInFull` stays unusable for that question because a
  bounded correction's path identity carries no anchor.
- Restoring a check in `add` must not restore a link-agreement rule. The
  question is whether the canonical home names this identity, answered from the
  home's own record, not whether the link path spells the identity's token.
  Relocation, where the home records the identity but the path has changed,
  must keep working.
- Giving `add` the canonical home is a new responsibility for that command.
  Adoption already answers this question in `product-backlog-adopt.mjs`; prefer
  extending the shared identity or home rule over a second implementation.
- Preserve every existing refusal: collisions, duplicate homes, ambiguity,
  removal-versus-change, removal-versus-reprioritization, and the refresh
  refusals. Preserve slice 2's exact-wording diagnostics and slice 3's
  meaning-level report assertions.
- No new numbering convention, registry, historical inventory, operation log, or
  installer change. Command routing, promotion of the backlog `scripts/`
  directory, and installation proof remain the successor story's work.
- Apply [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for coherent domain ownership and
  [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) for one
  name per concept. No ADR exception is required. The near-future direction,
  parallel agents collaborating through trunk-based development, depends on a
  backlog entry meaning the same work to every agent that reads it.

## Ordered slices

### 1. Refuse work whose canonical home does not name its identity
Type: Behavior
Status: done
Proof: extended `tests/support/product-backlog.test.mjs` (now split into
`tests/support/product-backlog-add-identity.test.mjs`) and five other add-call
fixture sites; `bash tests/product-backlog.sh` passes 93/93.

`add` now opens the canonical home through a new `requireNamedHome` in
`product-backlog-add.mjs`, reading `namedIdentity`/`impliedIdentity` in
`product-backlog-home.mjs` (the latter shared with `adopt`'s
`adoptedIdentity`, replacing its own inline `composeIdentity` call). The check
is skipped when the entry claims no name beyond its link
(`recordsOwnIdentity` false — the ordinary bounded-correction case) and for
whole-document homes (no anchor), matching `adopt`'s existing precedent and
preserving `product-backlog-merge-identity.test.mjs`'s coverage of that
ambiguity surfacing at merge time instead. This leaves one known scope
boundary for slice 2 to be aware of: a synthetic identity attached to a
whole-document home is still not verified against that home at `add` time.
Both required cases are proven directly: the plan's own SEED-001/SEED-999
regression (`add refuses an identity its canonical home does not name`) and
relocation via an explicit `**Identity:**` record whose own anchor spells
something else (`add accepts a home whose recorded identity matches although
its own path spells none of it`), plus a previously vacuous relocation
assertion in `product-backlog-identity.test.mjs` now exercised for real.
`requireNewHome` in `product-backlog-refresh.mjs` was deliberately left
unmerged with this: it requires an already-recorded identity with no
implied-identity fallback, a different rule for a different operation.

`add` must refuse an identity the linked canonical home does not record or
otherwise name, leaving the backlog unchanged with a nonzero exit and a
diagnostic naming both the supplied identity and what the home says. Prove the
regression case directly: a seed recording `id: SEED-001` linked under an
identity spelling `SEED-999`. Prove that relocation still works: a home whose
recorded identity matches while its path spells none of it is accepted, which is
the boundary that must not regress to a link-agreement rule. Retain the existing
`add` refusals unchanged, including the three ambiguity refusals and the
collision and duplicate-home stops.
The seam already exists and was verified during the retrospective:
`openHome` in `product-backlog-home.mjs` returns the home's `recorded.identity`,
and `requireNewHome` in `product-backlog-refresh.mjs` already applies exactly
this rule — the home must record this identity, neither none nor a different
one. `adopt` and `refresh` are its only callers; `add` is the one mutating
command that never opens a home.
Sizing concern: `add` currently opens no canonical home, so this slice gives it
that responsibility. Reuse that existing rule rather than writing a second one. If the shared rule cannot serve both without per-command
exceptions, stop and reassess before extending the work.

### 2. Decide an identity dispute in one place
Type: Structure
Status: done
Proof: `bash tests/product-backlog.sh` passes 94/94 (93 pre-existing + 1 new);
every pre-existing refusal keeps its exact observed diagnostic.

`mergeWork` in `product-backlog-combine.mjs` now decides `identity` through
one function, `mergeIdentity`, called once ahead of the per-field
`valueNames` loop (which now skips `identity`). It owns both dispute shapes:
the home-coincidence conflict (wording kept byte-identical to the removed
`identityClash`) and the ordinary changed-on-both-sides disagreement, sharing
a `differentValueClash` helper with the per-field loop rather than repeating
that wording inline. `valueNames`, `sameState`, and `transitions` are
untouched and still read/compare `identity` exactly as before; `groupWork`'s
own refusal is untouched. A test survey found the generic "different
identities" wording was not exercised by any prior test — a new test,
"merge identity refuses two branches giving one work item different
identities outright," now covers it directly; the pre-existing
home-coincidence test still passes with unchanged wording. No change was
needed to `references/merge-conflicts.md` or `references/identity.md`;
neither quotes the literal refusal text this slice touched.

Stop merging `identity` as an ordinary value and let the identity rule own the
question, so one dispute produces one explanation. Keep both currently reachable
refusals reaching a human with their evidence intact; where their wording
converges, say so in the tests rather than freezing an incidental sentence.
Leave `groupWork`'s own stop where it is: grouping should not adjudicate
identity, and the layering is deliberate. Align
`references/merge-conflicts.md` and `references/identity.md` if the surviving
explanation changes what they describe.
Sizing concern: `identity` is read by `sameState`, `mergeValue`, `transitions`,
and the reporter. Keep this to removing one decision path, not redesigning the
three-way comparison.

### 3. Remove the uncalled entry-line reader
Type: Structure
Status: dropped — owner-authorized, not attempted
Proof: `bash tests/product-backlog.sh` unchanged in count and result.

Delete `parseEntryLine` from `product-backlog-document.mjs` and confirm nothing
imports it. Git retains it if a later caller ever wants it.
Sizing: one deletion and one focused proof loop.

**Stop, recorded during execution:** finding #3's evidence ("`parseEntryLine`
has no caller anywhere in `src` or `tests`") is narrowly true but incomplete.
`scripts/product-backlog-insert.mjs` — a repo-root maintainer entry point,
outside both `src/` and `tests/` — imports and calls `parseEntryLine` twice to
parse `--entry`/`--after` CLI arguments. Deleting the function as this slice
literally instructs would break that script at its next invocation, uncaught
by `bash tests/product-backlog.sh` (that suite does not exercise it). This
project's own "Preserved scope and design" section says command routing and
"promotion of the backlog `scripts/` directory ... remain the successor
story's work," which reads as placing `scripts/product-backlog-insert.mjs`
out of this correction's scope — so updating that script to drop its own
`parseEntryLine` use is not something this slice is authorized to do, and
deleting the function out from under it would be a real regression, not a
safe structural cleanup. Execution stopped here without deleting anything or
touching that script; `product-backlog-document.mjs` is unchanged.

**Owner decision:** dropped. `parseEntryLine` stays in place; correction 059
closes with slices 1 and 2, its stated core promises. Git retains this
plan's evidence if a later, explicitly scoped change wants to revisit
`parseEntryLine` alongside `scripts/product-backlog-insert.mjs`'s promotion.

## Execution and review gates

All slices are planned. No numeric execution limit was supplied. Slice 1 owns
the only user-visible behavior change and should be delivered first; slices 2
and 3 are structure and may be reassessed if slice 1's evidence changes what
they should say. Passing these corrections establishes no Git gating, no
promotion of the backlog scripts, and no installation proof.
