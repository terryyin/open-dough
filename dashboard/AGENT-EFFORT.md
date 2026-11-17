# Reproduce retained agent effort

Run from the repository with its supported Node runtime. The command reads local
retained evidence; it does not refresh Usage, rewrite history, call provider APIs
or start agents. JSON includes sources and response identities, without transcript
bodies. Readable output omits raw response identity lists.

```sh
node dashboard/server/compareAgentEffort.ts --list
node dashboard/server/compareAgentEffort.ts --task 'EXACT-TASK-ID' --json
node dashboard/server/compareAgentEffort.ts --host claude --family SESSION \
  --from 2026-11-12T00:00:00Z --until 2026-11-15T00:00:00Z
node dashboard/server/compareAgentEffort.ts --host cursor --list
node dashboard/server/compareAgentEffort.ts --host cursor --family SESSION \
  --cursor-root /path/to/agent-transcripts
node dashboard/server/compareAgentEffort.ts --comparison /path/to/comparison.json --json
```

`--task` accepts an exact task ID or an unambiguous exact story identity. Resolve
ambiguous selections using the IDs from `--list`; no latest-run heuristic applies.
Codex/Claude `--family` requires `--host`, `--from` and `--until`: the window is
half open, inclusive start and exclusive end. It selects the retained native
family across tasks. Name a whole-family/time selection as such; later distinct
work does not become one task. `threads` counts known selected session identities
from native request groups and stored contributions. It is null when no selected
session evidence can be reconstructed; it is not a transcript-file count.
Use a separately named selection to distinguish an audit window from the whole
retained family. Task selection uses shared Usage ownership, including replies
and workers, and supports optional time bounds.

