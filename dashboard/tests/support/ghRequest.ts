// What one `gh` invocation handed to the fake GitHub (./fakeGitHub.ts)
// asked GitHub for, recognized from its argv.

// What one `gh` invocation asked GitHub for. A ref request asks which
// commit a ref names. A contents request asks for a file's raw bytes when it
// accepts one of GitHub's raw media types, recorded as `mediaType`, and
// otherwise for a directory's JSON listing. A commit list
// asks for the commits that changed one path in a revision's history, as many
// as one page holds. A
// branch request asks which commit one published branch head names; a
// matching-refs request lists every published branch head, conditionally on
// an `If-None-Match` header's entity tag when one is given. A compare request
// asks how a head commit relates to a base commit.
export type GhRequest =
  | {
      readonly kind: "ref";
      readonly repository: string;
      readonly ref: string;
    }
  | {
      readonly kind: "commit";
      readonly repository: string;
      readonly sha: string;
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
      readonly kind: "content";
      readonly repository: string;
      readonly path: string;
      readonly revision: string;
      readonly mediaType: RawMediaType;
    }
  | {
      readonly kind: "listing";
      readonly repository: string;
      readonly path: string;
      readonly revision: string;
    }
  | {
      readonly kind: "commit-list";
      readonly repository: string;
      readonly path: string;
      readonly revision: string;
      // How many of the latest commits are asked for (`per_page`), when
      // said: 1 asks when the path was last committed rather than its history.
      readonly perPage: number | undefined;
    }
  | {
      readonly kind: "compare";
      readonly repository: string;
      readonly base: string;
      readonly head: string;
    }
  | { readonly kind: "unknown" };

// GitHub's raw media types: both answer a file's raw bytes, labeled with the
// type asked for.
const rawMediaTypes = [
  "application/vnd.github.raw",
  "application/vnd.github.raw+json",
] as const;
export type RawMediaType = (typeof rawMediaTypes)[number];

function isRawMediaType(value: string | undefined): value is RawMediaType {
  return rawMediaTypes.some((type) => type === value);
}

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
    if (/^[0-9a-f]{40}$/.test(ref[2])) {
      return { kind: "commit", repository: ref[1], sha: ref[2] };
    }
    return {
      kind: "ref",
      repository: ref[1],
      ref: ref[2],
    };
  }
  const compare =
    /^repos\/([^/]+\/[^/]+)\/compare\/([0-9a-f]{40})\.\.\.([0-9a-f]{40})(?:\?.*)?$/.exec(
      endpoint,
    );
  if (
    compare?.[1] !== undefined &&
    compare[2] !== undefined &&
    compare[3] !== undefined
  ) {
    return {
      kind: "compare",
      repository: compare[1],
      base: compare[2],
      head: compare[3],
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
      perPage: query.has("per_page")
        ? Number(query.get("per_page"))
        : undefined,
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
    const read = {
      repository: content[1],
      path: decodeURIComponent(content[2]),
      revision: content[3],
    };
    const accept = headerArgument(argv, "Accept");
    return isRawMediaType(accept)
      ? { kind: "content", ...read, mediaType: accept }
      : { kind: "listing", ...read };
  }
  return { kind: "unknown" };
}
