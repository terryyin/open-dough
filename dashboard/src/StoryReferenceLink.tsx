// One semantic story reference: title or identity label, navigating through
// the page's story-navigation owner. Dependency explanations and a Taken
// follow-up's source share this control; only an explicit older-source ask
// carries catalogued inclusion beyond the default recent window.
import { useStoryNavigation } from "./storyNavigation.tsx";
import type { SourceLink } from "./sourceLink.ts";

export function StoryReferenceLink({
  sourceId,
  identity,
  title,
  link,
  includeOlder = false,
}: {
  readonly sourceId: string;
  readonly identity: string;
  readonly title: string;
  readonly link?: SourceLink;
  readonly includeOlder?: boolean;
}) {
  const { follow } = useStoryNavigation();
  const href = link === undefined || link.kind === "unusable" ? "#" : link.url;
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        follow({ project: sourceId, identity }, { includeOlder });
      }}
    >
      {title}
    </a>
  );
}
