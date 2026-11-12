# Finding 3 — divider, covering and Board return

Basis remains PLAN.md and ADR 0010. The beneficiary is a developer reading or
maintaining these tests in Intent: action names should reveal the actual input,
while independent geometry, retained content, focus and boundary evidence remain
beside it. This is not a speed or measured-human-effort claim.

## Representative audit and preparation before/after

Both `7eab3d6ca` and `47b348b3a`, navigation/side-panel-width.spec.ts, express
cancellation with an inline box query, mouse move/down, pointercancel dispatch,
a move to `x - 300` with four steps, a width observation, then mouse up. The
keyboard continuation embeds four repeated-key loops (40 Left, eight Right,
40 Left and three Left) between width, focus, URL, retained-output and attach
observations. The implementation base `68638e11fe` retains those mechanics.

The cancellation source is identical at audit/preparation lines102–109 and
current accepted base76413lines105–112:

```ts
const { x, y, width, height } = await box(divider);
await page.mouse.move(x + width / 2, y + height / 2);
await page.mouse.down();
await divider.dispatchEvent("pointercancel", { pointerId: 1 });
await page.mouse.move(x - 300, y + height / 2, { steps: 4 });
await expectWidth(terminal, usableMinimum);
await page.mouse.up();
expect(attaches()).toHaveLength(1);
```

The current caller states:

```ts
await cancelDividerDrag(page, { pointerId: 1, by: -300, steps: 4 });
await expectWidth(terminal, usableMinimum);
await page.mouse.up();
expect(attaches()).toHaveLength(1);
// ...the keyboard has reached the divider through the original Shift+Tab...
await pressDividerKey(page, "ArrowLeft", 40);
await expectWidth(terminal, maximum);
await expectDividerSays(page, maximum);
await pressDividerKey(page, "ArrowRight", 8);
await expectWidth(terminal, maximum - 8 * keyStep);
```

The helper preserves the exact old center/down/cancel/left-edge-relative move;
the assertion still occurs before mouse up. pressDividerKey never focuses, so it
cannot repair a failed Tab transition. Negative terminal-key cases call the
existing Terminal primitive and cannot silently focus the divider. Maximize,
Restore and Close now name the frame action instead of reconstructing it;
`click`, coordinate mouse, keyboard key and native touch remain distinct inputs.
Partial-name callers pass exact:false; existing exact:true defaults remain.

Every existing title and 2,558 matcher argument/order entries are preserved
at the runtime observing boundaries. The covering assertion partition moves
from Width into frame. Cursor runner replacement reuses the already identical
showPageWithTaken instead of its duplicate showHeldSessionPage; the existing
navigation and Taken-count assertion body is identical (inspection.json). The
quiet-completion report-open loop also moves into existing FinalReport owner:
caller still supplies reportText and literalDone, while its native before/after
read and durable receipt facts stay outside. Conditional count→click→expected
text→toPass sequence and original query options are unchanged. These explicit
partitions qualify file-local matcher comparison; none is a removed behavior.
Independent assertions still expose before/after room, bounds, hit fractions,
selected file, old/new held answers, selected story, focus, read and attachment
counts. /tmp/seed300-review-582-slice5-inspection.json records that source check;
it does not substitute for inspecting locator targets or complete journeys.

## Maintenance sites and cost

/tmp/seed300-review-582-slice5-benefit-cost.json records the exact sites and
scope: the same100current owned paths at each baseline, excluding independent
contract assertions and dialogs from the inline-frame-action metric.

| Inspected mechanics | Audit | Preparation | Current increment base | Current |
| --- | ---: | ---: | ---: | ---: |
| Inline literal shared-frame action queries | 63 | 61 | 63 | 0 |
| Panel divider literal queries | 4 | 4 | 4 | 1 |
| Width scenario arrow-key loops | 4 | 4 | 4 | 0 |
| Direct xterm queries in width scenarios | 6 | 6 | 0 | 0 |

The current controls have one dynamic `control(panel, name, options)` query;
operation implementations share it. One shared key loop replaces the four
scenario loops. Cancellation has one focused owner. The xterm improvement was
already delivered by the merged Terminal work: this slice reuses that owner and
does not claim the six-to-zero reduction as its own increment. Different literal
counts at the audit/preparation/base reflect those snapshots' actual callers.

