// One GitHub repository spelling and the identity/name derived from it.
export type ProjectInput = {
  readonly githubUrl: string;
  readonly localPath: string;
};
export type ProjectField = keyof ProjectInput;
export class ProjectInputProblem extends Error {
  constructor(
    readonly field: ProjectField,
    message: string,
  ) {
    super(message);
  }
}

export function githubRepository(value: string): string | undefined {
  const text = value.trim();
  let repository: string | undefined;
  const ssh = /^git@github\.com:([^/]+\/[^/]+)$/i.exec(text);
  if (ssh !== null) repository = ssh[1];
  else {
    try {
      const url = new URL(text);
      if (
        url.protocol !== "https:" ||
        url.hostname !== "github.com" ||
        url.port !== "" ||
        url.username !== "" ||
        url.password !== "" ||
        url.search !== "" ||
        url.hash !== ""
      )
        return undefined;
      repository = url.pathname.slice(1).replace(/\/$/, "");
    } catch {
      return undefined;
    }
  }
  repository = repository?.replace(/\.git$/i, "");
  return repository !== undefined &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\/[a-z0-9_.-]+$/i.test(repository) &&
    ![".", ".."].includes(repository.split("/")[1] ?? "")
    ? repository.toLowerCase()
    : undefined;
}

export function projectIdentity(repository: string): {
  readonly id: string;
  readonly label: string;
} {
  const id = (repository.split("/")[1] ?? "").toLowerCase();
  const label = id
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
  return { id, label: label || id };
}
