// Drives a Default main session through launch, dated work in its checkout
// and Done. The specs retain their own observations of Git and review answers.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { launch, markDone } from "../agentLaunchBoundary.ts";
import { quote } from "./completionRecovery.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import { launchedAdHoc } from "./reportedLaunch.ts";
import {
  anotherDeveloperCheckout,
  commitAt,
  gitAt,
} from "./sessionCheckoutGit.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";

// How the project's checkout takes trunk's published work in: a fast-forward
// pull, a pull that merges, a pull that rebases the checkout's own commits,
// or a fetch and `git rebase --onto` of its last commit, as a publication
// from the checkout does.
type TakenIn = "fast-forward" | "merge" | "rebase" | "rebase-onto";

export class DefaultMainSessionWork {
  constructor(
    private readonly dashboard: DashboardServer,
    private readonly origin: StartOrigin,
  ) {}

  private get checkout() {
    return this.origin.project;
  }

  launchReporting(instruction: string) {
    return launchedAdHoc(this.dashboard, this.origin, instruction);
  }

  commit(at: string, file: string, content?: string) {
    return commitAt(this.checkout, at, file, content);
  }

  edit(file: string, content: string) {
    writeFileSync(path.join(this.checkout, file), content);
  }

  pushToTrunk(ref: "main" | "HEAD:main" = "main") {
    git(this.checkout, "push", "--quiet", "origin", ref);
  }

  // Leave the comparison pins as the only local references to the commit.
  forgetPublishedCommit(start: string) {
    git(this.checkout, "reset", "--quiet", "--hard", start);
    git(this.checkout, "update-ref", "refs/remotes/origin/main", start);
    git(this.checkout, "reflog", "expire", "--expire=now", "--all");
    git(this.checkout, "gc", "--quiet", "--prune=now");
  }

  // Launches an ad hoc session in the project's Default main checkout, blank
  // unless given an instruction; answers its record as launched.
  async launch(instruction?: string): Promise<LaunchRecord> {
    this.dashboard.claudeScenario("launched");
    const launched = await launch(
      this.dashboard,
      makeMe.aLaunchRequest
        .adHoc(instruction === undefined ? {} : { instruction })
        .please(),
    );
    expect(launched.status).toBe(200);
    return (JSON.parse(launched.body) as { record: LaunchRecord }).record;
  }

  // Keeps a session established now in the project's Default main checkout at
  // its current commit; answers when it launched.
  establish(sessionId: string): string {
    const launchedAt = new Date().toISOString();
    this.dashboard.claudeScenario("launched");
    keepLaunchRecords(this.dashboard, [
      makeMe.aLaunchRecord
        .adHoc({ title: "Established in Default main" })
        .inDefaultCheckout({
          workspace: this.checkout,
          landing: "review",
          revision: git(this.checkout, "rev-parse", "HEAD"),
        })
        .inClaudeSession({ sessionId })
        .launchedAt(launchedAt)
        .please(),
    ]);
    return launchedAt;
  }

  // Marks the session done; answers its Done time.
  async markDone(session: string): Promise<string | undefined> {
    const done = await markDone(this.dashboard, {
      source: "open-dough",
      session,
    });
    expect(done.status).toBe(200);
    return (JSON.parse(done.body) as { record: LaunchRecord }).record.doneAt;
  }

  // Amends the checkout's last commit at `at` to also hold `file`, keeping its
  // message; answers the amended commit.
  amend(at: string, file: string): string {
    const git = gitAt(at);
    this.edit(file, `${file} at ${at}\n`);
    git(this.checkout, "add", "--", file);
    git(this.checkout, "commit", "--quiet", "--amend", "--no-edit");
    return git(this.checkout, "rev-parse", "HEAD");
  }

  // Makes a commit on a side branch and returns the checkout to its first branch.
  async commitOnSideBranch(at: string, file: string): Promise<void> {
    const git = gitAt(at);
    const originalBranch = git(this.checkout, "branch", "--show-current");
    git(this.checkout, "switch", "--quiet", "--create", "side");
    await commitAt(this.checkout, at, file);
    git(this.checkout, "switch", "--quiet", originalBranch);
  }

  // Rewords the latest commit through Git's interactive rebase.
  reword(at: string, message: string): void {
    gitAt(at, {
      GIT_SEQUENCE_EDITOR: "sed -i.bak 's/^pick /reword /'",
      GIT_EDITOR: `printf '%s\\n' ${quote(message)} >`,
    })(this.checkout, "rebase", "--quiet", "--interactive", "HEAD^");
  }

  // Picks another developer's edit to a file already changed in the checkout.
  // Requires a conflict on that file and answers the commit after resolution.
  async continueConflictedCherryPick(
    at: string,
    file: string,
    { incoming, resolution }: { incoming: string; resolution: string },
  ): Promise<string> {
    const git = gitAt(at);
    const other = anotherDeveloperCheckout(this.origin, at);
    const picked = await commitAt(other, at, file, incoming);
    git(this.checkout, "fetch", "--quiet", other, picked);
    assert.throws(() => git(this.checkout, "cherry-pick", picked));
    assert.equal(git(this.checkout, "rev-parse", "CHERRY_PICK_HEAD"), picked);
    assert.ok(git(this.checkout, "ls-files", "--unmerged", "--", file));
    this.edit(file, resolution);
    git(this.checkout, "add", "--", file);
    git(this.checkout, "cherry-pick", "--continue");
    return git(this.checkout, "rev-parse", "HEAD");
  }

  // Adds `file` in a fixup or squash of `target` and answers the autosquashed
  // commit, accepting Git's proposed message.
  autosquash(
    at: string,
    target: string,
    file: string,
    kind: "fixup" | "squash",
  ): string {
    const git = gitAt(at);
    this.edit(file, `${file} at ${at}\n`);
    git(this.checkout, "add", "--", file);
    git(
      this.checkout,
      "commit",
      "--quiet",
      `--${kind}=${target}`,
      "-m",
      `Add ${file}`,
    );
    git(
      this.checkout,
      "rebase",
      "--quiet",
      "--interactive",
      "--autosquash",
      `${target}^`,
    );
    return git(this.checkout, "rev-parse", "HEAD");
  }

  // Another developer publishes `file` on trunk at `at`, holding `content`
  // when given, and the project's checkout takes it in; answers the published
  // commit.
  async pullPublishedWork(
    at: string,
    file: string,
    { how = "fast-forward", content }: { how?: TakenIn; content?: string } = {},
  ): Promise<string> {
    const git = gitAt(at);
    const other = anotherDeveloperCheckout(this.origin, at);
    const pulled = await commitAt(other, at, file, content);
    git(other, "push", "--quiet", "origin", "HEAD:main");
    if (how === "rebase-onto") {
      git(this.checkout, "fetch", "--quiet", "origin", "main");
      git(
        this.checkout,
        "rebase",
        "--quiet",
        "--onto",
        "origin/main",
        "HEAD~1",
      );
    } else
      git(
        this.checkout,
        "pull",
        "--quiet",
        {
          "fast-forward": "--ff-only",
          merge: "--no-rebase",
          rebase: "--rebase",
        }[how],
        ...(how === "merge" ? ["--no-edit"] : []),
        "origin",
        "main",
      );
    return pulled;
  }
}
