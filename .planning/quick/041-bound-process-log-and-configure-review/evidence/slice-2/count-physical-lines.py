#!/usr/bin/env python3
"""Count physical text lines, including a final unterminated line once."""

import pathlib
import sys

path = pathlib.Path(sys.argv[1])
data = path.read_bytes()
n = 0 if not data else data.count(b"\n") + (0 if data.endswith(b"\n") else 1)
print(n)
