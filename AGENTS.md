# Open Dough acceptance guard

Every Open Dough rule or skill must work in Codex, Cursor, and Claude Code.
For additions or changes, acceptance criteria must cover native discovery,
invocation or application, and intended behavior on all three; include
installation, updating, and coexistence where affected. Record per-platform
evidence in the plan or change summary. Reuse earlier evidence only when the
change does not invalidate it. Missing native verification stays pending;
file copying or success in one tool does not prove the others work.
Keep shared behavior in one source with minimal platform adaptation.

This guard is internal to this repository; do not distribute it via the installer.
