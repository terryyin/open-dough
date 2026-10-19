# Recovery context capture limit

After recovery native session 70830 completed, the evaluator mistakenly copied the prior cycle-context.json over the native-generated resume-context.json while retaining artifacts. No Git state, accepted commit, candidate, source record or publication pair was changed. The exact native-complete resume context is no longer available and has not been reconstructed or presented as original evidence.

The supplied stale partial context is retained as unchanged-supplied-stale-context.json. The complete native report, actual resume trace, raw resume-pushes (resume-publication.jsonl), terminal publication/refresh/retirement output and independent origin capture remain available. The final unchanged invocation receives that stale context plus the correct complete report and inspects real current records/remote facts. This is explicitly part of its observed starting conditions. No mutating recovery script was rerun to recover the context.
