# Intent CI timing comparison

Part of [Development and Intent](dashboard-development-intent.md).

A selected **done** story shows a **CI timing comparison** instead of a live
branch judgment: baseline (newest completed build at or before the first claim
parent), branch (final story-branch build from the landing's story-side parent,
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
**CI timing changes**. An overall summary keeps
units apart in **Counts** and shows one signed whole-second change each for
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
comparison depth, **Baseline** shows its measured time, and **Branch** and
**Landed** show one signed change from a measured Baseline counted in the same
declared unit (test cases or test files). The story’s overall
figures and entry rows keep whole-second words (`+30 s`, `−1 min`, `0 s`). Location,
folder and file drill-down preserves precise times: `340 ms` to `410 ms`
shows `+70 ms`. An added scope shows its measured time without a change, as
does one whose endpoints count different units or legacy test results, which
**Counts** names at each end (`1 test file → 1 test case`); several units
show each unit's time apart. A gap keeps its label and explanation. A
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
**Branch** and **Landed** by signed change. Rows without a comparable change
(added, removed, different units or legacy test results, partial or
unavailable) follow comparable rows in either
direction; ties retain their supplied order. The Summary's outside row stays
last, and its sort survives drilling down. **Counts** still sorts by the active
after endpoint's counted results, and **Change** keeps its existing meaning.
At every depth, an unused Landed endpoint has the same explanation and the
same active Branch comparison, or Provisional comparison in Taken Trunk Mode.
Summary and file Proof reuse the evidence already held by Intent; drilling
adds no CI request, and Summary reads no file text. GitHub Actions
wall time spans run creation on attempt one or attempt start on reruns through
completion. CI time without runner waits measures the longest dependency chain
of job durations. GitHub Actions uses the workflow at that build, including
carried-over jobs. A custom CI adapter supplies the selected attempt's graph
through its optional `jobs` operation. If the graph cannot be read or timed,
Intent shows why alongside the endpoint's wall time and proof.
One classification of each scope's count and duration change also feeds tree
cues on location headers whose path is a compared entry and on file rows:
a count border (green fewer, red more; any change; strong at ≥50% of baseline)
and a duration tint (green faster, red slower; no tint under 10% or under 1 s;
strong at ≥50%; a measured zero Baseline at most light; no tint without
comparable measured durations). These tree cues retain their meaning as the
comparison tables use signed words and relative marks.
Added, removed, gap and partial sides take no cue on that measure; their text
explains why. Baseline / Branch / Landed cells use the same timing gap labels
as **Test execution time** (`Part 2 untimed`, `No timings`), with the full
explanation as hover text and accessible description. Tree file rows and those
location headers include Counts and after-side timing evidence in their
accessible names. Folder rows in the tree stay without cues. A
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

A done story's comparison ends with **Check again**, worded and placed as the
judged branch's button and disabled while it reads. It reads the comparison
and the endpoint proofs it shows again, whether the panel shows the
comparison, an unavailable slot, a whole-answer explanation, or a failed read:
an unavailable answer or slot is read afresh, so a temporary failure can
recover in the same dashboard process. A completed build's timing reason
stays part of a final answer. Final answers and valid proof summaries are
remembered and return without further provider requests
([request accounting](../dashboard/GITHUB-REQUESTS.md)).
