// What one `gh` invocation handed to the fake GitHub (./fakeGitHub.ts)
// asked GitHub for, recognized from its argv.

// What one `gh` invocation asked GitHub for. A ref request asks which
// commit a ref names. A contents request asks for a file's raw bytes when it accepts GitHub's raw
// media type, and otherwise for a directory's JSON listing. A commit list
// asks for the commits that changed one path in a revision's history. A
// branch request asks which commit one published branch head names; a
// matching-refs request lists every published branch head, conditionally on
// an `If-None-Match` header's entity tag when one is given.
export type GhRequest =
  | {
      readonly kind: "ref";
      readonly repository: string;
      readonly ref: string;
    }
  | {
      readonly kind: "matching-refs";
      readonly repository: string;
      readonly ifNoneMatch: string | undefined;
    }
  | {
      readonly kind: "branch";
      readonly repository: string;
      readonly branch: string;
    }
  | {
      readonly kind: "content" | "listing" | "commit-list";
      readonly repository: string;
      readonly path: string;
      readonly revision: string;
    }
  | { readonly kind: "unknown" };

// The value of one `-H "<name>: <value>"` argument, if given.
function headerArgument(
  argv: readonly string[],
  name: string,
): string | undefined {
  const prefix = `${name.toLowerCase()}:`;
  for (let at = 0; at < argv.length - 1; at += 1) {
    const value = argv[at + 1] ?? "";
    if (argv[at] === "-H" && value.toLowerCase().startsWith(prefix)) {
      return value.slice(prefix.length).trim();
    }
  }
  return undefined;
}

export function parseRequest(argv: readonly string[]): GhRequest {
  const endpoint = argv.find((arg) => arg.startsWith("repos/")) ?? "";
  const ref = /^repos\/([^/]+\/[^/]+)\/commits\/(.+)$/.exec(endpoint);
  if (ref?.[1] !== undefined && ref[2] !== undefined) {
    return {
      kind: "ref",
      repository: ref[1],
      ref: ref[2],
    };
  }
  const heads = /^repos\/([^/]+\/[^/]+)\/git\/matching-refs\/heads\/$/.exec(
    endpoint,
  );
  if (heads?.[1] !== undefined) {
    return {
      kind: "matching-refs",
      repository: heads[1],
      ifNoneMatch: headerArgument(argv, "If-None-Match"),
    };
  }
  const branch = /^repos\/([^/]+\/[^/]+)\/git\/ref\/heads\/(.+)$/.exec(
    endpoint,
  );
  if (branch?.[1] !== undefined && branch[2] !== undefined) {
    return {
      kind: "branch",
      repository: branch[1],
      branch: branch[2].split("/").map(decodeURIComponent).join("/"),
    };
  }
  const commitList = /^repos\/([^/]+\/[^/]+)\/commits\?(.+)$/.exec(endpoint);
  if (commitList?.[1] !== undefined && commitList[2] !== undefined) {
    const query = new URLSearchParams(commitList[2]);
    return {
      kind: "commit-list",
      repository: commitList[1],
      path: query.get("path") ?? "",
      revision: query.get("sha") ?? "",
    };
  }
  const content = /^repos\/([^/]+\/[^/]+)\/contents\/([^?]+)\?ref=(.+)$/.exec(
    endpoint,
  );
  if (
    content?.[1] !== undefined &&
    content[2] !== undefined &&
    content[3] !== undefined
  ) {
    return {
      kind:
        headerArgument(argv, "Accept") === "application/vnd.github.raw+json"
          ? "content"
          : "listing",
      repository: content[1],
      path: decodeURIComponent(content[2]),
      revision: content[3],
    };
  }
  return { kind: "unknown" };
}
