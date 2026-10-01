# Dashboard session troubleshooting

Codex terminal attachment uses the conversation's saved workspace and app-server
endpoint. “Ready for review” describes its native turn; it does not establish
that the saved directory exists or that attachment will succeed.

When refresh confirms the saved workspace is missing, cards, Recent sessions
and the Sessions sidebar offer **Read final report**. The read-only dashboard
panel shows that conversation's retained final report and explains why terminal
continuation is unavailable. Missing does not establish why the directory went
away or that the associated story is complete. Reading or closing the report
changes no done mark. **Mark as done** remains a deliberate action.

If the workspace lookup is inconclusive, the dashboard says availability could
not be established and offers the same passive report access. A failed report
read explains the limitation and offers **Retry report** for the same saved
conversation. It retains identity and attention; it never recreates a directory,
resumes elsewhere or creates a replacement conversation. Retry requires the saved
native endpoint to remain reachable. A completed final agent answer is required;
the panel does not substitute an older report or show the full transcript.

Existing-workspace Codex sessions and Claude Code retain terminal continuation.
If the directory disappears after refresh, attachment-time handling is still a
separate boundary: an attachment failure does not alone prove workspace absence.
