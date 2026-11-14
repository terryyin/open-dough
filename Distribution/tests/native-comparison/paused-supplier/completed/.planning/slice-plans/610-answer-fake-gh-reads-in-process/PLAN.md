# Answer fake GitHub reads without a process per call

**Identity:** SEED-332#answer-fake-gh-reads-in-process
**Source:** [story](../../seeds/SEED-332-answer-fake-gh-in-process.md#answer-fake-gh-reads-in-process)
**Owner:** philip-chan, on `codex/answer-fake-gh-reads-in-process`.
Execution evidence is kept in `evidence.md` beside this plan on that branch.

## Ordered slices

### 1. An in-process reader answers like the per-process reader
Type: Behavior
Status: done
Proof: `createFakeGhReader(fixture).read(args)` returns what `readFakeGh`
returns for every supported read; the full suite passes.

### 2. The reader is stable under natural load
Type: Behavior
Status: done
Proof: earlier unexplained failures explained; three consecutive family
passes in a natural one-minute CPU-load 30–50 window, every case within 25 s;
hosted CI on the published revision.
