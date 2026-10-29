# Exact-byte preservation archive

The original frozen common/ tree is retained in common.tar.gz, including its
manifest, all69 indexed input files and raw trace/dispositions. No review arm
started. A.md/B.md/PREPARATION-RECEIPT.json stay byte-identical to the proposed
inputs; their common/ references describe the original unpacked layout.

Raw Git diff and commit captures legitimately contain trailing whitespace and
a raw report ends with a blank line. Preserve their exact bytes in a compressed
archive so the project's source whitespace check remains intact. No exception
to delivery policy or Git attributes was added; no frozen input was normalized.

Archive SHA256: `8fb5f9a7f1a6a4b958a190e6248e6dbbf876fa20115a17e096536b8eb8efe8d2`.
Before deleting only the newly created working copies, the parent verified every
archived filename and byte against all70 original common files (69 indexed inputs
plus manifest), then checked all69 manifest SHA256 entries from archive bytes.
This packages evidence; it adds no trial observation or successful review claim.

For inspection, extract into a temporary directory, keeping relative common/
paths. `tar -xzf common.tar.gz -C <temporary-directory>` preserves the captured
layout. Copy the unchanged A/B proposals there if following relative links.
Use immutable git-show candidate references for product code. The stopped trial
must not restart these arms under its exhausted audit cap.
