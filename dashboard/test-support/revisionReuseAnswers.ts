// GitHub's answer to one request of the revision reuse specs' publication
// (./revisionReuseOrigin.ts): the repository, the configured ref and branch
// heads, the comparisons, the commits made, and each published revision's
// files, listings and path histories.

import type { GhCall } from "./support/fakeGitHub.ts";
import {
  branchRefAnswer,
  commitAnswer,
  headsAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
  type OriginAnswer,
} from "./originAnswers.ts";
import {
  directoryListingAnswer,
  listedFiles,
  treeListingAnswer,
} from "./listingAnswers.ts";
import {
  commitAnswerIn,
  commitListIn,
  madeCommitAnswer,
} from "./pathHistoryAnswers.ts";
import { changedBetween, compareAnswer } from "./comparisonAnswers.ts";
import type { Publication } from "./revisionReuseOrigin.ts";

export function answerFrom(
  published: Publication,
  { request }: GhCall,
): OriginAnswer {
  switch (request.kind) {
    case "repository":
      return {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ default_branch: "main" }),
      };
    case "ref":
      return commitAnswer(published.trunk.revision);
    case "matching-refs":
      return headsAnswer({
        ...Object.fromEntries(published.branches),
        main: published.trunk.revision,
      });
    case "branch": {
      const head = published.branches.get(request.branch);
      return head === undefined
        ? notFoundAnswer()
        : branchRefAnswer(request.branch, head);
    }
    case "compare": {
      const compared = published.compared.get(
        `${request.base}...${request.head}`,
      );
      return (
        compared?.(
          request.perPage,
          changedBetween(
            published.revisions.get(request.base) ?? {},
            published.revisions.get(request.head) ?? {},
          ),
        ) ?? compareAnswer("diverged")
      );
    }
    case "commit": {
      const made = published.made.get(request.sha);
      if (made !== undefined) return madeCommitAnswer(made);
      return (
        commitAnswerIn(
          [...(published.histories ?? [])].map(([revision, history]) => ({
            files: published.revisions.get(revision) ?? {},
            history,
          })),
          request.sha,
        ) ?? noConnection
      );
    }
    case "content":
    case "listing":
    case "tree":
    case "commit-list": {
      const files = published.revisions.get(request.revision);
      if (files === undefined) return noConnection;
      if (request.kind === "listing") {
        return directoryListingAnswer(request.path, listedFiles(files));
      }
      if (request.kind === "tree") {
        return treeListingAnswer(request.path, files);
      }
      if (request.kind === "commit-list") {
        const history = published.histories?.get(request.revision);
        return commitListIn(
          {
            files,
            committed: { [request.path]: new Date() },
            ...(history !== undefined && { history }),
          },
          request.path,
          request.perPage,
        );
      }
      const text = files[request.path];
      return text === undefined ? notFoundAnswer() : rawFileAnswer(text);
    }
    default:
      return noConnection;
  }
}
