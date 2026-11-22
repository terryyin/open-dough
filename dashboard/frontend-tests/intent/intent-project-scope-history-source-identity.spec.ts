// A project whose configuration supplies another repository or ref under the
// same project ID reads that source's test execution time history afresh: the
// page and its reading place stay mounted, and the earlier source's answer at
// the same endpoint and scope never stands as the new source's history.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { workOf } from "./intent-ci-homepage-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  configuredIntentReads,
  inertCiReads,
  openDoughSource,
  unreadLiveProof,
} from "./intent-ci-status-fixtures.ts";
import {
  openScopeSummary,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";

const work = workOf(openDoughSource, "b2b2b2b");

for (const changed of ["repository", "ref"] as const) {
  test(`a changed ${changed} with the same project ID and endpoint does not keep another source's history`, async () => {
    const requests: string[] = [];
    const signals: AbortSignal[] = [];
    const page = await mountIntentCiPage({
      work,
      reads: {
        intent: configuredIntentReads(
          makeMe.anIntentLocation
            .at("dashboard/tests")
            .ofKind("typescript", ["**/*.spec.ts"])
            .selecting("dashboard/tests/example.spec.ts")
            .please(),
        ),
        ci: inertCiReads({
          readStatus: () => Promise.resolve(unreadLiveProof),
          readScopeHistory: (source, path, endpoint, signal) => {
            requests.push(
              `${source.id} ${source.repository}@${source.ref} ${path} ${endpoint.revision}`,
            );
            signals.push(signal);
            return requests.length === 1
              ? Promise.resolve(
                  makeMe.aScopeHistoryGlance
                    .at(path)
                    .timing("case", [], 8000)
                    .through(endpoint.revision)
                    .please(),
                )
              : Promise.reject(new Error("New source history unavailable"));
          },
        }),
      },
    });
    const history = scopeHistoryIn(await openScopeSummary("dashboard/tests"));
    const endpoint = `Observed trunk endpoint ${shortSha(work.revision)}`;
    await expect
      .poll(() => history.readout().selected)
      .toBe(`${endpoint} · 8.0 s`);

    const source = makeMe.aPublishedSource
      .with({
        ...openDoughSource,
        ...(changed === "repository"
          ? { repository: "example/another-repository" }
          : { ref: "trunk" }),
      })
      .please();
    await page.showWork({ ...work, source });
    await expect.poll(history.text).toContain("New source history unavailable");
    expect(history.readout().selected).toBeUndefined();
    expect(history.text()).not.toContain("Previously retrieved history");
    expect(requests).toEqual([
      `open-dough terryyin/open-dough@main dashboard/tests ${work.revision}`,
      `open-dough ${source.repository}@${source.ref} dashboard/tests ${work.revision}`,
    ]);
    // The earlier source's reading is given up with its source.
    expect(signals.map(({ aborted }) => aborted)).toEqual([true, false]);
  });
}
