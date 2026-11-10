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
equivalent build (and its proof when published; otherwise its wall time when
the attempt passed with valid start and completion), never past that one
equivalent. A cancelled landing
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
zero is a real zero. Every compared row names its unit, including
`1 test file → —` and `5 test cases → removed`. Unobserved units name their
unit alongside the parts gap and unavailable count difference.
Below an entry, missing or ambiguous parts, and present parts without a file
breakdown, keep their unit and evidence gap at folder and file scopes.
A gap keeps its label and explanation. A
measured zero Baseline permits a signed change. Branch and Landed headers
note "vs baseline".

Count differences, equality words and cues require complete parts for that
unit at both compared endpoints. Observed totals and missing/ambiguous parts
remain visible, with why the count difference is unavailable. Judge Branch
and Landed independently; other complete units still compare, even without
durations. An unobserved scope under an incomplete unit cannot establish added
or removed tests. Any incomplete contributing entry withholds its unit's whole
overall difference, including an entry with no present parts; complete-entry
subtotals cannot substitute for it. Counts still sort by observed figures.
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
For a Done story, entry and folder **Summary**, and file **Proof**, also show
[Test execution time history and prior-build references](dashboard-development-intent-scope-reference.md)
from the collected evidence through that published landing.

Summary and file Proof reuse the evidence already held by Intent; drilling
adds no CI request, and Summary reads no file text. GitHub Actions
wall time spans the provider-reported attempt start through completion for
first attempts and reruns alike; it does not promise every queue phase.
Retained measurements with an unverified start basis are explained gaps and
excluded from the prior-build reference. Background collection refreshes their
same recorded attempt's authoritative bounds where available; browsing reads
local evidence and does not acquire them. CI time without runner waits measures the longest dependency chain
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

Done comparison memory and landed history collection share the Landed
pending/final judgment before its internal proof detail is projected into
the displayed endpoint. Queued or running builds, a skip resting on a running
equivalent build, cancelled landings still awaiting later builds, unread CI,
and unanswered equivalent/later proof reads stay refreshable. Check again
or selecting the story again can therefore replace Branch fallback with
Landed in the same process. An unanswered proof read stays pending beyond
the landing's one-hour no-run bound. A nearest successful equivalent with valid
positive wall time stays usable when its proof is settled missing; proof-dependent
figures remain unavailable. Missing proof without that eligibility, and expired,
invalid or unopenable equivalent proof, remain explained gaps. Retained legacy
equivalent no-proof gaps revalidate once; newly resolved final gaps keep
provider-free reuse. Sharing this judgment preserves each execution mode's
existing build selection and exact/equivalent/later provenance, and does not
make history browsing acquire CI or add UI polling.

A Landed revision whose push run does not exist yet also stays refreshable.
The shared no-run wait ends when CI has a run at a later first-parent trunk
revision, the existing 30-revision walk is exceeded, or the observation clock
reaches one hour after its matching recorded landing. Local launch captures
and retained history can supply that receipt time only when project, target,
story and the resolved landed revision agree. The earliest matching receipt
keeps the deadline fixed even when another capture arrives; a preparation or
another execution revision cannot supply its age. Retained history includes
the actual target and survives removal from the launch list. Older history
without target metadata supplies no known age.

Published comparisons remain readable when local capture is absent or
unreadable. Unknown age cannot expire the wait: completion and commit times
are different facts, and reading again starts no clock. CI and walk evidence
can still settle the gap. Once the exact run appears, Check again or selecting
the story again advances through queued/running evidence to its completed
build, preserving the exact source and final-answer reuse.

Done CI status also reads a compact **Prior-build average** from the local
retained history at its exact published endpoint. It shares the project history's
complete-proof, single median/15% filter and five-sample minimum; the selected
attempt and measured revisions at or after that endpoint never supply priors.
The count/span describe current retention: later publications cannot enter the
reference, while eviction may change it or leave insufficient history. Independent
history refresh/retry preserves the comparison; unavailable historical endpoints
and selected proof are explained without acquiring CI or substituting current trunk.
