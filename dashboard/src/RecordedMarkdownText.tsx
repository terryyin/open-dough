// Recorded Markdown prose that keeps its wording and turns only
// `[label](target)` links through `resolveSourceLink` into pinned snapshots
// or external destinations. Text such as `sha:path` stays as recorded. A
// snapshot that names a configured Intent file can open in Intent instead
// when the caller supplies that inventory and selection callback.

import { Fragment, type ReactNode } from "react";
import type { IntentConfiguredInventory } from "./intentCandidatesLocationMatch.ts";
import type { OpenCandidateLocation } from "./intentWorkspaceSelection.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { shortRevision } from "./publishedWork.ts";
import {
  leaveDashboard,
  resolveSourceLink,
  snapshotRepositoryPath,
  type SourceLink,
} from "./sourceLink.ts";

const markdownLink = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function Linked({
  link,
  label,
  containingFilePath,
  inventory,
  entrySlug,
  onOpenIntentFile,
}: {
  readonly link: SourceLink;
  readonly label: string;
  readonly containingFilePath: string;
  readonly inventory?: IntentConfiguredInventory;
  readonly entrySlug?: string;
  readonly onOpenIntentFile?: OpenCandidateLocation;
}) {
  if (
    link.kind === "snapshot" &&
    inventory !== undefined &&
    onOpenIntentFile !== undefined &&
    entrySlug !== undefined
  ) {
    const path = snapshotRepositoryPath(link, containingFilePath);
    if (path !== undefined && inventory.files.includes(path)) {
      return (
        <button
          type="button"
          className="intent-candidate-location-link"
          onClick={() => {
            onOpenIntentFile({ path }, entrySlug);
          }}
        >
          {label}
        </button>
      );
    }
  }
  switch (link.kind) {
    case "snapshot":
      return (
        <a href={link.url} {...leaveDashboard}>
          {label}
          <span className="visually-hidden">
            {" "}
            (snapshot at {shortRevision(link.revision)})
          </span>
        </a>
      );
    case "external":
      return (
        <a href={link.url} {...leaveDashboard}>
          {label}
        </a>
      );
    case "unusable":
      return (
        <span title={link.reason}>
          {label} ({link.recorded})
        </span>
      );
  }
}

export function RecordedMarkdownText({
  text,
  source,
  revision,
  containingFilePath,
  inventory,
  entrySlug,
  onOpenIntentFile,
}: {
  readonly text: string;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly containingFilePath: string;
  readonly inventory?: IntentConfiguredInventory;
  readonly entrySlug?: string;
  readonly onOpenIntentFile?: OpenCandidateLocation;
}) {
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  markdownLink.lastIndex = 0;
  while ((match = markdownLink.exec(text)) !== null) {
    const [whole, label, target] = match;
    if (label === undefined || target === undefined) continue;
    if (match.index > last) {
      parts.push(
        <Fragment key={`t-${last}`}>{text.slice(last, match.index)}</Fragment>,
      );
    }
    const link = resolveSourceLink(
      target,
      source,
      revision,
      containingFilePath,
    );
    parts.push(
      <Linked
        key={`l-${match.index}`}
        link={link}
        label={label}
        containingFilePath={containingFilePath}
        {...(inventory === undefined ? {} : { inventory })}
        {...(entrySlug === undefined ? {} : { entrySlug })}
        {...(onOpenIntentFile === undefined ? {} : { onOpenIntentFile })}
      />,
    );
    last = match.index + whole.length;
  }
  if (last < text.length) {
    parts.push(<Fragment key={`t-${last}`}>{text.slice(last)}</Fragment>);
  }
  return <span className="recorded-markdown-text">{parts}</span>;
}
