# Greeting

A small CLI that prints a Hello greeting for a supplied name.

The first command-line argument is the only name source; there is no fallback
to an environment variable, a config file, or standard input. Leading and
trailing whitespace on that argument is trimmed before printing, while
internal spaces are kept (e.g. `"  Ada  "` and `"Ada Lovelace"` both print
correctly). Omitting the argument prints `Hello, Guest!`.

Tests live in `test/greet.test.mjs`.
