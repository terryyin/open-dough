# Frozen common evidence archive

All67 original common/ files are retained byte-for-byte in common.tar.gz,
including manifest plus66 indexed inputs. All entries and every manifest
hash were verified against the originals before removing only new working copies.
No captured diff/log was whitespace-normalized; no Git whitespace exception added.
Archive SHA256 `9eceeec6cb08902bf611cfb7f56b888d62cf1a0dbd246ce0fdcb910351fbec22`.

A/B, reports, audit and scorer retain their original common/ references. Extract
`tar -xzf common.tar.gz -C <temporary-directory>` to recover that exact relative
layout for inspection, with the unchanged A/B/report copies beside it if needed.
Product source remains recoverable with git show90ea7710:<path>. This is evidence
packaging after all arms/scoring ended, not another experiment or changed input.

Masked scorer inputs are separately preserved byte-for-byte in masked-reports.tar.gz
(two original masked MD files, including their final blank lines). Their SCORES.md
hashes stay valid; extract alongside the reports to recover the scorer inputs.
Archive SHA256 `13b877aa7ec4f88d4a6d03531092ff4cc202796bad38533145e19b2ef9d6a4af`.
