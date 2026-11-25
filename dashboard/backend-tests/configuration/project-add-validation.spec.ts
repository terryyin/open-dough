import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../test-support/support/pageTest.ts";
import { addProject } from "../../server/projectAddition.ts";
import {
  appendConfiguredProject,
  configuredProjects,
  mountProjectConfiguration,
  projectConfigurationFile,
} from "../../server/projectConfiguration.ts";
import {
  ProjectInputProblem,
  type ProjectInput,
} from "../../src/projectInput.ts";
import { routeOriginThroughHome } from "../../test-support/support/fixtureOriginRoute.ts";
import { commitPublishedOrigin } from "../../test-support/support/publishedOrigin.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test.describe.configure({ mode: "serial" });
const validationRepository = "example/sample-app";
const defaultBranch = "release+stable";
let home: string;
let checkout: string;
let file: string;
let gitTrace: string;
let input: ProjectInput;
let restoreEnv: (() => void) | undefined;
let releaseConfiguration: (() => void) | undefined;
test.beforeEach(() => {
  home = mkdtempSync(path.join(tmpdir(), "dough-project-validation-"));
  checkout = path.join(home, "checkout");
  gitTrace = path.join(home, "git-trace");
  restoreEnv = withRestoredEnv({ HOME: home, GIT_TRACE: gitTrace });
  const local = commitPublishedOrigin({ branch: "local", backlog: null });
  execFileSync("git", ["clone", "--quiet", local.origin, checkout]);
  execFileSync("git", [
    "-C",
    checkout,
    "remote",
    "set-url",
    "origin",
    `git@github.com:${validationRepository}.git`,
  ]);
  releaseConfiguration = mountProjectConfiguration("development");
  file = projectConfigurationFile("development");
  input = {
    githubUrl: `https://github.com/${validationRepository}`,
    localPath: checkout,
  };
});

function advertiseDefaultBranch() {
  routeOriginThroughHome(
    home,
    commitPublishedOrigin({ branch: defaultBranch }).origin,
    validationRepository,
  );
}

function expectNoRemoteValidation() {
  expect(
    existsSync(gitTrace) ? readFileSync(gitTrace, "utf8") : "",
  ).not.toContain("ls-remote");
}
test.afterEach(() => {
  releaseConfiguration?.();
  releaseConfiguration = undefined;
  restoreEnv?.();
  restoreEnv = undefined;
  rmSync(home, { recursive: true, force: true });
});

async function refuses(
  submitted: ProjectInput,
  field: string,
  message: string,
) {
  const bytes = readFileSync(file, "utf8");
  const projects = configuredProjects();
  await expect(
    addProject(submitted, new AbortController().signal),
  ).rejects.toMatchObject({
    field,
    message,
  });
  expect(readFileSync(file, "utf8")).toBe(bytes);
  expect(configuredProjects()).toEqual(projects);
  expect(readdirSync(path.dirname(file))).toEqual([
    "projects-development.json",
  ]);
}

test("a non-GitHub URL is refused at its field without an external read", async () => {
  await refuses(
    { ...input, githubUrl: "https://gitlab.com/example/sample-app" },
    "githubUrl",
    "Enter a GitHub repository URL in HTTPS or SSH form.",
  );
  expectNoRemoteValidation();
});

test("an unreachable origin is refused with access guidance at its URL field", async () => {
  routeOriginThroughHome(
    home,
    path.join(home, "missing.git"),
    validationRepository,
  );
  await refuses(
    input,
    "githubUrl",
    `Git could not read ${validationRepository}. Check gh access and try again.`,
  );
});

test("a reachable origin with no default branch is refused with branch guidance at its URL field", async () => {
  const origin = path.join(home, "empty.git");
  execFileSync("git", ["init", "--bare", "--quiet", origin]);
  routeOriginThroughHome(home, origin, validationRepository);
  await refuses(
    input,
    "githubUrl",
    `Git could not resolve a usable default branch for ${validationRepository}. Try again when the repository has a valid default branch.`,
  );
});

for (const kind of [
  "missing",
  "non-checkout",
  "nested checkout folder",
] as const) {
  test(`${kind} is refused at the execution checkout field before GitHub is read`, async () => {
    const localPath = path.join(
      kind === "nested checkout folder" ? checkout : home,
      "folder",
    );
    if (kind !== "missing") {
      mkdirSync(localPath);
    }
    const message =
      kind === "missing"
        ? `The execution checkout ${localPath} was not found.`
        : `The execution checkout ${localPath} is not the root of a Git checkout with an origin repository.`;
    await refuses({ ...input, localPath }, "localPath", message);
    expectNoRemoteValidation();
  });
}

test("a different origin names both repositories and refuses the execution checkout", async () => {
  execFileSync("git", [
    "-C",
    checkout,
    "remote",
    "set-url",
    "origin",
    "https://github.com/another/different.git",
  ]);
  await refuses(
    input,
    "localPath",
    `The origin of ${checkout} is another/different, but the GitHub URL names ${validationRepository}.`,
  );
  expectNoRemoteValidation();
});

for (const duplicate of ["repository", "id"] as const) {
  test(`a case-insensitive duplicate ${duplicate} is refused without replacing saved projects`, async () => {
    advertiseDefaultBranch();
    appendConfiguredProject(
      makeMe.aConfiguredProject
        .with({
          id: duplicate === "id" ? "SAMPLE-APP" : "different-id",
          label: "Already configured",
          repository:
            duplicate === "repository"
              ? "EXAMPLE/SAMPLE-APP"
              : "another/sample-app",
          ref: "previous-branch",
          localPath: "~/previous-checkout",
        })
        .please(),
    );
    await refuses(
      { ...input, githubUrl: "git@github.com:Example/Sample-App.git" },
      "githubUrl",
      duplicate === "repository"
        ? `${validationRepository} is already configured.`
        : "The project id sample-app is already configured. Projects sharing an id would share session records.",
    );
    expect(configuredProjects()).toHaveLength(1);
  });
}

test("concurrent validated additions recheck admission and save exactly one append", async () => {
  advertiseDefaultBranch();
  expect(
    execFileSync(
      "git",
      ["-C", checkout, "rev-parse", "--abbrev-ref", "@{upstream}"],
      {
        encoding: "utf8",
      },
    ).trim(),
  ).toBe("origin/local");
  const settled = await Promise.allSettled([
    addProject(input, new AbortController().signal),
    addProject(
      { ...input, githubUrl: "git@github.com:EXAMPLE/SAMPLE-APP.git" },
      new AbortController().signal,
    ),
  ]);
  expect(
    settled.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1);
  const refusal = settled.find((result) => result.status === "rejected");
  expect(refusal?.reason).toBeInstanceOf(ProjectInputProblem);
  expect(refusal?.reason).toMatchObject({
    field: "githubUrl",
    message: `${validationRepository} is already configured.`,
  });
  const saved = JSON.parse(readFileSync(file, "utf8")) as unknown[];
  expect(saved).toEqual([
    {
      id: "sample-app",
      label: "Sample App",
      repository: validationRepository,
      ref: defaultBranch,
      backlogPath: ".planning/PRODUCT-BACKLOG.md",
      localPath: checkout,
    },
  ]);
  expect(configuredProjects()).toEqual(saved);
  expect(readdirSync(path.dirname(file))).toEqual([
    "projects-development.json",
  ]);
});
