---
id: SEED-312
status: active
planted: 2026-11-11
planted_during: Terry's early handoff of SEED-303 into five independent optimization stories
trigger_when: Maintainers select this CI test family for faster trustworthy feedback
scope: story
---

# SEED-312 — Speed up touch review checks

<a id="speed-up-touch-review-checks"></a>

### Speed up touch review checks

**Identity:** SEED-312#speed-up-touch-review-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/592-speed-up-touch-review-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c5cd658717bd96c7b4b9588cc4adac71bafc808658535f4773e288a47b8f4146","plan":"087ffc8fc086ba06499128ad558eed367d0eb05dda710dbf9f2699fc0cb43bfa"}}
```

#### Goal

Dashboard maintainers get faster feedback on reviewing a story by touch. Real
finger input still proves that each review pane scrolls on its own and that the
chosen file and both reading places survive rotation and panel controls.
Ordinary CI continues to catch the same product regressions.

#### Scope

- Give the touch journeys a comparison no larger than their assertions
  distinguish: enough files to scroll the file browser in its tallest
  arrangement, two files long enough to scroll the code pane, one line wider
  than the widest code pane, one folder and one uncommitted file. Arrange it
  through the shared MakeMe builder with those facts stated at the call site.
  Desktop review checks keep the large comparison their own assertions need.
- Send only the finger strokes each reading promise needs: reach the wide
  line, read its hidden end, return to its beginning, read a short line after
  vertical movement, and move the file browser without moving the code. The
  200 lines above the wide line and the length of the line beyond the widest
  pane are incidental distance.
- Keep one owner for each observation that does not depend on the viewport,
  such as tap-target size, the context reveal, the folder toggle and the
  commit choice. The second viewport repeats only what its arrangement
  changes: the file browser above the code in a narrow review or beside it in
  a wide one, the panel covering the page up to 800 px wide, and Maximize and
  Restore when the panel sits beside the page. This applies the one-device
  rule in [where a check goes](../../dashboard/tests/README.md#where-a-check-goes),
  which keeps tablet portrait for the side-by-side review body.
- A journey prepares only what its own assertions use. Remove comparison
  choices that only repeat another case's proof as setup.
- Establish surviving proof before removing a case, step or assertion: a
  deliberate fault it detected fails a remaining check.

Required restrictions and reasons:

- Every scroll result comes from native touch input. An assigned scroll
  position, a synthesized scroll or a layout-only assertion does not prove that
  a finger moves the intended pane.
- No case this story changes takes longer than before under SEED-287's load
  profile, local load 20–30 on 2 workers, and this story adds no case-local
  allowance. Fitting the default 30 s there is SEED-287's promise; a
  consolidated case that outgrows it trades one defect for another.
- No internal mocks, wall-clock sleeps, retries, skips, timeout inflation or
  special runner modes obtain a saving. Preserve ordinary CI selection and
  follow [the failure policy](../../AGENTS.md#failing-and-flaky-tests).

SEED-287 ownership: [SEED-287](SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout)
owns the reading case's fit in the default timeout. Its shorter overflowing
line, its worker inputs ahead of the private origin and its removal of the 60 s
allowance are accepted on its story branch
(`codex/make-dashboard-journeys-fit-the-default-timeout`, `90cfdde52`) and were
not on main at `77716145b`. Neither story waits for the other. Start from main
as it is at Take:

- Where SEED-287's changes are there, keep its worker inputs and the default
  budget, and let this story's comparison replace the reading-specific line.
- Where they are not, leave the allowance and the worker inputs to SEED-287.
  Its integration then keeps this story's comparison and journeys.

Scope limits: first-in-worker preparation, other touch specs and the desktop
review checks stay as they are. Local-only archived experiments are excluded
from the maintained selection.

#### Key examples

- **Reading on a phone.** The chosen file has more lines than its pane shows
  and one line wider than the pane; the file browser sits above the code. A
  finger drags the code to the wide line, sideways to its hidden end and back
  to its beginning. Each named part is then wholly visible inside the code
  pane. The file browser's position, the fixed header and controls, and the
  page stay where they were. A drag in the file browser then moves the list and
  leaves the code where it was.
- **Reading on a tablet.** With the file browser beside the code, the same
  drags give the same independent result in each pane.
- **Rotation and panel controls.** A file is chosen and both panes are moved by
  touch. Rotating to landscape and back keeps the file, the comparison and both
  reading places, and reads the review no further. Maximize and Restore keep
  them where the panel sits beside the page. Hide files and Show files keep
  them too.
- **File and comparison changes.** Next file opens at its top. Refresh keeps
  the chosen file. An explicitly chosen Commits comparison keeps its file and
  reading place through rotation. Leaving uncommitted changes out survives the
  next rotation. Close returns focus to the Review changes action.
- **Honest proof.** A code pane that no longer scrolls sideways by touch, a
  file browser that no longer scrolls on its own, a rotation that rebuilds the
  review and loses the chosen file, and a side-by-side diff that no longer
  yields its width each fail a remaining case. The last one fails only where
  the file browser sits beside the code.
- **SEED-287 on main at Take.** The story keeps the worker inputs and the
  default budget. The reading case still passes within the default 30 s under
  load 20–30 on 2 workers.
- **SEED-287 still on its branch at Take.** The 60 s allowance and the worker
  inputs stay untouched on main, and the smaller comparison lands. SEED-287's
  integration removes the allowance over this story's journeys.

#### Success measure

Save at least a quarter of whole-command wall time on the ordinary one-worker
selection `npm run test:dashboard -- tests/review/story-review-touch.spec.ts --workers=1`,
with every replacement, preparation and teardown paid. Send at most two thirds
of the finger strokes. Compare with the execution base in alternating runs
under the same load, three passing observations of each.

A probe at `77716145b` on 2026-11-11 ran all four cases with their assertions
unchanged, twice each at load 4–9:

| Variant | Whole command | Finger strokes |
| --- | ---: | ---: |
| main | 38.8 and 46.4 s | 59 |
| with SEED-287's 125-character line | 35.2 and 37.2 s | 36 |
| also 60-line files and 28 changed files | 28.9 and 32.1 s | 28 |

Against SEED-287's line the smaller comparison saved about 16%. It changed no
journey step: the distance each read asks for, the repeated setup and the
duplicated viewport checks remain, and those supply the rest. A stroke costs about half a second and grows with load. At
load 15–36 the same four cases on main took 99 and 103 s; strokes took half of
each reading case's body, and a rotation case waited 2–5 s for its review reads.
Budget around 27 s on a machine as quiet as the probe's. Hosted CI records
63.0 s for this file, fourth among journey specs
([weights](../../dashboard/longest-first-journeys), run 42808747192).

#### Provenance and evidence

Extracted by Terry's instruction from [SEED-303](SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks),
with the [slice mapping](../evidence/SEED-303-early-handoff/README.md). Its
[coverage map](../evidence/SEED-303-early-handoff/coverage-map.md) rows 36–39
list what the four cases observe. Its
[comparable baseline](../evidence/SEED-303-early-handoff/comparable-baseline.md)
measured them inside a 45-case selection and is not this story's baseline.
