// The synthetic CLI's existing byte frame, carried without a per-call process.
// Domain answers and CLI conversion stay in fakeGitHub.ts and ghReply.ts.
import { request } from "node:http";
import { EventEmitter } from "node:events";

const diagnostic = (message, code = 1) =>
  Object.assign(new Error(message), { code });

function decode(frame, maxBuffer) {
  const first = frame.indexOf(10);
  const second = frame.indexOf(10, first + 1);
  const code = frame.subarray(0, first).toString();
  const length = frame.subarray(first + 1, second).toString();
  if (first < 1 || second < 0 || !/^\d+$/.test(code) || !/^\d+$/.test(length)) {
    throw diagnostic("fake gh: invalid test response frame");
  }
  const exitCode = Number(code);
  const stderrLength = Number(length);
  if (
    !Number.isSafeInteger(exitCode) ||
    exitCode > 255 ||
    !Number.isSafeInteger(stderrLength) ||
    stderrLength > frame.length - second - 1
  ) {
    throw diagnostic("fake gh: invalid test response frame");
  }
  const stderr = frame.subarray(second + 1, second + 1 + stderrLength);
  const stdout = frame.subarray(second + 1 + stderrLength);
  if (stderr.length > maxBuffer || stdout.length > maxBuffer) {
    throw diagnostic(
      "fake gh: output exceeds maxBuffer",
      "ERR_CHILD_PROCESS_STDIO_MAXBUFFER",
    );
  }
  return { exitCode, stdout, stderr };
}

export function runFakeGh(argv, options, callback) {
  const child = new EventEmitter();
  // No pid: the real owner must never record itself as a synthetic call.
  let connection;
  let settled = false;
  const signal = options.signal;
  const maxBuffer = options.maxBuffer ?? 1024 * 1024;
  const encoded = options.encoding !== "buffer" && options.encoding !== null;
  const output = (bytes) =>
    encoded ? bytes.toString(options.encoding ?? "utf8") : bytes;
  const end = (
    error,
    stdout = Buffer.alloc(0),
    stderr = Buffer.from(
      error?.message?.startsWith("fake gh:") ? `${error.message}\n` : "",
    ),
  ) => {
    if (settled) {
      return;
    }
    settled = true;
    signal?.removeEventListener("abort", abort);
    connection?.destroy();
    callback?.(error, output(stdout), output(stderr));
    child.emit("exit", error?.code ?? 0, null);
    child.emit("close", error?.code ?? 0, null);
  };
  const abort = () => end(diagnostic("The operation was aborted", "ABORT_ERR"));
  child.kill = () => {
    abort();
    return true;
  };
  queueMicrotask(() => {
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener("abort", abort, { once: true });
    const origin = (options.env ?? process.env).FAKE_GH_ORIGIN;
    if (!origin) {
      end(diagnostic("fake gh: FAKE_GH_ORIGIN is not set"));
      return;
    }
    try {
      const url = new URL(origin);
      // A broken fixture can only fail locally, never contact the real host.
      if (url.protocol !== "http:" || url.hostname !== "127.0.0.1") {
        throw diagnostic("fake gh: the test's fake GitHub must be local");
      }
      connection = request(
        url,
        { method: "POST", agent: false },
        (response) => {
          const chunks = [];
          let size = 0;
          if (response.statusCode !== 200) {
            end(diagnostic("fake gh: invalid test response status"));
            return;
          }
          response.on("data", (chunk) => {
            size += chunk.length;
            // Both streams have independent execFile bounds; frame metadata is tiny.
            if (size > 2 * maxBuffer + 1024) {
              end(
                diagnostic(
                  "fake gh: output exceeds maxBuffer",
                  "ERR_CHILD_PROCESS_STDIO_MAXBUFFER",
                ),
              );
            } else {
              chunks.push(chunk);
            }
          });
          response.once("end", () => {
            if (settled) {
              return;
            }
            try {
              const { exitCode, stdout, stderr } = decode(
                Buffer.concat(chunks),
                maxBuffer,
              );
              end(
                exitCode === 0 ? null : diagnostic("fake gh exited", exitCode),
                stdout,
                stderr,
              );
            } catch (error) {
              end(error);
            }
          });
          response.once("error", () =>
            end(diagnostic("fake gh: the test's fake GitHub is gone")),
          );
          response.once("close", () => {
            if (!response.complete) {
              end(diagnostic("fake gh: the test's fake GitHub is gone"));
            }
          });
        },
      );
      connection.once("error", () =>
        end(diagnostic("fake gh: the test's fake GitHub is gone")),
      );
      connection.end(argv.length ? `${argv.join("\0")}\0` : "");
    } catch (error) {
      end(error);
    }
  });
  return child;
}
