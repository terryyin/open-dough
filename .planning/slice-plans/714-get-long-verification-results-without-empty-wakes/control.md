# Native Codex control

The control used Codex 0.170.0 app-server over stdio with the Dashboard
client identity, GPT-6.2 Sol, xhigh, and standard speed. It used isolated
clones with local bare remotes at `fad7d53dff7cc6373a16b39969addd1538e8a5de`.
The coordinator read the Distribution delegation instructions (blob
`e65177c4a4ef`). The worker used the foreground proof guidance (blob
`604dee835f34`) copied verbatim into the scratch installation. The
historical product run used the Dashboard's shared daemon and earlier
command-wait guidance. Its worker rollout
`01a1ef33-a824-7a51-8490-d1903d398c28` lines 372–391 supplied the selected
120.925-second phase. The controlled command preserves launch, quiet
interval, and terminal evidence boundaries.

## Success

Worker `01a1f1c5-5010-7061-bc34-c71f1ed8a32f` owned the single command
from launch to exact terminal proof, exit 0 at +120.123 seconds. Its
rollout lines 42–62 associate the original cell and subprocess receipt.
Root `01a1f1c4-defd-7e12-8daa-98a99923361b` reread the same exit file,
run record and success log at +133.71 seconds and finished at +142.05
against a +145-second due check. Root rollout lines 53–56 associate the
60-second timeout, which woke the coordinator during the quiet window.
Worker waiting produced one useful launch handback and one later quiet
host-cell handback, with avoidability undetermined and zero model
handbacks from the inner subprocess continuation. The rate card
`codex-2026-11-19` gives 44,752.80 root units (10 responses) and 37,382.20
worker units (nine responses), combined 82,135.00 through acceptance.

## Overdue failure and CI

Root `01a1f1c9-8658-70d1-8db5-cbaa6ed30ab6` checked the same command at
+60.37 seconds. The run record was live and the exit file was absent.
Worker `01a1f1ca-9b99-7741-ab88-091a8dee76ac` continued that command to
exit 7 at +120.164 seconds. The run record, separate exit file and log
agreed, and the coordinator confirmed the log's literal assertion,
`AssertionError [ERR_ASSERTION]: SEED-345 controlled assertion`.

A local command adapter presented a matching cancelled attempt at +45
seconds. The actual installed observer delivered `CI_INCOMPLETE` through
its Codex yielded cell at +60.37 seconds. Root rollout line 96 carries
the event for the same SHA and the coordinator recorded its disposition
while the worker still owned the live proof. The mailbox receipt shows
the exact observer stopped with zero unread events. The applicable
revision stayed incomplete. This observes a native CI notification from
a controlled provider and leaves GitHub coverage outside the journey.
Combined effort was 192,590.20 units (24 root and 11 worker responses).

The exact prompts, scratch runner, receipt artifacts, raw app-server
events, and per-response rate-card calculation are retained in this
worktree's Git evidence directories before wrap-up.

## Early user stop

The real app-server accepted `turn/steer` at +33.21 seconds from the
slice-clock start, while root `01a1f1ce-06e0-7732-92ab-55822ea20618` was
waiting. The wait returned and the native user input arrived in the
same turn. Owning worker `01a1f1ce-830f-74d1-84e7-bcde3d054a81` and
the root identified the verification's process tree. The actual
termination carried exit 143 at +72.137 seconds. The root verified
the exit file, run record, empty log, absence of the four identified
processes, and same revision and setup state. Successful verification
remained outstanding. Combined effort was 104,133.40 units (16 root
and 11 worker responses).

The three qualified control journeys totaled 378,858.60 units across
81 attributed responses. The quiet root timeout before a genuine
deadline and the observed deadline, stop, and CI routes qualify a
matched candidate comparison.
