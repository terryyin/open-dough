// Where a link recorded in the backlog leads. The backlog owns what is
// recorded; this only decides whether the recorded target can be opened, and
// as what. A target that names a file is pinned to the inspected commit, so
// the page opened is the evidence this snapshot was read beside, not whatever
// the ref points at later. Nothing here fetches or checks a destination.

import { z } from "zod";
import { splitHref } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import type { PublishedSource } from "./publishedSource";
import { ReadProblem } from "./readProblem";

export type SourceLink =
  // A file in the observed repository, pinned to the revision it names.
  | {
      readonly kind: "snapshot";
      readonly recorded: string;
      readonly url: string;
      readonly revision: string;
    }
  // Somewhere else on the web: not part of this snapshot, not pinned to it.
  | {
      readonly kind: "external";
      readonly recorded: string;
      readonly url: string;
    }
  // Kept as the text it is, with the reason it is not offered as a link.
  | {
      readonly kind: "unusable";
      readonly recorded: string;
      readonly reason: string;
    };

// The shared identity module owns taking a link apart; it is untyped
// JavaScript, so its answer is checked rather than trusted by assertion.
const linkParts = z.object({ path: z.string(), anchor: z.string() });

const leadingScheme = /^([a-z][a-z0-9+.-]*):/i;

function externalLink(recorded: string): SourceLink {
  if (URL.canParse(recorded)) {
    return { kind: "external", recorded, url: new URL(recorded).href };
  }
  return {
    kind: "unusable",
    recorded,
    reason: "This is not a complete web address.",
  };
}

// The repository path a recorded path names, or undefined when it cannot be
// read as one, climbs out of the repository, or does not end in a name of its
// own: an anchor alone, "seeds/", or "seeds/.." names at most a directory.
// Whether a final name really is a file is never checked, since nothing is
// fetched. A leading "/" starts at the repository root, as it does where
// GitHub shows the backlog itself.
function repositoryPath(
  recordedPath: string,
  backlogPath: string,
): string[] | undefined {
  let path: string;
  try {
    path = decodeURIComponent(recordedPath);
  } catch {
    return undefined;
  }
  const resolved = path.startsWith("/")
    ? []
    : backlogPath.split("/").slice(0, -1);
  const segments = path.split("/");
  const last = segments.at(-1);
  if (last === undefined || last === "" || last === "." || last === "..") {
    return undefined;
  }
  for (const segment of segments) {
    if (segment === "..") {
      if (resolved.length === 0) {
        return undefined;
      }
      resolved.pop();
    } else if (segment !== "" && segment !== ".") {
      resolved.push(segment);
    }
  }
  return resolved;
}

// The repository path a snapshot link names, when it names one. Used to fetch
// that file at the pinned revision without re-deriving the path from GitHub's
// HTML URL shape.
export function snapshotRepositoryPath(
  link: SourceLink,
  backlogPath: string,
): string | undefined {
  if (link.kind !== "snapshot") {
    return undefined;
  }
  const parts = linkParts.safeParse(splitHref(link.recorded));
  if (!parts.success) {
    return undefined;
  }
  const file = repositoryPath(parts.data.path, backlogPath);
  return file?.join("/");
}

export function resolveSourceLink(
  recorded: string,
  source: PublishedSource,
  revision: string,
): SourceLink {
  const scheme = leadingScheme.exec(recorded)?.[1]?.toLowerCase();
  if (scheme === "http" || scheme === "https") {
    return externalLink(recorded);
  }
  if (scheme !== undefined) {
    return {
      kind: "unusable",
      recorded,
      reason: `Links that use “${scheme}:” are not opened from here.`,
    };
  }
  const parts = linkParts.safeParse(splitHref(recorded));
  if (!parts.success) {
    throw new ReadProblem(
      "The shared backlog reader took a link apart in a shape this dashboard does not understand.",
    );
  }
  const { path, anchor } = parts.data;
  const file = repositoryPath(path, source.backlogPath);
  if (!file) {
    return {
      kind: "unusable",
      recorded,
      reason: "This does not name a file inside the observed repository.",
    };
  }
  const url = new URL(
    `https://github.com/${source.repository}/blob/${revision}/${file
      .map(encodeURIComponent)
      .join("/")}`,
  );
  url.hash = anchor;
  return { kind: "snapshot", recorded, url: url.href, revision };
}
