// One recorded link, shown the same way whatever kind of entry records it. The
// recorded target is always readable as text; it becomes a link only when it
// leads to a file of this snapshot or to an ordinary web address.

import { shortRevision } from "./publishedWork.ts";
import type { SourceLink } from "./sourceLink.ts";
import { workLinkMarks } from "./workFocus.ts";

// Destinations that leave the dashboard open in another tab with a safe opener.
const leaveDashboard = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function RecordedLink({
  role,
  link,
  focusRole = role,
}: {
  role: string;
  focusRole?: string;
  link: SourceLink;
}) {
  const recorded = (
    <>
      <span className="link-role">{role}</span>{" "}
      <span className="link-target">{link.recorded}</span>
    </>
  );
  switch (link.kind) {
    case "snapshot":
      return (
        <li>
          <a href={link.url} {...leaveDashboard} {...workLinkMarks(focusRole)}>
            {recorded}
          </a>
          <p className="link-note">
            File in this snapshot, at revision {shortRevision(link.revision)}.
          </p>
        </li>
      );
    case "external":
      return (
        <li>
          <a href={link.url} {...leaveDashboard} {...workLinkMarks(focusRole)}>
            {recorded}
          </a>
          <p className="link-note">
            External reference. It is not a file in this snapshot and is not
            tied to the inspected revision.
          </p>
        </li>
      );
    case "unusable":
      return (
        <li>
          <span>{recorded}</span>
          <p className="link-note">Not offered as a link. {link.reason}</p>
        </li>
      );
  }
}
