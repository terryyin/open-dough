// The one GitHub answerer shared by both fake gh transports. Ordinary API
// calls post their argv from the already-running private request owner; tests
// selecting CLI use ../fixtures/fake-gh as a native process instead. Both paths
// receive the same byte-framed answer converted by ./ghReply.ts. The real local
// authenticated boundary, request-owner admission/sharing/rate limits, browser
// reader, backlog interpretation and page run unchanged. Tests decide only
// GitHub's answers and observe requests arriving here. Avatar reads use the
// same fake as DOUGH_AVATAR_ORIGIN, with independently supplied image answers.

import http from "node:http";
import type { AddressInfo } from "node:net";
import {
  noConnection,
  rawFileContentType,
  type OriginAnswer,
} from "../originAnswers.ts";
import { avatarsAt } from "../avatarAnswers.ts";
import { asGhReply } from "./ghReply.ts";
import { parseRequest, type GhRequest } from "./ghRequest.ts";

export { publishes } from "./publishedRepository.ts";

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

// Decides the avatar host's answer for one requested path and query, and may
// wait (to hold an image back) before answering.
export type AvatarAnswerer = (
  path: string,
) => AvatarAnswer | Promise<AvatarAnswer>;

export type FakeGitHub = {
  // Where the synthetic `gh` hands its argv (`FAKE_GH_ORIGIN`), and where
  // avatars are fetched from (`DOUGH_AVATAR_ORIGIN`).
  readonly url: string;
  // Every `gh` invocation, in arrival order.
  readonly calls: readonly GhCall[];
  // Every avatar image read's path and query, in arrival order.
  readonly avatarReads: readonly string[];
  // Calls whose HTTP response is still open, including held answers.
  readonly unansweredCalls: number;
  // Starts observing how many `gh` calls are unanswered at once: arrived
  // here and neither answered nor given up by their `gh`. The function it
  // returns reports the most there have been since.
  observeUnanswered(): () => number;
  // Answers `repository` (or `everyRepository`) with `answerer` from now on.
  serve(
    repository: string,
    answerer: RepositoryAnswerer,
  ): RepositoryAnswerer | undefined;
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
  let unanswered = 0;
  const observers = new Set<{ most: number }>();

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
      void Promise.resolve(avatars(path)).then((answer) => {
        if (res.destroyed) {
          return;
        }
        res.writeHead(answer.status, { "content-type": answer.contentType });
        res.end(answer.body);
      });
      return;
    }
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      // One trailing NUL per argv element preserves empty arguments and all
      // bytes an OS argument can carry. No arguments means an empty body.
      const body = Buffer.concat(chunks).toString("utf8");
      const argv = body === "" ? [] : body.split("\0").slice(0, -1);
      const call: GhCall = { argv, request: parseRequest(argv) };
      calls.push(call);
      unanswered += 1;
      for (const observer of observers) {
        observer.most = Math.max(observer.most, unanswered);
      }
      res.once("close", () => {
        unanswered -= 1;
      });
      void decide(call).then((answer) => {
        if (res.destroyed) {
          return;
        }
        const reply = asGhReply(
          argv,
          call.request,
          labeledAsAccepted(call.request, answer),
        );
        const stderr = Buffer.from(reply.stderr);
        const stdout = reply.stdoutBase64
          ? Buffer.from(reply.stdoutBase64, "base64")
          : Buffer.from(reply.stdout);
        // Transport framing only: exit code, stderr byte length, stderr,
        // then stdout through HTTP EOF. Domain conversion stays in asGhReply.
        res.writeHead(200, { "content-type": "application/octet-stream" });
        res.end(
          Buffer.concat([
            Buffer.from(
              `${String(reply.exitCode)}\n${String(stderr.length)}\n`,
            ),
            stderr,
            stdout,
          ]),
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
    get unansweredCalls() {
      return unanswered;
    },
    observeUnanswered() {
      const observer = { most: unanswered };
      observers.add(observer);
      return () => observer.most;
    },
    serve(repository, answerer) {
      const previous = served.get(repository);
      served.set(repository, answerer);
      return previous;
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
