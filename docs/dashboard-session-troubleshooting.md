# Dashboard session troubleshooting

After a computer restart, starting the dashboard server automatically starts or
reuses the Codex background service when saved Codex sessions are retained.
This applies to both development and built preview servers. Reopening a saved
session keeps its original conversation, workspace and endpoint. Service startup
alone never resumes its work or sends a new message.

If Codex is unavailable or refuses to start, saved records remain and the
dashboard stays usable. Ensure the Codex CLI is available to the dashboard,
then run `codex app-server daemon start` and retry **Reconnect**. Restarting an
already-running daemon is never automatic.

Codex terminal attachment uses the conversation's saved workspace and app-server
endpoint. “Ready for review” describes its native turn; it does not establish
that the saved directory exists or that attachment will succeed.

When refresh confirms the saved workspace is missing, cards, Recent sessions
and the Sessions sidebar offer **Read final report**. The read-only dashboard
panel shows that conversation's retained final report and explains why terminal
continuation is unavailable. Missing does not establish why the directory went
away or that the associated story is complete. Reading or closing the report
changes no done mark. **Mark as done** remains a deliberate action: in the
report panel, as on a card, a session whose intended work is not known to be
complete is asked about first, below the panel's header, before anything is
marked ([Mark as done](../dashboard/AGENT-LAUNCH-TERMINALS.md)).

If the workspace lookup is inconclusive, the dashboard says availability could
not be established and offers the same passive report access. A failed report
read explains the limitation and offers **Retry report** for the same saved
conversation. It retains identity and attention; it never recreates a directory,
resumes elsewhere or creates a replacement conversation. Retry requires the saved
native endpoint to remain reachable. A completed final agent answer is required;
the panel does not substitute an older report or show the full transcript.

Existing-workspace Codex sessions and Claude Code retain terminal continuation.
Attachment checks the saved directory again, so disappearance after refresh
opens the same conversation's read-only report with the missing-workspace
explanation. An inconclusive action-time lookup explains uncertainty instead.
If native startup fails before readiness, the dashboard rechecks the directory
before choosing that report fallback. A generic startup failure or exit code
does not establish workspace absence: other failures keep their attachment
error and reconnect action. These fallbacks preserve the developer's done mark,
never recreate the directory and never resume in a different workspace.
