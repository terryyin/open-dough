# Intent CI timing comparison

Part of [Development and Intent](dashboard-development-intent.md).

A selected **done** story shows a **CI timing comparison** instead of a live
branch judgment. Its Changed tests browser separately reads locations,
inventory and unchanged-file source at the story's published result, with
the original baseline-to-result changes. The source revision and the measured
build revision have separate meanings: equivalent or later-build proof does
not move the browser to that build's source. A later project revision and a
Project Intent refresh change none of the Done story's historical evidence.
Its three views offer no project revision notice or **Show latest**; CI's
**Check again** remains available under its existing recovery rules.

The comparison endpoints are baseline (newest completed build at or before
the first claim parent), branch (final story-branch build from the landing's story-side parent,
or N/A in Trunk Mode), and landed (newest trunk-first owning merge or
fast-forward tip — never a later completion-only commit, no measured-ancestor
fallback across that landing). A confirmed skip may use only that landing's
equivalent build and its proof, never past unusable proof. A cancelled landing
keeps Cancelled and may use the nearest later trunk build with usable proof,
walking trunk's first-parent history forward past cancelled, unbuilt and
proofless revisions, stopping at a running build, the read trunk head or 30
revisions; it is labelled a later trunk build with how many later trunk
revisions it includes. Without usable later proof, Landed keeps the cancelled
explanation and shows no figures. If the walk passed a build whose proof was
unavailable, Landed names the nearest such build and explains why. If the walk
stopped at a running build, Landed also names that build. If neither applies,
Landed says no later build finished in the history it read. When the walk
stopped at the trunk head or a running build, the answer is read again on the
next selection instead of remembered. Timed-out or unexplained stays
exact-only. Baseline and Branch walks continue past builds without usable
proof. The story's **CI comparison**, location and folder **Summary**, and
file **Proof** share the active comparison heading
(**Baseline compared with
Landed** when Landed has proof, else **Branch**, or **Provisional** for Taken
Trunk Mode), framed as observed builds not attributed to the story, and show
why Landed is unused when skipped; without a comparison to show it is headed
**CI timing changes**. An overall summary's **Counts**
compares test cases and test files apart, an entry's results counting toward
a unit's difference when both builds report that entry in it, or when only
one build declares the entry; legacy test results and an entry's unit only
one build reports are totalled apart, each build in its units, with why
there is no difference (`5 → 7 test cases (+2); 1 test file (no change)`,
`6 legacy test results → 7 test cases and 1 test file (legacy unit
unknown)`). It shows one signed whole-second change each for
**CI time without runner waits** and **CI wall time** when both compared
builds measured it (a measured zero included; omitted otherwise); then each
endpoint's Build cell with a compact exact or ancestor
source icon (accessible label for that distinction) or concise equivalent /
later wording, without commit subjects, run or attempt IDs, or routine skip
explanations in the default cell, keeping short exceptional explanations when
present (failed or cancelled runs, missing proof, unexplained absences;
Cancelled or No build when the requested revision is not the timed build
shown), with its measured CI wall time and CI time without runner waits, or
why it has none (observations between builds, not attributed to the story);
then entry rows whose Counts cell keeps the before→after words. At every
comparison depth, each declared unit (test cases or test files) that Baseline
and a later endpoint both report for a scope compares on its own row: an
entry row, a Summary row, one group of the Summary's own figures named by its
unit, a file Proof row. **Baseline** shows its measured time, and **Branch**
and **Landed** show one signed change from a measured Baseline counted in
that unit; a test case time and a test file time stay on their rows, never
added. The story’s overall
figures and entry rows keep whole-second words (`+30 s`, `−1 min`, `0 s`). Location,
folder and file drill-down preserves precise times: `340 ms` to `410 ms`
shows `+70 ms`. An added scope shows its measured time without a change.
Units that match nothing at the other end, such as legacy test results, even
two builds' spelled alike, or test files at Baseline and test cases later,
share one row of each endpoint's own units and times, compared with nothing:
**Counts** names both ends and why (`1 test file → 1 test case (different
units)`, `6 legacy test results → 7 test cases and 1 test file (legacy unit
unknown)`), and several units at one end show each unit's time apart. A unit
one end alone reports beside a unit both report has its own row reading `—`
where it is unreported, never a measured zero (`— → 1 test file`); a reported
zero is a real zero. A gap keeps its label and explanation. A
measured zero Baseline permits a signed change. Branch and Landed headers
note "vs baseline".
Each comparable change with a positive measured Baseline has a relative mark:
its zero tick sits at the centre, faster extends left and slower right.
Each displayed comparison shares one symmetric scale across its own figures
and rows, reaching one side at a 50% change and widening to its largest
relative change. A location or folder uses its own figures and immediate
rows, including the outside row; a file uses its own figures. Drilling applies
this rule to the newly displayed set without scanning unseen descendants.
An unchanged time keeps its mark at zero. Added, gap, zero-Baseline,
different-unit and legacy figures show no mark or percentage; zero Baseline
still has its signed change.
The words carry the direction without colour. **Show %**, off at first, is one
preference kept with the story's reading place and shared by CI comparison,
Summary and file Proof. It adds each mark's signed whole percentage (`+13%`,
or `+21%` for `340 ms` to `410 ms`), changing no value, mark or row order.
Turning it on or off at any depth applies at the next scope and on return.
The comparison figures and tables keep their cue classification without the
tint or count edge; their shared marks and words carry the comparison.
Timing columns sort by the quantity shown: **Baseline** by measured time,
**Branch** and **Landed** by signed change, each compared unit's row by its
own. Rows without a comparable change (added, removed, a unit an endpoint
does not report, different units or legacy test results, partial or
unavailable) follow comparable rows in either
direction; ties retain their supplied order. The Summary's outside rows,
one per compared unit, stay last, and its sort survives drilling down. **Counts** still sorts by the active
after endpoint's counted results, and **Change** keeps its existing meaning.
At every depth, an unused Landed endpoint has the same explanation and the
same active Branch comparison, or Provisional comparison in Taken Trunk Mode.
For a Done story, entry and folder **Summary** and file **Proof** also show
**Test execution time history** beside the existing evidence. File history
stays available across Purpose/Proof navigation and when live Proof is absent. The endpoint is the published Done result's landing,
independent of the build that measured it or another publication of the same
story. Background landing collection retains each measured attempt's validated
GitHub Actions or adapter proof once. History reads use that local evidence.
Opening, drilling or revisiting Summary or file Proof, including history Retry,
never acquires historical CI proof. Folder readings include every published
descendant, even files absent from the visible source tree; membership is the
scope observed at each build.
Collection can resume a known attempt's missing proof or unanswered acquisition
after restart, including retained builds whose wall-time resolution was already
final. It keeps proof acquisition separate from that final landing resolution.
Validated summaries stay immutable; answered corrupt archives and explicit
expired, invalid, mismatched or oversized proof remain explained gaps. Proof,
builds and their landing references share the project's bounded retained cohort;
browsing neither extends that window nor reconstructs evicted evidence.
The cohort follows accepted recorded-landing ancestry across all merge
parents, filtered to retained recorded revisions, independently of when
landing reports arrive. A merge with the story as its first parent still
includes earlier accepted trunk landings. Collected ordering remains usable
if explicit launch-record deletion removes landing pins, or local Git
repositories or objects become unavailable. Launch-history retention does not
remove those pins. Unverifiable positions get an explicit explanation and do
not enter the through-landing series. An upstream rate limit does not withhold
these local history reads. The confirmed-skip CI resolver keeps its separate
first-parent equivalent-build rule.