Its outputs follow the [agent effort output contract](AGENT-EFFORT-OUTPUT.md):
[selection](AGENT-EFFORT-OUTPUT.md#selection-contract),
[single report](AGENT-EFFORT-OUTPUT.md#single-report-contract) and
[comparison](AGENT-EFFORT-OUTPUT.md#comparison-contract).

`--home` selects the local home (default current home); `--store` selects the
read-only Usage history file. Repeat `--codex-file` / `--claude-file` to read
specific native files; supplying files disables that host's default root scan.
Repeat `--codex-root` / `--claude-root` to choose scan roots, and `--cursor-root`
to choose Cursor transcript roots. For bounded audits use an isolated `--home`,
selected files and empty unrelated roots. `--json` emits stable structured
figures; `--list` emits usable task or Cursor family identifiers.
`--guidance-version VERSION` labels a maintainer-supplied historical version as
supplied. Without retained historical source evidence, guidance remains unknown;
today's installation is never historical evidence.

## Historical sample boundaries

The retained samples in the [session-efficiency method](../docs/maintainer/session-token-efficiency-research.md#window-scope-and-method)
can be replayed with the same family/window flags and the retained native files.
Select files or roots on the machine holding them; an isolated `--home` avoids
mixing other local launch/history records into a bounded audit.

| Host / native family | Original selection | Reproduced figures |
| --- | --- | --- |
| Codex `01a1d22f-e0cd-7032-930d-5a9ff3011a64` | `[2026-11-12T00:03:56Z, 2026-11-14T00:03:56Z)` | 11 threads, 2,083 requests, 436,806,678 total tokens |
| Claude `296b888d-08b1-4b06-ac2e-24a4462da7d0` | Retained coordinator family | Peak input 752,562; Fable/medium and Opus/high remain separate |
| Cursor `a6169ce7-5db3-4970-8f00-c8bf8c548fb4` | Retained transcript directory family | Coordinator 15 TodoWrite calls and eight PLAN.md reads |

A separately selected whole retained Codex family has later requests across
tasks. Its larger total is a different boundary, not an attribution claim about
one execution. Task mode supplies the shared ownership boundary for a single
execution and its later replies/workers.

## Explicit comparison groups

A comparison manifest has two nonempty execution arrays, with no arbitrary
member limit. Each member requires a label and host and uses the same selection
and source names as flags, omitting `--`. Source arrays override shared CLI roots
or files. Paths resolve from the command's working directory. Notes are supplied
context, not verified outcome or quality scores.

```json
{
  "baseline": {
    "notes": {
      "outcome": "Delivered the agreed behavior",
      "proof": "Focused and integration checks passed",
      "humanIntervention": "No rescue"
    },
    "executions": [
      { "label": "before", "host": "codex", "task": "EXACT-BASELINE-ID" }
    ]
  },
  "candidate": {
    "notes": {
      "outcome": "Same outcome through linked smaller stories",
      "proof": "Focused checks only",
      "humanIntervention": "Maintainer repaired one failure"
    },
    "executions": [
      { "label": "first story", "host": "codex", "task": "EXACT-FIRST-ID" },
      { "label": "continuation", "host": "codex", "task": "EXACT-SECOND-ID" }
    ]
  }
}
```

Every member keeps its figures, settings, sources, boundaries, gaps and agent
peaks. Each side also exposes deduplicated figures per host. Overlapping native
selections reconcile response IDs before shared contribution accounting. Cursor
repeated file identities count once. Stored-only counters keep provenance;
identical stored contributions count once, while cross-selection response
uniqueness cannot be reconstructed and remains a named gap. When native and
stored selections cover the same session, group totals retain only the known
native subtotal and qualify the unprovable overlap; each execution still shows
its stored figures. Disjoint stored sessions remain included. Group agent peaks
are recomputed from the deduplicated request union, including its missing-input
coverage. Missing sources and
unknown counters never become zero. Group peaks stay per agent; they are never
summed. Deltas appear only for like hosts, definitions and known metric values;
partial values yield differences of known subtotals, with their coverage shown.
Different settings, proof, intervention or boundaries do not suppress figures.
Inspect the retained context before judging a difference.
## Definitions and limits

- Codex total input is native inclusive `input_tokens`, including cache reads
  and writes. It remains known when its cache breakdown is missing. The shared
  reader's reported values must agree; conflicting observations remain unknown.
  Disjoint uncached/read/write counters retain their individual coverage.
- Claude total input sums disjoint fresh input, cache reads and cache writes.
  Missing components make the observed sum a lower bound. Cache write lifetime
  splits remain distinct and may be unavailable.
- Total tokens add total input and output, keeping partial subtotals labelled.
  Reasoning output is already a subset of output; it is never another charge.
- Per-agent peak input is the maximum observed selected request input. Missing
  input or requests qualifies it as an observed lower bound. Stored summaries
  cannot reconstruct peaks. Peaks across agents are never additive.
- Idle-wake exposure counts a request only when its immediately preceding
  retained tool results establish solely an empty still-running continuation or
  explicit wait timeout, with no observed progress. Mixed results, unsupported
  envelopes and missing joins stay unclassified; clock calls are separate
  workflow evidence. Repeated result rows add no requests. Exposure is not
  proved waste or a savings claim.
- Cursor reports retained transcript/worker counts, bytes, tools, Read (including
  skill and plan reads), Task, AwaitShell and TodoWrite, resolving supported
  dynamic wrappers. Known consistent tool IDs count once; ID-less rows are
  occurrences with unknown uniqueness. Conflicting IDs are excluded. Its token,
  request, context peak and wake measures are unavailable. Directory belonging
  cannot establish task/turn/time boundaries: requested windows warn and the
  whole retained family remains explicit. Bytes are not tokens or live context.

Requested settings and observed settings are separate. Model, effort, tier,
guidance and coverage changes remain visible. Missing native files may preserve
stored whole-task counters, but cannot establish request timestamps, ownership
detail, peaks or wakes. No account-wide completeness is claimed. These are
exploratory retrospective comparisons: lower tokens, different effort, less
proof or more human rescue never produce an automatic winner, improvement,
causal conclusion, invoice or controlled-trial claim.
