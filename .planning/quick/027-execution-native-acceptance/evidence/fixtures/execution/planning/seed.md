# Greeting usability
## Trim names
Status: completed
Goal: A CLI user receives a clean greeting when a name has surrounding spaces.
Scope: Trim leading/trailing whitespace of the first CLI argument. Keep internal spaces and existing default Guest behavior. No other CLI changes.
Key examples: argument "  Ada  " produces "Hello, Ada!"; "Ada Lovelace" stays intact; no argument produces "Hello, Guest!".
