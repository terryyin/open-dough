import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";

const records = (text) =>
  text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

// Codex expands an explicitly invoked skill into a user input before inference;
// it need not issue a shell read. Require the owned stream/session and exact
// installed body, rather than accepting the agent's description of using it.
export function codexSkillExpansion(stream, rollout, skillPath, installedBody) {
  const threadId = records(stream).find(
    (entry) => entry.type === "thread.started",
  )?.thread_id;
  const events = records(rollout);
  if (
    !threadId ||
    !events.some(
      (entry) =>
        entry.type === "session_meta" && entry.payload?.id === threadId,
    )
  )
    return undefined;
  for (const event of events) {
    if (
      event.type !== "response_item" ||
      event.payload?.type !== "message" ||
      event.payload.role !== "user"
    )
      continue;
    for (const part of event.payload.content ?? []) {
      const match =
        /^<skill>\n<name>dough-post-change-refactor<\/name>\n<path>([^\n]+)<\/path>\n([\s\S]*)\n<\/skill>\s*$/.exec(
          part.text ?? "",
        );
      if (
        match?.[1] !== skillPath ||
        match[2].trimEnd() !== installedBody.trimEnd()
      )
        continue;
      return {
        threadId,
        path: skillPath,
        sha256: createHash("sha256").update(installedBody).digest("hex"),
        body: match[2],
      };
    }
  }
  return undefined;
}

export function retainedCodexSkillExpansion(directory) {
  try {
    const stream = readFileSync(join(directory, "events.jsonl"), "utf8");
    const id = records(stream).find(
      (entry) => entry.type === "thread.started",
    )?.thread_id;
    if (!/^[0-9a-f-]{36}$/.test(id ?? "")) return undefined;
    const result = spawnSync(
      "sqlite3",
      [
        join(directory, "codex-state/state_5.sqlite"),
        "-json",
        `select rollout_path, cwd from threads where id = '${id}';`,
      ],
      { encoding: "utf8" },
    );
    if (result.status !== 0) return undefined;
    const row = JSON.parse(result.stdout)[0];
    if (
      !row ||
      realpathSync(row.cwd) !== realpathSync(join(directory, "project"))
    )
      return undefined;
    const path = join(
      realpathSync(row.cwd),
      ".agents/skills/dough-post-change-refactor/SKILL.md",
    );
    const expansion = codexSkillExpansion(
      stream,
      readFileSync(row.rollout_path, "utf8"),
      path,
      readFileSync(path, "utf8"),
    );
    return expansion && { ...expansion, rollout: row.rollout_path };
  } catch {
    return undefined;
  }
}
