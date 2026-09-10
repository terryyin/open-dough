# Greeting

A small CLI that prints `Hello, {name}!` for a supplied name, with no extra
prefix before Hello.

A supplied name keeps every space that sits between its words; only spaces at
the two ends are dropped before the greeting line is printed. When the name
argument is omitted, the greeting uses Guest. The CLI does not read a name
from the environment, a config file, or standard input; the first command-line
argument is the only name source.

Tests live in `test/greet.test.mjs`.
