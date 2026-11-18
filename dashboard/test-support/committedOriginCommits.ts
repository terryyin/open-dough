// Commit-list and commit Answers for the committed-origin fixture
// (`./committedOrigin.ts`): real repository history when requested, else the
// default one-addition profile history.
import { noConnection, type OriginAnswer } from "./originAnswers.ts";
import { commitAnswerIn, commitListIn } from "./pathHistoryAnswers.ts";
import { committedHistoryAnswers } from "./committedHistoryAnswers.ts";
import { commitOf, listAt } from "./committedOriginRepo.ts";

type History = ReturnType<typeof committedHistoryAnswers>;

export function answerCommittedCommits(options: {
  readonly request:
    | {
        readonly kind: "commit-list";
        readonly revision: string;
        readonly path: string;
        readonly perPage: number | undefined;
      }
    | { readonly kind: "commit"; readonly sha: string };
  readonly repoDir: string;
  readonly published: () => string;
  readonly readable: (at: string) => boolean;
  readonly realHistory: boolean;
  readonly history: History;
  readonly targetHistoryAnswer: (
    repoDir: string,
    tip: string,
    perPage: number | undefined,
  ) => OriginAnswer;
}): OriginAnswer | undefined {
  const {
    request,
    repoDir,
    published,
    readable,
    realHistory,
    history,
    targetHistoryAnswer,
  } = options;
  // Each agent profile listed at the revision was added by a commit of its
  // own; these history reads are answered but not observed.
  const profiles = (at = published()) => ({
    files: Object.fromEntries(
      (listAt(repoDir, at, ".planning/agents") ?? []).map((path) => [path, ""]),
    ),
  });
  if (request.kind === "commit-list") {
    // Target-head history for base CI (no path): real commits of main/SHA.
    if (request.path === "") {
      const tip =
        request.revision === "main" || request.revision === published()
          ? published()
          : readable(request.revision)
            ? request.revision
            : commitOf(repoDir, `refs/heads/${request.revision}`);
      if (tip !== undefined)
        return targetHistoryAnswer(repoDir, tip, request.perPage);
      return undefined;
    }
    if (readable(request.revision)) {
      if (realHistory) {
        return history.list(request.revision, request.path, request.perPage);
      }
      return commitListIn(
        profiles(request.revision),
        request.path,
        request.perPage,
      );
    }
    return undefined;
  }
  if (realHistory && commitOf(repoDir, request.sha) === request.sha) {
    return history.commit(request.sha);
  }
  return commitAnswerIn([profiles()], request.sha) ?? noConnection;
}
