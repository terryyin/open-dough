# Feedback maintenance on this machine

Open **System settings → Feedback maintenance** to give this dashboard its
standing authorization for the feedback maintenance cycle, the combined
project and shared findings review that the `maintain-feedback-cycle` skill
runs in Open Dough. It is **Off** by default. Choose a **Host** and,
optionally, a **Model** from the same choices the launch dialog offers (Codex
also offers its reasoning effort), then **Turn on**. The status line reads, for
example, **Feedback maintenance: On, Claude Code, Opus**; **Default** keeps the
host's own model setting. Change the choice and **Save feedback maintenance**
to replace it, or **Turn off** to withdraw it. Host model catalogs are read in
the configured project whose repository is `terryyin/open-dough`.

## When it starts

The cycle records when its next review is due in a
`json dough-feedback-review` block of Open Dough's
`docs/maintainer/near-term-watch-list.md` on its configured ref. While the
setting is On, the production dashboard server checks once it listens and then
every 15 minutes: when the local date has reached that block's `reviewAfter`,
no feedback maintenance session is running on this machine (starting, or open
and not found unavailable), and no launch on this machine has served that due date, it starts one unattached session in the
default checkout of the configured project whose repository is
`terryyin/open-dough`, on the chosen host and model, with the host's spelling
of the cycle's invocation (`/maintain-feedback-cycle` in Claude Code and
Cursor, `$maintain-feedback-cycle` in Codex) and the dashboard reporting
context as its first input; Codex also receives the cycle's skill as a
structured skill item, as a story launch's first input does. Development
servers, which share this file, start nothing.

The session is an ordinary launch record listed under Open Dough in
**Sessions** as **Feedback maintenance**, recording the due date it serves; it
can be attached to, stopped, marked done, or deleted, and passes every launch
gate a developer's session does. Nothing is notified when it starts. The
cycle's completion report is the assessment: a report with nothing needing
attention marks the session done quietly, and a report with a message raises
the unread-report notification once and keeps the session listed until you
mark it done.

One launch serves one due date on this machine. A served date is not launched
again, whether its session is open, done, failed, stopped, or deleted: the
launch attempt that recorded it is kept for 30 days after it settles, and
until the cycle publishes a later due date nothing more starts. A due date
more than 30 days old, the launch retention period, is never started
automatically at all, so a served date whose attempt has aged out is not
launched again either; the cycle stays due until it publishes a later date.
Run the cycle again yourself from Open Dough's **Start session**; the cycle's
rerun rule reuses accepted work. An open session you started yourself with the cycle's
invocation is also this machine's feedback maintenance session, so nothing
starts automatically while it runs. A session that ended unavailable without
being marked done no longer counts as running, but still serves its due date. A watch list that cannot be read, or
that has no valid due block, is not due; a failed read is kept with the
published read failures at `/__authenticated-read-diagnostics?source=<id>`.
Each check while On with no feedback maintenance session running costs the
requests described in [Dashboard GitHub requests](GITHUB-REQUESTS.md).

## Where it stands

The machine's sessions answer carries where feedback maintenance stands, from
the check's last observation and the sessions as they stand at that answer, so
showing it asks GitHub nothing. Open Dough's project row says, beside
**Start session**:

- **Feedback maintenance is running** while a feedback maintenance session is
  open and its conversation not found unavailable, whether the check started
  it or you started it with the cycle's invocation.
- **Feedback maintenance due since 2026-10-28; its automatic session did not
  complete** when a launch served the due date last read and its session was
  marked done, ended, or deleted without the published date advancing.
- **Feedback maintenance due since 2026-10-28; not started:** and why, when
  that date is reached and nothing served it: the launch gates held the
  launch (for example **default main has existing changes (1 changed path)**,
  which the check retries every period until you commit, discard, or move
  them), the setting is off, the date is more than 30 days old, or the next
  check starts it.

Otherwise the row says nothing; nothing is added to backlog cards. The
section's second status line names the next due date last read (**Due since
…** once reached, **Next due …** before) and the last automatic launch's
outcome: none yet, running, done, did not complete, or not started with why,
each with the due date it served. A **done** launch counts as done once a later
due date is read. Both lines clear of the due state once a pushed revision
advances the date and the check reads it. The due date last read and a held
launch are kept in the server's memory: after a restart the row says only
whether feedback maintenance is running, and the section names no due date,
until the check reads the watch list again, which it does at its first check
unless a feedback maintenance session is running. A development server, which
never reads the watch list, says only whether feedback maintenance is running
and the last automatic launch's outcome.

## The saved setting

The server keeps the On choice at
`~/.open-dough/dashboard/feedback-maintenance.json`, resolved through `HOME`,
for example `{"host":"claude","model":"opus"}`. Development and production
share this machine file. It is replaced atomically and is private to its owner
(`0600`) because it authorizes sessions no developer asked for; it is a plain
setting, not a credential. **Turn off** removes the file, and no file means
Off. Only these local endpoints write it, never a session:

| Endpoint | Method | Answer |
| --- | --- | --- |
| `/__feedback-maintenance` | GET | `{"enabled":false}` or `{"enabled":true,"choice":{…}}` |
| `/__feedback-maintenance/save` | POST `{"host", "model"?, "effort"?}` | The saved setting |
| `/__feedback-maintenance/remove` | POST `{}` | `{"enabled":false}` |

Like the other local settings endpoints, they accept only this dashboard's own
page and are never cached. Saving or turning off changes no project, session,
launch record, or project configuration.

An unreadable or malformed file reports a problem in the section, shows the
status as unavailable, and stays exactly as it is: reading, including
**Retry status**, never rewrites it. An explicit **Turn on** replaces it and
**Turn off** removes it. A failed save or removal keeps the previous file;
correct the folder permissions and retry.

[Dashboard overview](README.md) describes the System settings entry.
