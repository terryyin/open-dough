import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
test("customer label", () => assert.equal(execFileSync(process.execPath,["src/cli.mjs"," Ada "," Lovelace "],{encoding:"utf8"}),"Ada Lovelace\n"));
test("invoice label", () => assert.equal(execFileSync(process.execPath,["src/cli.mjs"," Ada "," Lovelace ","invoice"],{encoding:"utf8"}),"Invoice: Ada Lovelace\n"));
