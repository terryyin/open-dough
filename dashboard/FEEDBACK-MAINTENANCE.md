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

**Nothing starts automatically yet.** The section says so: this dashboard does
not yet check when the cycle is due, so the setting authorizes nothing that
happens today. Run the cycle by hand from Open Dough's **Start session**.

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
