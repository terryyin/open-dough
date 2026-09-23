// Stands in for GitHub as the local `gh` CLI sees it. The dashboard server
// under test launches the synthetic `gh` (../fixtures/fake-gh, installed by
// ./fakeGh.ts); that process hands its argv here and prints what this fake
// answers, converted the way the real `gh api` prints GitHub's answer. So the
// dashboard's own local read boundary, its `gh` invocation, the browser
// reader, the shared backlog interpretation, and the page all run for real;
// a test only decides what GitHub would answer, per repository, and observes
// the `gh` calls that reached it.

import http from "node:http";
import type { AddressInfo } from "node:net";
import {
  commitAnswer,
  noConnection,
  rawFileAnswer,
  type OriginAnswer,
} from "../originAnswers";

// What one `gh` invocation asked GitHub for.
export type GhRequest =
  | { readonly kind: "ref"; readonly repository: string; readonly ref: string }
  | {
      readonly kind: "content";
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

// One answer for every repository nobody serves, for the boundary specs that
// exercise the local read boundary itself rather than a published project:
// `normal` answers `revision` for any ref and `files` (or `backlog`) for any
// content read; `hang` never answers; `error` fails as `gh` does.
export type FakeGhControl = {
  readonly mode?: "normal" | "hang" | "error";
  readonly revision?: string;
  readonly backlog?: string;
  readonly files?: Readonly<Record<string, string>>;
  readonly errorMessage?: string;
};

export type FakeGitHub = {
  // Where the synthetic `gh` hands its argv (`FAKE_GH_ORIGIN`).
  readonly url: string;
  // Every `gh` invocation, in arrival order.
  readonly calls: readonly GhCall[];
  serve(repository: string, answerer: RepositoryAnswerer): void;
  setControl(control: FakeGhControl): void;
  close(): Promise<void>;
};

type GhReply = {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
};

function parseRequest(argv: readonly string[]): GhRequest {
  const endpoint = argv.find((arg) => arg.startsWith("repos/")) ?? "";
  const ref = /^repos\/([^/]+\/[^/]+)\/commits\/(.+)$/.exec(endpoint);
  if (ref?.[1] !== undefined && ref[2] !== undefined) {
    return { kind: "ref", repository: ref[1], ref: ref[2] };
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
      kind: "content",
      repository: content[1],
      path: decodeURIComponent(content[2]),
      revision: content[3],
    };
  }
  return { kind: "unknown" };
}

// `gh api --jq .field` prints one field of a JSON answer.
function applyJq(argv: readonly string[], body: string): string {
  const at = argv.indexOf("--jq");
  const filter = at >= 0 ? argv[at + 1] : undefined;
  if (filter === undefined) {
    return body;
  }
  let value: unknown = JSON.parse(body);
  for (const field of filter.split(".").filter(Boolean)) {
    value = (value as Record<string, unknown>)[field];
  }
  return `${typeof value === "string" ? value : JSON.stringify(value)}\n`;
}

// What `gh api` prints and exits with for GitHub's answer.
function asGhReply(argv: readonly string[], answer: OriginAnswer): GhReply {
  if ("exitCode" in answer) {
    return { stdout: "", stderr: answer.stderr, exitCode: answer.exitCode };
  }
  if ("connection" in answer) {
    return {
      stdout: "",
      stderr:
        "error connecting to api.github.com\ncheck your internet connection or https://githubstatus.com\n",
      exitCode: 1,
    };
  }
  if (answer.status < 300) {
    return { stdout: applyJq(argv, answer.body), stderr: "", exitCode: 0 };
  }
  let message = "HTTP error";
  try {
    const parsed = JSON.parse(answer.body) as { message?: unknown };
    if (typeof parsed.message === "string") {
      message = parsed.message;
    }
  } catch {
    // A non-JSON error body still ends with its status, as `gh` prints it.
  }
  return {
    stdout: answer.body,
    stderr: `gh: ${message} (HTTP ${String(answer.status)})\n`,
    exitCode: 1,
  };
}

function controlAnswer(
  control: FakeGhControl,
  call: GhCall,
): Promise<OriginAnswer> {
  if (control.mode === "hang") {
    return new Promise<never>(() => undefined);
  }
  if (control.mode === "error") {
    return Promise.resolve({
      exitCode: 1,
      stderr: control.errorMessage ?? "gh: synthetic failure\n",
    });
  }
  const { request } = call;
  if (request.kind === "ref") {
    return Promise.resolve(commitAnswer(control.revision ?? "0".repeat(40)));
  }
  if (request.kind === "content") {
    const body =
      control.files !== undefined && Object.hasOwn(control.files, request.path)
        ? control.files[request.path]
        : control.backlog;
    return Promise.resolve(rawFileAnswer(body ?? ""));
  }
  return Promise.resolve({
    exitCode: 1,
    stderr: "fake gh: unrecognized invocation\n",
  });
}

export async function startFakeGitHub(): Promise<FakeGitHub> {
  const calls: GhCall[] = [];
  const served = new Map<string, RepositoryAnswerer>();
  let control: FakeGhControl | undefined;

  const decide = (call: GhCall): Promise<OriginAnswer> => {
    const { request } = call;
    const answerer =
      request.kind === "unknown" ? undefined : served.get(request.repository);
    if (answerer !== undefined) {
      return answerer(call);
    }
    if (control !== undefined) {
      return controlAnswer(control, call);
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
        res.end(JSON.stringify(asGhReply(argv, answer)));
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
    setControl(next) {
      control = { mode: "normal", ...next };
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
