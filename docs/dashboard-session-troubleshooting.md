# Dashboard session troubleshooting

Codex terminal attachment starts in the conversation's saved workspace and uses
its saved app-server endpoint. The workspace must still exist. If it has been
removed, the terminal can exit without output before becoming ready, and the
dashboard displays “The session could not be attached.” Reconnect repeats the
same saved context; it does not recreate the workspace. “Ready for review” and
“First input accepted” do not establish that terminal attachment will succeed.
Check the saved workspace and endpoint before choosing a recovery action.
