export const githubGitCredentials = [
  "-c",
  "credential.helper=",
  "-c",
  "credential.helper=!gh auth git-credential",
] as const;

export const githubGitEnvironment = { GIT_TERMINAL_PROMPT: "0" } as const;

export const githubGitOrigin = (repository: string) =>
  `https://github.com/${repository}.git`;
