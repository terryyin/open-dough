# Native reader gaps

Native rows end at a newline alone, as JSON Lines defines them, so a raw
U+2028 or U+2029 inside row text keeps its row whole. Damaged rows and
compressed streams produce source-specific gaps while other readable responses
survive. A matching filename and response thread can retain
usage when session metadata is absent, with a metadata gap and unknown ancestry.
Legacy cumulative counters without reliable response usage produce an
`unsupported-response-counters` gap; metadata alone produces
`no-response-usage-evidence`. Referenced workers that are missing, incomplete or
ambiguous have explicit gaps. These local checks cannot prove auxiliary or
provider coverage beyond the retained files and references.

`malformed-native-row` and `native-source-unreadable` gaps name their native
host (`codex` or `claude`) and source file. Import and Refresh replace a reread
session's hosted gaps with those its files still report, so completing a damaged
row or restoring a readable stream removes that reader gap. Damage that remains
is still reported, and independently readable responses remain counted.

Gaps already stored without a host retain their historical shape and remain in
the store when that session is reread. Import and Refresh do not automatically
repair that stored history.
