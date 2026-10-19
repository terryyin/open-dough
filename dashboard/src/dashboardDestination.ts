import type { PublishedWork } from "./publishedWork.ts";

// A story destination shared by references, page routing and notification
// delivery. It carries identity as data, independently of source evidence.
export type StoryDestination = {
  readonly project: string;
  readonly identity: string;
};

// Active membership comes from the named project's published observation.
// Done destinations use the existing Recently done catalog and range instead.
export function activeStoryAt(
  target: StoryDestination | undefined,
  work: PublishedWork | undefined,
) {
  if (target === undefined || work?.source.id !== target.project) return;
  return [...work.taken, ...work.backlog].find(
    (entry) => entry.identity === target.identity,
  );
}

export function dashboardDestinationPath(
  project: string,
  identity?: string,
): string {
  const params = new URLSearchParams({ project });
  if (identity !== undefined) params.set("story", identity);
  return `/?${params}`;
}

export function storyDestinationOf(
  params: URLSearchParams,
): StoryDestination | undefined {
  const identity = params.get("story");
  return identity === null || identity === ""
    ? undefined
    : { project: params.get("project") ?? "", identity };
}
