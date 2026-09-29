// Stands in for GitHub as the local `gh` CLI sees it. The dashboard server
// under test launches the synthetic `gh` (../fixtures/fake-gh, installed by
// ./fakeGh.ts); that process hands its argv here and prints what this fake
// answers, converted the way the real `gh api` prints GitHub's answer. So the
// dashboard's own local read boundary, its `gh` invocation, the browser
// reader, the shared backlog interpretation, and the page all run for real;
// a test only decides what GitHub would answer, per repository, and observes
// the `gh` calls that reached it. How `gh api` prints each answer, a `304
// Not Modified` to a still-matching `If-None-Match` included, is
// ./ghReply.ts. It also stands in for GitHub's avatar host: the dashboard
// server under test fetches avatars from here (`DOUGH_AVATAR_ORIGIN`), and a
// test decides each image answer and observes each image read.

import http from "node:http";
import type { AddressInfo } from "node:net";
import {
  commitAnswer,
  directoryListingAnswer,
  headsAnswer,
  noConnection,
  rawFileAnswer,
  rawFileContentType,
  type OriginAnswer,
} from "../originAnswers.ts";
import {
  commitAnswerIn,
  commitListIn,
  type PathHistories,
} from "../pathHistoryAnswers.ts";
import { avatarsAt } from "../avatarAnswers.ts";
import { asGhReply } from "./ghReply.ts";
import { parseRequest, type GhRequest } from "./ghRequest.ts";

export type GhCall = {
  readonly argv: readonly string[];
  readonly request: GhRequest;
};

// Decides GitHub's answer for one request to a served repository. It may
// wait (to hold an answer back) before answering.
export type RepositoryAnswerer = (call: GhCall) => Promise<OriginAnswer>;

// Served in place of a repository name, an answerer answers for every
// repository nobody serves by name: the boundary specs exercise the local
// read boundary itself rather than a published project.
export const everyRepository = "*";

// GitHub's avatar host's answer to one image read.
export type AvatarAnswer = {
  readonly status: number;
  readonly contentType: string;
  readonly body: Buffer;
};

// Decides the avatar host's answer for one requested path and query.
export type AvatarAnswerer = (path: string) => AvatarAnswer;

export type FakeGitHub = {
  // Where the synthetic `gh` hands its argv (`FAKE_GH_ORIGIN`), and where
  // avatars are fetched from (`DOUGH_AVATAR_ORIGIN`).
  readonly url: string;
  // Every `gh` invocation, in arrival order.
  readonly calls: readonly GhCall[];
  // Every avatar image read's path and query, in arrival order.
  readonly avatarReads: readonly string[];
  // Answers `repository` (or `everyRepository`) with `answerer` from now on.
  serve(repository: string, answerer: RepositoryAnswerer): void;
  // Answers avatar image reads with `answerer` from now on; until then every
  // avatar is not found.
  serveAvatars(answerer: AvatarAnswerer): void;
  close(): Promise<void>;
};

// Never answers.
export const hangs: RepositoryAnswerer = () =>
  new Promise<never>(() => undefined);

// Fails as `gh` does, printing `stderr`.
export function failsWith(stderr: string): RepositoryAnswerer {
  return () => Promise.resolve({ exitCode: 1, stderr });
}

// Answers `revision` for any ref, and as the only branch head `main` of a
// head listing; for any content read, the named file in
// `files` or else `backlog`; for a directory listing, the `files` in that
// directory; and for a path's commit list, the commits `history` lists for
// it, or else its time in `committed`, as many as it asks for, each listed
// commit answering for its own change to that path; a published agent
// profile nothing else dates was added by a commit of its own
// (../pathHistoryAnswers.ts).
export function publishes(published: {
  readonly revision: string;
  readonly backlog?: string;
  readonly files?: Readonly<Record<string, string>>;
  readonly committed?: Readonly<Record<string, Date>>;
  readonly history?: PathHistories;
}): RepositoryAnswerer {
  return ({ request }) => {
    const commitList =
      request.kind === "commit-list"
        ? commitListIn(published, request.path, request.perPage)
        : undefined;
    if (commitList !== undefined) {
      return Promise.resolve(commitList);
    }
    if (request.kind === "commit") {
      return Promise.resolve(
        commitAnswerIn([published], request.sha) ?? noConnection,
      );
    }
    if (request.kind === "ref") {
      return Promise.resolve(commitAnswer(published.revision));
    }
    if (request.kind === "matching-refs") {
      return Promise.resolve(headsAnswer({ main: published.revision }));
    }
    if (request.kind === "content") {
      const { files, backlog } = published;
      const body =
        files !== undefined && Object.hasOwn(files, request.path)
          ? files[request.path]
          : backlog;
      return Promise.resolve(rawFileAnswer(body ?? ""));
    }
    if (request.kind === "listing") {
      return Promise.resolve(
        directoryListingAnswer(
          request.path,
          Object.keys(published.files ?? {}),
        ),
      );
    }
    return Promise.resolve({
      exitCode: 1,
      stderr: "fake gh: unrecognized invocation\n",
    });
  };
}

// GitHub labels a file's raw bytes with the raw media type the read accepted,
// so `gh` prints a `+json`-typed file as it prints JSON (./ghReply.ts).
function labeledAsAccepted(
  request: GhRequest,
  answer: OriginAnswer,
): OriginAnswer {
  return request.kind === "content" &&
    "contentType" in answer &&
    answer.contentType === rawFileContentType
    ? { ...answer, contentType: `${request.mediaType}; charset=utf-8` }
    : answer;
}

export async function startFakeGitHub(): Promise<FakeGitHub> {
  const calls: GhCall[] = [];
  const avatarReads: string[] = [];
  const served = new Map<string, RepositoryAnswerer>();
  let avatars = avatarsAt({});

  const decide = (call: GhCall): Promise<OriginAnswer> => {
    const { request } = call;
    const answerer =
      (request.kind === "unknown"
        ? undefined
        : served.get(request.repository)) ?? served.get(everyRepository);
    if (answerer !== undefined) {
      return answerer(call);
    }
    // Nobody published this repository: nothing answers for it.
    return Promise.resolve(noConnection);
  };

  const server = http.createServer((req, res) => {
    // Only the avatar host is asked with a GET; the synthetic `gh` posts.
    if (req.method === "GET") {
      const path = req.url ?? "";
      avatarReads.push(path);
      const answer = avatars(path);
      res.writeHead(answer.status, { "content-type": answer.contentType });
      res.end(answer.body);
      return;
    }
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const argv = JSON.parse(
        Buffer.concat(chunks).toString("utf8"),
      ) as string[];
      const call: GhCall = { argv, request: parseRequest(argv) };
      calls.push(call);
      void decide(call).then((answer) => {
        if (res.destroyed) {
          return;
        }
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify(
            asGhReply(
              argv,
              call.request,
              labeledAsAccepted(call.request, answer),
            ),
          ),
        );
      });
    });
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${String(port)}/`,
    calls,
    avatarReads,
    serve(repository, answerer) {
      served.set(repository, answerer);
    },
    serveAvatars(answerer) {
      avatars = answerer;
    },
    async close() {
      server.closeAllConnections();
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    },
  };
}
