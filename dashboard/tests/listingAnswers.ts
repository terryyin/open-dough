// GitHub's JSON listing of a repository directory, as the local `gh` CLI
// receives it from the contents endpoint: each file a directory lists, with
// the Git blob sha that names its content. A directory no file lies in is
// answered with ./originAnswers.ts's not-found answer.

import { createHash } from "node:crypto";
import { notFoundAnswer, type RawAnswer } from "./originAnswers.ts";

// One file a directory lists, with the Git blob sha GitHub's listing gives it.
export type ListedPath = { readonly path: string; readonly sha: string };

// The Git blob sha of `content`, as Git and GitHub's listing name it.
export function gitBlobSha(content: string): string {
  const bytes = Buffer.from(content, "utf8");
  return createHash("sha1")
    .update(`blob ${String(bytes.length)}\0`)
    .update(bytes)
    .digest("hex");
}

// Each published file, by repository path, with the blob sha of its content.
export function listedFiles(
  files: Readonly<Record<string, string>>,
): ListedPath[] {
  return Object.entries(files).map(([path, content]) => ({
    path,
    sha: gitBlobSha(content),
  }));
}

// A listed file whose content is never answered: its blob is none an
// answered file has.
export function unansweredFile(path: string): ListedPath {
  return { path, sha: gitBlobSha(`unanswered ${path}`) };
}

// GitHub's JSON listing of `directory` among the repository's `files`, each
// with its blob sha, or its not-found answer when no file lies directly in
// that directory.
export function directoryListingAnswer(
  directory: string,
  files: readonly ListedPath[],
): RawAnswer {
  const listed = files.flatMap(({ path, sha }) => {
    const name = path.startsWith(`${directory}/`)
      ? path.slice(directory.length + 1)
      : "";
    return name === "" || name.includes("/") ? [] : [{ name, path, sha }];
  });
  if (listed.length === 0) {
    return notFoundAnswer();
  }
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify(
      listed.map(({ name, path, sha }) => ({ name, path, sha, type: "file" })),
    ),
  };
}
