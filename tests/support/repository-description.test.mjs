import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";

test("the repository builder refuses a description it cannot materialize, without Git", () => {
  const refusals = [
    {
      refusal: "a name reused across trunk and unpublished revisions",
      describe: () =>
        makeMe.aRepository
          .withRevision("t")
          .withWorkspace("w", { from: "t" })
          .withUnpublishedRevision("t"),
      message: "Duplicate repository revision: t",
    },
    {
      refusal: "a workspace from an unknown trunk revision",
      describe: () =>
        makeMe.aRepository
          .withRevision("t")
          .withWorkspace("w", { from: "x" })
          .please(),
      message: "Workspace w starts from unknown trunk revision x",
    },
    {
      refusal: "an unpublished revision without a workspace",
      describe: () => makeMe.aRepository.withUnpublishedRevision("u"),
      message:
        "Unpublished revision u needs a workspace: call withWorkspace first",
    },
    {
      refusal: "a second workspace",
      describe: () =>
        makeMe.aRepository
          .withRevision("t")
          .withWorkspace("w", { from: "t" })
          .withWorkspace("v", { from: "t" }),
      message: "The repository already has workspace w",
    },
    {
      refusal: "a backlog key holding undefined",
      describe: () => {
        const backlog = undefined;
        return makeMe.aRepository.withRevision("t", { backlog }).please();
      },
      message:
        "Repository revision t states an undefined backlog; state backlog: null for a revision without a backlog",
    },
    {
      refusal: "a backlog stated both as membership and as file bytes",
      describe: () =>
        makeMe.aRepository
          .withRevision("t")
          .withRevision("u", {
            backlog: {},
            files: { ".planning/PRODUCT-BACKLOG.md": "# Product Backlog\n" },
          })
          .please(),
      message:
        'Repository revision u states its backlog twice: as backlog and as files[".planning/PRODUCT-BACKLOG.md"]',
    },
  ];

  for (const { refusal, describe, message } of refusals)
    assert.throws(describe, { message }, refusal);
});
