# Last successful Intent proof

<a id="last-successful-intent-proof"></a>

### Record and read only successful scenario proof

**Identity:** SEED-220#last-successful-intent-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** A developer reading Intent sees the last successful proof for each
scenario, with retry counts retained, and no stale success after that scenario
fails.

**Source:** Terry's 2026-11-02 instruction: record only passing scenarios,
preserve retry counts, show last successful proof, and clean up earlier proof
when a scenario fails.

**Scope:** Update Open Dough's shared Cucumber proof contract, Intent file and
folder reading and wording, and existing Pygardon and Doughnut recorders and
retained proof. Keep successful scenarios from mixed-result runs, their source
association and retry counts. A final failed scenario removes all earlier
proof for that identity; unrelated and unexecuted scenarios keep their proof.
Legacy failed observations must never reveal an older pass as successful proof.
Dry/filtered non-runs must not delete proof. Intermediate retry failures do not
delete a final retry-assisted pass.

**Examples:** A pass with two attempts appears as last successful proof with
two attempts. A later final failure leaves no successful proof for that
scenario while another scenario's earlier pass remains. A later pass restores
proof. Outline example rows are independent identities. Published older proof
containing failures is read safely.

**Boundaries:** No new test runner families, CI status view, release, or rollout
of installed Open Dough payload copies. Preserve runner output and exit meaning.

Verification follows the repository's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).
