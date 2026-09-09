import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
test("customer label", () => assert.equal(execFileSync(process.execPath,["src/cli.mjs"," Ada "," Lovelace "],{encoding:"utf8"}),"Ada Lovelace\n"));
