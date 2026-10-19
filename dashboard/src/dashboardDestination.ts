// The URL contract shared by native notification delivery and page routing.
// It carries identity as data; neither titles nor browser state participate.
export type StoryDestination = {
  readonly project: string;
  readonly identity: string;
};

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
