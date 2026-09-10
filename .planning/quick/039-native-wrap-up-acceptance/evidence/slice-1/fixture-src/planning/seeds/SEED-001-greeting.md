---
id: SEED-001
status: active
---

# Greeting stories

<a id="trim-names"></a>

## Trim names

**Status:** completed
**Active plan:** [Trim names](../plans/trim-names.md)

Goal: A CLI user receives a clean greeting when a name has surrounding spaces.
Scope: Trim leading and trailing whitespace of the first CLI argument. Keep
internal spaces and existing default Guest behavior. No other CLI changes.
Key examples: argument "  Ada  " produces "Hello, Ada!"; "Ada Lovelace" stays
intact; no argument produces "Hello, Guest!".

<a id="formal-titles"></a>

## Formal titles

**Status:** planned

Goal: A CLI user can request a formal greeting that prefixes an honorific.
Scope: Optional `--formal` flag that prints "Hello, Dr. {name}!" for the
existing name argument. Keep the current default greeting unchanged when the
flag is absent. No other CLI changes.
Key examples: `node src/greet.mjs --formal Ada` produces "Hello, Dr. Ada!";
omitting `--formal` still produces "Hello, Ada!".
