# Representative distinct recovery record

- E1: A supplied representative execution record established the review boundary
  under stable reference `record:slice-2-distinct-recovery`.
- E2: The reviewer reconstructed that same execution boundary before aggregate
  review.
- E3: Product review reopened the plan and commit membership after the boundary
  had already been established.
- E4: Process review reconstructed the boundary a third time.

These events demonstrate the same concrete repeated-context-recovery issue as
`DD-001`, in distinct execution `record:slice-2-distinct-recovery`. This is an
explicitly supplied representative execution-record reference, not a claim about
a repository commit or reconstructed real transcript.
