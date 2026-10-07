import {
  acceptanceSchema,
  verifiedAnswerSchema,
} from "../src/launchOutcome.ts";
import { markDoneAnswerSchema } from "../src/doneMark.ts";
import type { submitCompletion } from "../server/completionReporting.ts";
import { test, expect } from "./support/pageTest.ts";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { accept, recordsOf, markDone } from "./agentLaunchBoundary.ts";
import { settledOutcome, keptAttempts } from "./acceptedAttempts.ts";
import {
  startOrigin,
  queuedIdentity,
  queuedTitle,
} from "./support/startOrigin.ts";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { recordOperation } from "./support/completionRecovery.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";

const exec = promisify(execFile);

for (const quiet of [false, true])
  for (const recheck of [false, true])
    test(`Claude early ${quiet ? "quiet completion" : "attention report"} binds through ${recheck ? "native Recheck" : "normal launch"} and survives late native writers`, async () => {
      test.setTimeout(120000);
      const origin = await startOrigin();
      const server = await startDashboardServer({
        mode: "preview",
        prebuilt: builtDashboardDir,
        machine: origin.machine,
        projectFolders: ["open-dough"],
        launchTimeoutMs: 30000,
        doneRenameWaitMs: 30_000,
      });
      try {
        server.claudeScenario("held");
        const accepted = acceptanceSchema.parse(
          JSON.parse(
            (
              await accept(server, {
                source: "open-dough",
                identity: queuedIdentity,
                title: queuedTitle,
                workflow: "execution",
                host: "claude",
              })
            ).body,
          ),
        );
        expect(accepted.kind).toBe("accepted");
        if (accepted.kind !== "accepted")
          throw new Error("The launch was not accepted.");
        await expect.poll(() => server.claudeLaunchCalls().length).toBe(1);
        const call = server.claudeLaunchCalls()[0];
        const input = call?.argv.at(-1) ?? "";
        const command = /^- reporting command: (.+)$/m.exec(input)?.[1];
        if (command === undefined)
          throw new Error("No real Claude launch context");
        expect(input).toContain(`- launch reference: ${accepted.attempt.id}`);
        expect(call?.argv.slice(0, 3)).toEqual([
          "--bg",
          "--name",
          "Open Dough · Execution · Prepare the queued start",
        ]);
        expect(call?.argv).not.toContain("--permission-mode");
        const message = path.join(origin.machine, "early.txt");
        writeFileSync(
          message,
          "Work unfinished: the maintainer must resolve the conflicting decision.",
        );
        const post = (session: string) =>
          rawRequest({
            url: `${server.baseURL}/__agent-launch/completion`,
            method: "POST",
            headers: {
              Origin: server.origin,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source: "open-dough",
              host: "claude",
              reference: accepted.attempt.id,
              session,
              outcome: "unfinished",
              message: "No false session receipt",
            }),
          });
        expect((await post("not-yet-known")).status).toBe(409);
        const reported = await exec(
          "bash",
          [
            "-c",
            quiet
              ? `${command} --outcome completed`
              : `${command} --outcome unfinished --message-file '${message}'`,
          ],
          { cwd: origin.machine },
        );
        const receipt = JSON.parse(reported.stdout) as Awaited<
          ReturnType<typeof submitCompletion>
        >;
        expect(receipt.state).toBe("pending-native-session");
        expect(receipt).not.toHaveProperty("session");
        expect(
          keptAttempts(server).find(
            (attempt) => attempt.id === accepted.attempt.id,
          )?.completion?.receipt,
        ).toBe(receipt.receipt);
        expect(
          existsSync(
            path.join(server.home, ".open-dough/dashboard/agent-launches.json"),
          ),
        ).toBe(false);
        if (recheck) server.claudeListingFails(true);
        server.releaseHeldClaude();
        const outcome = await settledOutcome(server, accepted.attempt.id);
        if (recheck) {
          expect(outcome.kind).toBe("uncertain");
          server.claudeListingFails(false);
          const verified = await rawRequest({
            url: `${server.baseURL}/__agent-launch/verify`,
            method: "POST",
            headers: {
              Origin: server.origin,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source: "open-dough",
              attempt: accepted.attempt.id,
            }),
          });
          expect(
            verifiedAnswerSchema.parse(JSON.parse(verified.body)),
          ).toMatchObject({
            kind: "settled",
            attempt: { outcome: { kind: "launched" } },
          });
        } else expect(outcome.kind).toBe("launched");
        const [bound] = (await recordsOf(
          server,
          "open-dough",
        )) as LaunchRecord[];
        expect(bound?.completion).toMatchObject({
          receipt: receipt.receipt,
          reference: accepted.attempt.id,
        });
        expect(bound?.request.reporting?.reference).toBe(accepted.attempt.id);
        expect(bound?.session.host).toBe("claude");
        if (quiet) {
          expect(bound?.doneAt).toBe(receipt.receivedAt);
          // The session still lists busy, so its rename waits.
          expect(bound?.doneProblem).toBe(
            "Local done mark retained. Native done mark is pending.",
          );
        } else expect(bound?.doneAt).toBeUndefined();
        if (bound === undefined) throw new Error("No bound record");
        const stale = { ...bound, completion: undefined, doneAt: undefined };
        for (const operation of ["updateRecord", "keepRecord"]) {
          await recordOperation(server, operation, ["open-dough", stale]);
          const [current] = (await recordsOf(
            server,
            "open-dough",
          )) as LaunchRecord[];
          expect(current?.completion?.receipt).toBe(receipt.receipt);
          if (quiet) expect(current?.doneAt).toBe(receipt.receivedAt);
        }
        // Its turn has ended; the session idles until it is marked done.
        server.claudeSessionBecomes(bound.session.sessionId, "done-live");
        const shortId = server
          .claudeListing()
          .find((listed) => listed["sessionId"] === bound.session.sessionId)?.[
          "id"
        ];
        const doneName = `done-${bound.session.name}`;
        if (quiet) {
          // The binding's quiet report renames it once idle, through one
          // private attachment, without stopping it.
          await expect
            .poll(
              async () =>
                ((await recordsOf(server, "open-dough")) as LaunchRecord[])[0]
                  ?.doneProblem,
              { timeout: 30_000 },
            )
            .toBeUndefined();
          expect(
            server.claudeListing().find((listed) => listed["id"] === shortId)?.[
              "name"
            ],
          ).toBe(doneName);
          expect(server.claudeAttaches()).toEqual([
            expect.objectContaining({
              lines: [`/rename ${doneName}`],
              endedBy: "SIGHUP",
            }),
          ]);
          expect(server.claudeStopCalls()).toEqual([]);
        }
        const done = await markDone(server, {
          source: "open-dough",
          host: "claude",
          session: bound.session.sessionId,
        });
        expect(done.status).toBe(200);
        expect(
          markDoneAnswerSchema.parse(JSON.parse(done.body)).record.doneAt,
        ).toBeDefined();
        // Mark as done closes the reported session as any session: renamed
        // through a private attachment, then stopped.
        expect(
          server
            .claudeCalls()
            .filter(
              (entry) => entry.argv[0] === "stop" || entry.argv[0] === "attach",
            )
            .map((entry) => entry.argv),
        ).toEqual([
          ...(quiet ? [["attach", shortId]] : []),
          ["attach", shortId],
          ["stop", shortId],
        ]);
        expect(
          keptAttempts(server).find(
            (attempt) => attempt.id === accepted.attempt.id,
          )?.completion?.receipt,
        ).toBe(receipt.receipt);
      } finally {
        await server.close();
        origin.cleanup();
      }
    });
