// @ts-check
// Further work in a directory a case already holds, usually a Git checkout:
// `makeMe.theWorkspace(path)` (./makeMe.mjs). Completion applies the steps in
// order and answers the last commit they made.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

/** @typedef {{ kind: "write", file: string, text: string } | { kind: "commit", message: string }} WorkspaceStep */

/** @param {string} cwd @param {string[]} args */
const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

/** @template [Answer=void] */
export class WorkspaceBuilder {
  #root;
  /** @type {readonly WorkspaceStep[]} */
  #steps;

  /** @param {string} root @param {readonly WorkspaceStep[]} [steps] */
  constructor(root, steps = []) {
    this.#root = root;
    this.#steps = steps;
  }

  /**
   * Writes `text` to `file`, a path under the workspace, creating its folders.
   * @param {string} file
   * @param {string} text
   * @returns {WorkspaceBuilder<Answer>}
   */
  writeAt(file, text) {
    return new WorkspaceBuilder(this.#root, [
      ...this.#steps,
      { kind: "write", file, text },
    ]);
  }

  /**
   * Writes each file's text, in the order given.
   * @param {Readonly<Record<string, string>>} files
   * @returns {WorkspaceBuilder<Answer>}
   */
  writeAll(files) {
    return Object.entries(files).reduce(
      /** @param {WorkspaceBuilder<Answer>} workspace */
      (workspace, [file, text]) => workspace.writeAt(file, text),
      /** @type {WorkspaceBuilder<Answer>} */ (this),
    );
  }

  /**
   * Stages every change and commits it; completion answers the last commit.
   * @param {string} message
   * @returns {WorkspaceBuilder<string>}
   */
  commitAll(message) {
    return new WorkspaceBuilder(this.#root, [
      ...this.#steps,
      { kind: "commit", message },
    ]);
  }

  /** @returns {Answer} */
  please() {
    /** @type {string | undefined} */
    let committed;
    for (const step of this.#steps) {
      if (step.kind === "write") {
        const file = path.join(this.#root, step.file);
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, step.text);
      } else {
        git(this.#root, "add", "--all");
        git(this.#root, "commit", "--quiet", "-m", step.message);
        committed = git(this.#root, "rev-parse", "HEAD");
      }
    }
    return /** @type {Answer} */ (committed);
  }
}
