---
id: SEED-001
status: active
---

# Greeting stories

<a id="formal-titles"></a>

## Formal titles

**Status:** planned
**Active plan:** [Formal titles](../plans/formal-titles.md)

Goal: A CLI user can request a formal greeting that prefixes an honorific.
Scope: Optional `--formal` flag that prints "Hello, Dr. {name}!" for the
existing name argument. Keep the current default greeting unchanged when the
flag is absent. No other CLI changes.
Key examples: `node src/greet.mjs --formal Ada` produces "Hello, Dr. Ada!";
omitting `--formal` still produces "Hello, Ada!".