The history keeps one common build observation and evidence row per attempt,
with separate test-case and test-file histories for its declared evidence. Each
history plots complete cumulative test execution time, including measured zero,
with dates, represented landings and the common measured build link. A mixed
legacy result adds an unknown-unit note without adding another history; a
legacy-only result remains a unit gap, even if its old label names test cases.
It names equivalent-build reuse and later-build measurements separately from
the selected landing. Unsupported entry/unit changes and unavailable, partial
or untimed proof break the line and keep their reasons. Earlier supported
segments remain readable when the selected landing is a gap. These are
observations of each build's scope, not timing attributed to the story. The
history has its own local read failure and retry, preserving other evidence.
An unreadable retained store is a failed local read; an absent store is empty
history.

Summary and file Proof reuse the evidence already held by Intent; drilling
adds no CI request, and Summary reads no file text. GitHub Actions
wall time spans run creation on attempt one or attempt start on reruns through
completion. CI time without runner waits measures the longest dependency chain
of job durations. GitHub Actions uses the workflow at that build, including
carried-over jobs. A custom CI adapter supplies the selected attempt's graph
through its optional `jobs` operation. If the graph cannot be read or timed,
Intent shows why alongside the endpoint's wall time and proof.
One classification of each compared row's count and duration change also
feeds tree cues on location headers whose path is a compared entry and on
file rows:
a count border (green fewer, red more; any change; strong at ≥50% of baseline)
and a duration tint (green faster, red slower; no tint under 10% or under 1 s;
strong at ≥50%; a measured zero Baseline at most light; no tint without
comparable measured durations). A scope with several compared rows takes
the direction its cued rows agree on, strong when any is, and no cue when
they disagree. These tree cues retain their meaning as the
comparison tables use signed words and relative marks.
Added, removed, unreported, gap and partial sides take no cue on that
measure; their text explains why. Baseline / Branch / Landed cells use the
same timing gap labels
as **Test execution time** (`Part 2 untimed`, `No timings`), with the full
explanation as hover text and accessible description. Tree file rows and those
location headers include each compared row's Counts and after-side timing
evidence in their accessible names. Folder rows in the tree stay without
cues. A
selected file or location with a duration tint keeps that tint and uses an
accent border for selection instead of an accent fill that would hide it;
keyboard focus keeps the shared focus ring. A location that holds story
changes keeps its change mark beside a count cue. Cue colours use their own
tokens, not warning or error styling, and keep the same meanings in dark
theme. Cues follow the active comparison (Branch when Landed is unused).
Without a selected story with a comparison there are no cues and no comparison
wording. The tree reads no CI of its own. Endpoint recovery is independent of
Review merge-resolution attribution; a Review refusal does not suppress
comparison at homepage, entry, folder or file scopes. A **Taken** Story Branch
story keeps the live judgment and adds that comparison (provisional latest
branch build; Landed not yet landed); a new branch head re-reads it. A
**Taken** Trunk Mode story shows the provisional trunk comparison (Branch N/A)
instead of a no-branch gap.

Historical comparison, source, CI proof and saved Intent coverage have
independent reading, failure, absence and result states. Missing historical
source never substitutes the current project tree or hides available CI and
saved coverage. A missing comparison does not imply no changed tests; an
absent assessment does not imply a negative assessment. Missing or unusable
CI proof keeps its endpoint's provenance and explanation, with supported
recovery, even when historical source is available.

A done story's comparison ends with **Check again**, worded and placed as the
judged branch's button and disabled while it reads. It reads the comparison
and the endpoint proofs it shows again, whether the panel shows the
comparison, an unavailable slot, a whole-answer explanation, or a failed read:
an unavailable answer or slot is read afresh, so a temporary failure can
recover in the same dashboard process. A completed build's timing reason
stays part of a final answer. Final answers and valid proof summaries are
remembered and return without further provider requests
([request accounting](../dashboard/GITHUB-REQUESTS.md)).
