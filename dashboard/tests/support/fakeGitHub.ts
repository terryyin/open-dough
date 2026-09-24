// Stands in for GitHub as the local `gh` CLI sees it. The dashboard server
// under test launches the synthetic `gh` (../fixtures/fake-gh, installed by
// ./fakeGh.ts); that process hands its argv here and prints what this fake
// answers, converted the way the real `gh api` prints GitHub's answer. So the
// dashboard's own local read boundary, its `gh` invocation, the browser
// reader, the shared backlog interpretation, and the page all run for real;
// a test only decides what GitHub would answer, per repository, and observes
// the `gh` calls that reached it. How `gh api` prints each answer, a `304
// Not Modified` to a still-matching `If-None-Match` included, is
// ./ghReply.ts.

import http from "node:http";
import type { AddressInfo } from "node:net";
import {
  commitAnswer,
  commitListFor,
  directoryListingAnswer,
  noConnection,
  rawFileAnswer,
  type OriginAnswer,
} from "../originAnswers";
import { asGhReply } from "./ghReply";

// What one `gh` invocation asked GitHub for. A ref request made with
// `--include` and an `If-None-Match` header is conditional on that tag. A
// contents request asks for a file's raw bytes when it accepts GitHub's raw
// media type, and otherwise for a directory's JSON listing. A commit list
// asks for the commits that changed one path in a revision's history. A
// branch request asks which commit one published branch head names.
export type GhRequest =
  | {
      readonly kind: "ref";
      readonly repository: string;
      readonly ref: string;
      readonly ifNoneMatch: string | undefined;
    }
  | {
      readonly kind: "branch";
      readonly repository: string;
      readonly branch: string;
    }
  | {
      readonly kind: "content" | "listing" | "commit-list";
      readonly repository: string;
      readonly path: string;
      readonly revision: string;
    }
  | { readonly kind: "unknown" };

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

export type FakeGitHub = {
  // Where the synthetic `gh` hands its argv (`FAKE_GH_ORIGIN`).
  readonly url: string;
  // Every `gh` invocation, in arrival order.
  readonly calls: readonly GhCall[];
  // Answers `repository` (or `everyRepository`) with `answerer` from now on.
  serve(repository: string, answerer: RepositoryAnswerer): void;
  close(): Promise<void>;
};

// The value of one `-H "<name>: <value>"` argument, if given.
function headerArgument(
  argv: readonly string[],
  name: string,
): string | undefined {
  const prefix = `${name.toLowerCase()}:`;
  for (let at = 0; at < argv.length - 1; at += 1) {
    const value = argv[at + 1] ?? "";
    if (argv[at] === "-H" && value.toLowerCase().startsWith(prefix)) {
      return value.slice(prefix.length).trim();
    }
  }
  return undefined;
}

function parseRequest(argv: readonly string[]): GhRequest {
  const endpoint = argv.find((arg) => arg.startsWith("repos/")) ?? "";
  const ref = /^repos\/([^/]+\/[^/]+)\/commits\/(.+)$/.exec(endpoint);
  if (ref?.[1] !== undefined && ref[2] !== undefined) {
    return {
      kind: "ref",
      repository: ref[1],
      ref: ref[2],
      ifNoneMatch: headerArgument(argv, "If-None-Match"),
    };
  }
  const branch = /^repos\/([^/]+\/[^/]+)\/git\/ref\/heads\/(.+)$/.exec(
    endpoint,
  );
  if (branch?.[1] !== undefined && branch[2] !== undefined) {
    return {
      kind: "branch",
      repository: branch[1],
      branch: branch[2].split("/").map(decodeURIComponent).join("/"),
    };
  }
  const commitList = /^repos\/([^/]+\/[^/]+)\/commits\?(.+)$/.exec(endpoint);
  if (commitList?.[1] !== undefined && commitList[2] !== undefined) {
    const query = new URLSearchParams(commitList[2]);
    return {
      kind: "commit-list",
      repository: commitList[1],
      path: query.get("path") ?? "",
      revision: query.get("sha") ?? "",
    };
  }
  const content = /^repos\/([^/]+\/[^/]+)\/contents\/([^?]+)\?ref=(.+)$/.exec(
    endpoint,
  );
  if (
    content?.[1] !== undefined &&
    content[2] !== undefined &&
    content[3] !== undefined
  ) {
    return {
      kind:
        headerArgument(argv, "Accept") === "application/vnd.github.raw+json"
          ? "content"
          : "listing",
      repository: content[1],
      path: decodeURIComponent(content[2]),
      revision: content[3],
    };
  }
  return { kind: "unknown" };
}

// Never answers.
export const hangs: RepositoryAnswerer = () =>
  new Promise<never>(() => undefined);

// Fails as `gh` does, printing `stderr`.
export function failsWith(stderr: string): RepositoryAnswerer {
  return () => Promise.resolve({ exitCode: 1, stderr });
}

// Answers `revision` for any ref; for any content read, the named file in
// `files` or else `backlog`; for a directory listing, the `files` in that
// directory; and for a path's commit list, its time in `committed`.
export function publishes(published: {
  readonly revision: string;
  readonly backlog?: string;
  readonly files?: Readonly<Record<string, string>>;
  readonly committed?: Readonly<Record<string, Date>>;
}): RepositoryAnswerer {
  return ({ request }) => {
    const commitList =
      request.kind === "commit-list"
        ? commitListFor(published.committed, request.path)
        : undefined;
    if (commitList !== undefined) {
      return Promise.resolve(commitList);
    }
    if (request.kind === "ref") {
      return Promise.resolve(commitAnswer(published.revision));
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

export async function startFakeGitHub(): Promise<FakeGitHub> {
  const calls: GhCall[] = [];
  const served = new Map<string, RepositoryAnswerer>();

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
        res.end(JSON.stringify(asGhReply(argv, call.request, answer)));
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
    serve(repository, answerer) {
      served.set(repository, answerer);
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
