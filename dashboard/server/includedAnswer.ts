// Reading what `gh api --include` printed (`./ghRead.ts`'s conditional ref
// check): GitHub's status line and headers come first, so the boundary can
// decide from GitHub's own status and headers -- a `304`, or a rate limit's
// directed wait (`./rateLimitDirection.ts`) -- before treating `gh`'s exit as
// a failure.

// What `gh api --include` printed: GitHub's status line and headers, then the
// (here `--jq`-filtered) body after the first blank line.
export type IncludedAnswer = {
  readonly status: number;
  readonly headers: ReadonlyMap<string, string>;
  readonly body: string;
};

export function parseIncluded(stdout: string): IncludedAnswer | undefined {
  const lines = stdout.split("\n");
  const statusLine = /^HTTP\/\S+\s+(\d{3})\b/.exec(lines[0] ?? "");
  if (statusLine?.[1] === undefined) {
    return undefined;
  }
  const headers = new Map<string, string>();
  let at = 1;
  for (; at < lines.length; at += 1) {
    const line = (lines[at] ?? "").replace(/\r$/, "");
    if (line === "") {
      break;
    }
    const colon = line.indexOf(":");
    if (colon > 0) {
      headers.set(
        line.slice(0, colon).trim().toLowerCase(),
        line.slice(colon + 1).trim(),
      );
    }
  }
  return {
    status: Number(statusLine[1]),
    headers,
    body: lines.slice(at + 1).join("\n"),
  };
}
