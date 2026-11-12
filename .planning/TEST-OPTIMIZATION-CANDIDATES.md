# Test Optimization Candidates

## Live candidates

### later-comparison-walk-gh-starts

- **Affected test or fixture:** `dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts:31`,
  its "later" case, and the two "later" cases of the same file that share
  `dashboard/tests/support/pendingLandedComparison.ts`.
- **Observed cost and conditions:** a local case body of 15.5 s at one worker
  and host load about 45 (2026-11-12, `c90a4d62d`), of which about 10 s is
  the server's sequential later-build walk: 120 fake `gh` calls, 101 of them
  `actions-runs`, each a Node process start of about 100–150 ms under that
  load. The shared landing fixture takes about 2.2 s. The case exceeded the
  30 s default once at one worker and load about 70, and ran 25.6–28.8 s
  alone at loads 70 falling to 43; CI records about 38 s for the four-case
  file (`dashboard/longest-first-additions`).
- **Unique protection:** proof that stays unanswered keeps a landing pending
  even when 29 later revisions put the end past the 30-revision walk; it
  recovers after the observation clock passes the landing hour, and final
  answers reuse the proof without asking again.
- **Alternatives tried:** the 29 later commits now share one Git import
  (`449a0b919`), saving 1–2 s, below end-to-end noise. Fewer later revisions
  would no longer cross the walk. Faster polling changes nothing: the
  recovered history takes the walk's own time.
- **Decision or evidence needed:** a developer decision between batching or
  parallelising the product's revision lookups in
  `dashboard/server/laterTrunkBuild.ts`, a cheaper synthetic `gh` start for
  the whole suite, batching `publishUnbuiltStoryLanding`, or accepting the
  cost beside the case.
