// 150 completed attempt jobs spanning two pages; `failed` names failures.
// MakeMe owns observed job facts; `apiJob` encodes them for the fixture REST.
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { apiJob } from "./github-actions-api-test-fixtures.mjs";

export const observedCompletedJob = (index, failed = true) =>
  makeMe.aGitHubJob
    .withFacts({
      databaseId: 1000 + index,
      name: `job ${index}`,
      status: "completed",
      conclusion: failed ? "failure" : "success",
      url: `https://github.test/owner/repo/actions/runs/42/job/${1000 + index}`,
      steps: [
        { number: 1, name: "Set up job", conclusion: "success" },
        {
          number: 2,
          name: "Run tests",
          conclusion: failed ? "failure" : "success",
        },
      ],
    })
    .please();

// One attempt job as the fixture REST answers it.
export const completedJob = (index, failed = true) =>
  apiJob(observedCompletedJob(index, failed));

export const completedJobs = (failed) =>
  Array.from(Array(150).keys(), (index) =>
    completedJob(index, failed.includes(index)),
  );
