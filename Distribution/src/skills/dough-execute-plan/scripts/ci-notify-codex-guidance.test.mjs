// Codex adapter: completion recovery may arm a fresh stream; ordinary resume
// still rearms only absent/stopped/lost and never restarts finished.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const codex = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../references/ci-notify-codex.md",
  ),
  "utf8",
);
const recovery = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../references/ci-completion-recovery.md",
  ),
  "utf8",
);

test("Codex completion recovery permits a fresh stream without restarting finished", () => {
  assert.match(
    codex,
    /On resume, rearm\s+only absent, `stopped`, or `lost` observers[\s\S]+never\s+restart terminal `finished` observers/,
  );
  assert.match(
    codex,
    /At completion recovery only[\s\S]+stream `finished`[\s\S]+arm a \*\*fresh\*\* stream[\s\S]+never restart the finished directory/,
  );
  assert.match(
    codex,
    /execution-completion-recovery\.mjs complete` as `--coordinator` and\s+`--observer-directory`/,
  );
  assert.match(
    codex,
    /Ordinary resume and mid-story rearm keep the rule\s+above/,
  );
  assert.match(
    recovery,
    /On Codex, arm a fresh yielded stream[\s\S]+never restart a finished stream/,
  );
  assert.match(
    recovery,
    /pass `--coordinator` and `--observer-directory` to the same command/,
  );
});
