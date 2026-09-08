# Plan 014 resolution evidence — 2026-09-07

Outcome: explicit and automatic Codex post-cleanup use pass. The shared skill
requires only context needed for the current request; actual status ambiguity
still stops dependent advice. No adopter policy was added or changed.

The completed execution plan was removed on 2026-09-07. This record retains
acceptance evidence and the useful learning for
[SEED-006 Story 1](../../seeds/SEED-006-extend-adr-guidance-adoption.md#prove-codex-use-after-replacement).

## Learning retained after plan cleanup

The failure came from requiring the entire adopter-context list before any
assessment. No explicit status-precedence rule existed in the original, and the
fixture's statuses agreed. The original did describe supersession maintenance,
but no relevant record indicated supersession and no lifecycle edit was asked
for. Neither missing policy was needed for this request. The minimal fix made
required context and completion conditional on the current request, while
preserving stops for real ambiguity. The fixture's policy was left unchanged.

Native explicit Codex skill expansion need not produce a separate shell read;
the initial proof incorrectly required one. Use native invocation plus actual
skill-specific behavior, with independent automatic skill-read evidence, rather
than repeatedly prompting the agent to produce a preferred loading trace.

Accepted ADR 0000 preserved human decision ownership. ADR 0003's tagged-release
contract was unchanged. Prior native installation/update evidence from
[Plan 007 evidence](../007-generalize-project-guidance/EVIDENCE.md) remains applicable where
source selection, payload paths, and delivery behavior are unchanged; the new
candidate's selected-host installation, native use, and coexistence are verified
below. Live Donut readiness and replacement remain separate, unverified work.

## Shared candidate and native use

All seven observations used the same skill SHA-256:
`ff023b773bf9c5fc5f0f7cf09259df2b96044d28de93f24820820457cc62cd4e`.
Each disposable source was locally tagged `v0.2.0` from the working source for
fixture identity. These commits are not published release commits. Source and
complete adopter snapshots matched before/after every native assessment,
including installed payload/version, ADRs, retained context, unrelated guidance,
and other-tool sentinels. The selected native installation matched the candidate.

| Host | Native version | Invocation / behavior evidence |
| --- | --- | --- |
| Codex | `codex-cli 0.144.1` | Explicit `$dough-adr-awareness` native expansion performed the installed skill's unique completion instruction. Automatic use successfully read `.agents/skills/dough-adr-awareness/SKILL.md` and retained rules with no ADR/skill hint. Commands read only fixture ADR context, not the removed original. |
| Cursor | `2026.09.02-c22c1a3` | Both transcripts contain successful `readToolCall` results for `.cursor/skills/dough-adr-awareness/SKILL.md`, including the changed context paragraph. No Codex candidate was left discoverable in these targets. |
| Claude Code | `2.1.263` | Both transcripts contain native `Skill` calls with `skill: dough-adr-awareness`; only `.claude/skills/` contains the candidate. `CLAUDE.md` imports the fixture's existing `AGENTS.md`. Read/Glob/Grep/Skill were the only allowed tools. |

Cursor/Claude loading assertions were checked against the recorded transcripts
after adding those assertions to the harness; no new native sessions were needed.

## Observations and integrity

Every hash below is the identical before **and** after complete target snapshot.

| Observation | Local fixture commit | Target snapshot SHA-256 |
| --- | --- | --- |
| Codex explicit | `7b85ba5ec4b790acadff6f4bddc63f2bb992ac0d` | `466d22f1df5eb6eda1669c48288e317d98675dc4185f55b9f38eca4eed6f1485` |
| Codex automatic | `f87ae3b890c86730e4470c6149dd50d8cb94b0a6` | `466d22f1df5eb6eda1669c48288e317d98675dc4185f55b9f38eca4eed6f1485` |
| Codex real disagreement | `12665cb4e474b16b4079b1ec3691e4f3c1b4fd1d` | `ab9c74799f1a73347d2de245a9534eb9d2fe0b37754c2e9336643373bb142016` |
| Cursor clear | `23765f69739562de8080b2774fc727df73e5d5fa` | `9ca4e3d3616a399bd95a10c4cd4fb1f8d6f3745c212e4cb1150d5c9bf3f3488b` |
| Cursor real disagreement | `1358804564b3428a958f64cd1e9e0665e256891b` | `a43740d8aacd4e578287b37ec41cf19d44ff2fe22639a1de3523f09f98daa0b6` |
| Claude clear | `b02a60b9edc48c4d4e8924e2e04c7176f53f7d18` | `380ce3f3d0f66b3cd4eae180d74dac8aaccaaf53afd9ab445991c98ad1f97258` |
| Claude real disagreement | `b1182ffe10a1311422f6e17d08f92aeedb7f781b` | `02367b9c55c9dfaf43ae8da98ab7edeefab8a1213520348633d73c901ab95974` |

All clear cases used the original session-storage question, prefixed with
`Use $dough-adr-awareness.` for explicit use. They cited Accepted ADR 0001,
recommended Redis, kept Proposed ADR 0002 non-binding, and treated the filename
mismatch as hygiene. All explicit clear cases emitted `ADR CHECK COMPLETE`.

The negative case changed only the test index's ADR 0001 status to Proposed;
the record remained Accepted. The prompt did not reveal the mismatch. Each
host discovered and named both conflicting sources/statuses, withheld completion,
and stopped for human resolution rather than selecting a precedence rule.
Codex described Redis only conditionally on human confirmation of Accepted
status. Cursor and Claude withheld a definite architecture recommendation.

## Current regression checks

The original adoption fixture and `adr-adoption-codex-use.sh` harness were
retired with the reusable replacement procedure. The historical identities and
observations above remain evidence for that run; the current direct-fixture
checks below cover post-cleanup use and context behavior without reproducing the
retired procedure.

From the repository root:

```sh
bash tests/dough-adr-awareness-codex-use.sh --native explicit
bash tests/dough-adr-awareness-codex-use.sh --native automatic
bash tests/dough-adr-awareness-context.sh --native codex conflict
bash tests/dough-adr-awareness-context.sh --native cursor clear
bash tests/dough-adr-awareness-context.sh --native cursor conflict
bash tests/dough-adr-awareness-context.sh --native claude clear
bash tests/dough-adr-awareness-context.sh --native claude conflict
```

`npm test` and `npm run lint` passed. Native calls require authenticated local
tools; defaults build/check fixtures without silently claiming native success.
The existing protected Codex runner and sandboxed Cursor runner were reused.

Raw local logs are `/tmp/open-dough-014-fixed-{explicit,automatic}.log`,
`/tmp/open-dough-014-{codex,cursor,claude}-conflict.log`, and
`/tmp/open-dough-014-{cursor,claude}-clear.log`; those temporary logs are optional
detail, while this record preserves the decisive observations and identities.

No release, real Donut edit, or generic migration was performed. Open Dough's
recorded released installations were not overwritten with untagged source.
