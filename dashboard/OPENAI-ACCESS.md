# OpenAI access on this machine

Open **System settings → OpenAI**, including with no projects configured. Enter
an API key in the password field and choose **Save API key**. **Configured**
means the local server saved the key; saving and reading status never contact
OpenAI or verify the key's permissions, balance, or model access.

The server retains one general OpenAI credential at
`~/.open-dough/dashboard/credentials/openai.json`, resolved through `HOME`.
Development and production share this machine credential; their project lists
remain separate. The credential folder is private to its owner (`0700`), and
atomic replacement uses a private temporary and final file (`0600`). Keep this
file out of source control and backups you share. The browser receives status
only, and reopening settings never fills the input with the saved key.

Save a new key to replace the previous one, or choose **Remove API key** to clear
OpenAI access. Neither action changes projects, sessions, or startup instructions.
An empty Save keeps the previous key and asks for input. Failed writes or removal
keep the previous file; correct the folder permissions and explicitly retry.
Unreadable or malformed saved credentials report a configuration problem and
remain untouched until you replace or remove them. **Retry status** reads the
current file again. The server also reads the file afresh for each operation,
so another dashboard process's save or removal is visible on the next read.

The input clears after a successful save/removal or leaving settings. A failed
save keeps its entered draft for an explicit retry. The key is never written to
browser localStorage, project configuration, a launch record, or a URL.
`OPENAI_API_KEY` is neither imported nor a runtime fallback. Brief environment
key use in an authorized experiment remains separate from this saved setting.

[Dashboard overview](README.md) describes the System settings entry.
