# Source review: SEED-229#reduce-remote-sessions-traffic

Launch: fresh general-purpose sub-agent, no conversation inheritance, 2026-11-04,
during slice 1 acceptance. Input: the selected story's Goal, Why now, Scope,
Considered and deferred, Key examples and priority text only, with instructions
to read no project files, change nothing, and return numbered commitments.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer over a limited connection can see which sessions need attention while downloading substantially less data | slice 1 | observed: sessions-replay after-final overview 322.3 kB gzip of 2.03 MB (84% fewer); agent-launch-session-state-pace.spec.ts passes |
| 2 | That developer can open retained session details while downloading substantially less data | slice 1 | observed: sessions-replay after-final history 1,251 kB gzip of 9.88 MB (87% fewer); agent-launch-retained-history.spec.ts step reads it once, gzip-encoded |
| 3 | Evaluated against the current overview/history split, independently of gains from deploying it | slice 1 | observed: replay Before column uses e69e74cf7 identity sizes (2.03 MB overview, 9.88 MB history), not the pre-split 9.90 MB |
| 3a | Context, not a commitment: measured cold-load and poll-frequency figures | slice 1 | observed: context only; plan Baseline records it |
| 3b | Per-reply reduction applies to every changed full overview, not only the cold load | slice 1 | observed: replay rows One state change and 4 viewers at once after a change, each 322.3 kB gzip, 84% fewer |
| 4 | Reduce bytes transferred by full Sessions overview responses | slice 1 | observed: agent-launch-sessions-encoding.spec.ts full overview test, raw gzip bytes below identity |
| 5 | Reduce bytes transferred by on-demand history responses | slice 1 | observed: agent-launch-sessions-encoding.spec.ts full history test, raw gzip bytes below identity |
| 6a | Preserve the existing session states | slice 1 | observed: agent-launch-session-state-pace.spec.ts both tests pass on the change |
| 6b | Preserve the existing attention pace | slice 1 | observed: agent-launch-session-state-pace.spec.ts step blocked with a reason shows within one pace |
| 6c | Preserve the existing revision checks | slice 1 | observed: encoding spec decoded revision equals identity revision; unchanged answer test returns revision and unchanged marker |
| 6d | Preserve access to retained details | slice 1 | observed: agent-launch-retained-history.spec.ts and agent-launch-done-listing.spec.ts pass |
| 7 | A local session remains machine evidence | slice 1 | observed: diff changes only the transport in agentLaunchResponse.ts and machineSessionObservation.ts answer encoding |
| 7a | Visibility does not change published story membership | slice 1 | observed: no story-state or Intent code in the diff; transport-only change |
| 7b | Visibility does not change story progress | slice 1 | observed: no story-state or Intent code in the diff; transport-only change |
| 7c | Visibility does not change the evidence shown in Intent | slice 1 | observed: no story-state or Intent code in the diff; transport-only change |
| 8a | EXCLUSION: portraits | slice 1 | observed: respondToLaunch negotiates only SharedAnswer sessions answers; portraits untouched |
| 8b | EXCLUSION: terminal streaming | slice 1 | observed: terminal code untouched in the diff |
| 8c | EXCLUSION: other endpoints | slice 1 | observed: respondToLaunch body answers stay unencoded; boundary suite 957 passed |
| 8d | EXCLUSION: hosting configuration | slice 1 | observed: no Vite or hosting config change in the diff |
| 8e | EXCLUSION: a protocol for partial updates | slice 1 | observed: full answers still sent whole; no partial-update change |
| 9 | gzip is the preferred encoding | slice 1 | observed: agentLaunchResponse.ts acceptsGzip negotiates gzip |
| 9a | Deferred: Brotli | slice 1 | observed: encoding spec br, deflate field receives identity |
| 9b | Deferred: narrower done listing; a done entry keeps showing its message | slice 1 | observed: agent-launch-done-listing.spec.ts retained sessions show as the full answer showed them |
| 9c | Deferred: sending only changed records | slice 1 | observed: full answers still sent whole |
| 9d | Deferred options remain follow-up candidates | slice 1 | observed: seed Considered and deferred retained unchanged |
| 10 | Journey: about 1,000 retained sessions, then an open session needs attention | slice 1 | observed: sessions-replay fixture 1,005 records, 1,034 attempts with one state change |
| 10a | First full overview at least 70% fewer bytes to a gzip-accepting client | slice 1 | observed: sessions-replay after-final First full answer after start 322.3 kB gzip of 2.03 MB, 84% fewer |
| 10b | Changed full overview at least 70% fewer bytes to a gzip-accepting client | slice 1 | observed: sessions-replay after-final One state change 322.3 kB gzip, 84% fewer |
| 10c | Target at most 650,000 bytes for the replay fixture | slice 1 | observed: sessions-replay after-final 322.3 kB for first and changed overview |
| 10d | Attention status appears within the existing refresh pace | slice 1 | observed: agent-launch-session-state-pace.spec.ts step blocked with a reason shows within one pace |
| 10e | An unchanged poll carries only its revision and unchanged marker | slice 1 | observed: encoding spec unchanged overview answer body equals revision and unchanged true; replay unchanged 96 B |
| 11 | Journey: a developer opens retained history | slice 1 | observed: agent-launch-retained-history.spec.ts expanding Recently done sessions |
| 11a | Full history reply at least 70% fewer bytes on the same fixture | slice 1 | observed: sessions-replay after-final History ask 1,251 kB gzip of 9.88 MB, 87% fewer |
| 11b | History reply still supplies the same detail | slice 1 | observed: encoding spec full history test gunzip equals identity body |
| 11c | The page asks for history on demand | slice 1 | observed: agent-launch-retained-history.spec.ts step polls while nothing retained is opened ask no history |
| 11d | History request is made under its own revision | slice 1 | observed: agent-launch-retained-history.spec.ts step a moved history is read again only at the next opening |
| 11e | A failed history read leaves the listing usable | slice 1 | observed: agent-launch-retained-history.spec.ts test a failed history read leaves retained sessions as shown |
| 11f | A failed history read can be retried | slice 1 | observed: agent-launch-retained-history.spec.ts test the next opening asks again |
| 12 | Trigger: client omits gzip support or explicitly refuses it | slice 1 | observed: encoding spec declining list includes absent field and gzip;q=0 |
| 12a | That client receives the same full JSON with identity encoding | slice 1 | observed: encoding spec declined body equals plain body, no content-encoding |
| 13a | Reply stays private to the existing local boundary | slice 1 | observed: encoding spec a read from another site is refused 403 |
| 13b | Browser does not store the reply in its HTTP cache | slice 1 | observed: encoding spec cache-control no-store on accepting, declining, unchanged and refused replies |
| 14 | Top-priority usability fix for the existing workflow | slice 1 | observed: context only; backlog priority |
| 14a | Supports access to North Star evidence | slice 1 | observed: context only; Sessions and retained history remain available |
| 14b | Alongside the backlog focus on Purpose and Proof | slice 1 | observed: context only |
