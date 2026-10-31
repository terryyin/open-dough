// A sessions ask marked fresh is answered only by an observation begun after
// it arrived (../../server/machineSessionObservation.ts): under a long reuse
// window, changing the project's installed Codex options yields a new revision
// carrying those offers, while an ordinary ask holding the prior revision is
// still answered unchanged from the settled observation.
import {
  sessionsFreshHeader,
  sessionsRevisionHeader,
} from "../../src/machineSessionsRevision.ts";
import { test, expect, codexSkill } from "../support/codexLaunch.ts";
import { sessionsRequest } from "../support/codexObservation.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import { rawRequest } from "../support/rawHttp.ts";

test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });

type Definition = {
  readonly host: string;
  readonly options?: readonly { readonly flag: string }[];
};

type Answer = {
  readonly revision: string;
  readonly unchanged?: true;
  readonly definitions?: readonly Definition[];
};

async function ask(
  server: DashboardServer,
  options: { readonly held?: string; readonly fresh?: boolean } = {},
) {
  const request = sessionsRequest(server);
  const response = await rawRequest({
    ...request,
    headers: {
      ...request.headers,
      ...(options.held === undefined
        ? {}
        : { [sessionsRevisionHeader]: options.held }),
      ...(options.fresh === true ? { [sessionsFreshHeader]: "1" } : {}),
    },
  });
  expect(response.status).toBe(200);
  return JSON.parse(response.body) as Answer;
}

function codexFlags(answer: Answer): string[] {
  return (answer.definitions ?? [])
    .filter((definition) => definition.host === "codex")
    .flatMap((definition) =>
      (definition.options ?? []).map(({ flag }) => flag),
    );
}

test("a fresh sessions ask observes changed Codex options while an ordinary held ask stays unchanged", async ({
  machine,
  dashboard: closed,
}) => {
  codexSkill(closed.home, "--option-a");
  await closed.close();
  const dashboard = await startDashboardServer({
    mode: "boundary",
    machine,
    projectFolders: ["open-dough"],
    sessionsReuseMs: 60_000,
  });
  try {
    const first = await ask(dashboard);
    const held = first.revision;
    expect(codexFlags(first)).toContain("--option-a");
    expect(codexFlags(first)).not.toContain("--option-b");

    codexSkill(dashboard.home, "--option-b");

    const ordinary = await ask(dashboard, { held });
    expect(ordinary).toEqual({ revision: held, unchanged: true });

    const fresh = await ask(dashboard, { held, fresh: true });
    expect(fresh.unchanged).toBeUndefined();
    expect(fresh.revision).not.toBe(held);
    expect(codexFlags(fresh)).toContain("--option-b");
    expect(codexFlags(fresh)).not.toContain("--option-a");
  } finally {
    await dashboard.close();
  }
});