The raw action sweep records 61 exact query/scope/input mappings across 48 files
in /tmp/seed300-review-582-slice5-sweep-actions.json. Additional already-owned
procedural/fluent frame and measured-touch callers share that owner. Remaining
literal matches are independently asserted frame contracts or other surfaces
(Preparation badges, settings dialogs), not duplicate Side panel actions.

The opening audit additionally records54actual shared Session-entry action
lookups across35paths, alongside the earlier8width/maximize call sites. Every
original entry scope, string/regex name, exact option and action/click options
remain explicit. The39remaining raw Open terminal queries are independent
visible/count/focus/availability observations, including the combined absence
contract with More session actions. The conditional Recently done row retains
its full /^(Open terminal|Read final report)$/ name and row-by-title filter;
openTerminalControl's existing exact:true default remains for old callers.
The further report action audit records25actual getters/13paths and7independent
observations. A30line pure SessionEntryAccess seam owns their one role query;
stable Terminal/FinalReport exports preserve old defaults. It also owns the
original conditional Recently-done regex query. No report action is forced
through a Terminal-named API, and no pure getter adds an input or answer wait.

Formatted preview over the100source files is17,302→17,616lines(+314).
The new procedural frame is 133 lines; Width falls 236 → 206, pageLayout
247 → 237, and the unchanged shown-position click moves into the existing
reachability owner (173 → 182). Existing/new owner modules together grow168
lines; specs together grow146, including imports and explicit matching options.
Cursor runner replacement falls246→240 by reusing its identical existing setup
owner. Maximum changed-file size is 250. The preview
was read-only; coordinator owns actual formatting and delivery.

This cost buys named, modality-preserving operations across all actual shared
frame-action callers, one selector edit for these controls, and removal of
scenario-level cancellation/loop mechanics while retaining the observations that
could reject the implementation. Procedural callers remain procedural; the two
existing fluent journeys delegate to the same owners. There is no new runner,
phase model, generic click framework or future-only abstraction. The source
readability and one-edit maintenance gain justify this bounded helper cost under
ADR 0010; passing tests and selector counts alone would not establish that gain.

Independent refactoring additionally routes progressive-reset's existing divider
focus and2ArrowLeft inputs through the same owners. It preserves default exact
matching, all observations and input order; the full2case spec passed. Its
formatted size falls180→179, accounting for the1line difference from the
implementation's retained+315line handoff snapshot.

FinalReport grows19→44lines for the actual report-open-until-text responsibility
and its pure reportText observation, retaining its existing fluent facade. The
already-oversized quiet spec falls260→250without cutting closure/retirement work;
its existing individual StoryBranch60s timeout remains unchanged. Its report
comment moves with the loop. One getter/loop owner costs more helper code but
keeps expectedDone and native/record proof visible, instead of burying workflow
facts in an arbitrary cut. TerminalScreenPage falls125→123with stable access
reexport. All100owned baseline sources are identical between68638and current
acceptedHEAD76413; the absorbed lifecycle supplier changes elsewhere qualify
proof context and are not attributed as this source refactor's gain. Metrics
include76413and agree with the original increment base.

## Aggregate findings at unchanged boundaries

Finding1 retains slice2-evidence.md's audited/preparation same-snapshot example:
comparisonChoice(review,"Since the review").press("ArrowDown") leaves the
independent All changes and13files observations visible. Its4storyCardControls
and18storyReviewMark owner lines earned named choices and one pure Review
changes owner across procedural/fluent consumers. The region is now physically
owned by reviewControls with stable storyReviewMark reexport, as accepted in
slice4; current aggregate search confirms no duplicate literal owner.

Finding2 retains slice3-evidence.md's Added dashboard/src/a.tsx Enter selection
and independent heading/[+added] expectations, with fileDiff/listedFile/diffLines
and contextExpansion supplying only mechanics. Its50owner lines accompanied a
33line total decrease across57files. Slice4-benefit-cost.md retains snapshot
Refresh beside explicit revision/check facts and the distinct feedback/HTTP
wait boundaries; it added28owner lines for that responsibility. The G7 pane
generic-control route was missed by that literal-only sweep and is now closed
through reviewRefresh(review,{exact:true}).click(), with its original click and
wait ownership. No aggregate claim treats the earlier count as proof of that
formerly missed route. Current full review/G2/pane/touch renewals cover the
consumed frame handoffs; earlier accepted finding evidence is reused only for
unchanged control/tree/context/query/wait declarations and caller contracts.
