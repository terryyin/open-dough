import type { Plugin } from "vite";
import {
  instructionTranscriptionEndpoint,
  instructionTranscriptionFailed,
  instructionProblems,
} from "../src/instructionTranscription.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { OpenAICredentialProblem } from "./openAICredential.ts";
import { readInstructionAudio } from "./instructionAudio.ts";
import { transcribeInstruction } from "./transcribeInstruction.ts";
import { withResponseSignal } from "./responseSignal.ts";

export function instructionTranscriptionPlugin(): Plugin {
  return localBoundaryPlugin(
    "dough-instruction-transcription",
    (middlewares) => {
      const pending = new Set<AbortController>();
      middlewares.use((req, res, next) => {
        if (
          new URL(req.url ?? "", "http://placeholder").pathname !==
          instructionTranscriptionEndpoint
        ) {
          next();
          return;
        }
        const controller = new AbortController();
        pending.add(controller);
        const respond = (status: number, body: unknown) => {
          if (res.destroyed || res.writableEnded) {
            return;
          }
          res.writeHead(status, {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            ...(status !== 200 && !req.complete ? { Connection: "close" } : {}),
          });
          res.end(JSON.stringify(body));
        };
        let requestSignal: AbortSignal | undefined;
        void withResponseSignal(
          res,
          async (callerSignal) => {
            const signal = AbortSignal.any([callerSignal, controller.signal]);
            requestSignal = callerSignal;
            verifyLocalOrigin(req);
            if (req.method !== "POST") {
              throw new RefusedRequest(405, "Only POST is accepted.");
            }
            return transcribeInstruction(
              await readInstructionAudio(req, signal),
              signal,
            );
          },
          60_000,
        )
          .then(
            (answer) => {
              respond(200, answer);
            },
            (error: unknown) => {
              respond(error instanceof RefusedRequest ? error.status : 503, {
                error:
                  error instanceof RefusedRequest
                    ? error.message
                    : error instanceof OpenAICredentialProblem
                      ? instructionProblems.configuration
                      : requestSignal?.aborted &&
                          !controller.signal.aborted &&
                          !res.destroyed &&
                          !res.writableEnded
                        ? instructionProblems.timeout
                        : instructionTranscriptionFailed,
                ...(error instanceof RefusedRequest && error.status === 409
                  ? { setupRequired: true }
                  : {}),
              });
            },
          )
          .finally(() => {
            pending.delete(controller);
          });
      });
      return () => {
        for (const controller of pending) {
          controller.abort();
        }
        pending.clear();
      };
    },
  );
}
