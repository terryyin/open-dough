import assert from "node:assert/strict"; import fs from "node:fs"; const work=JSON.parse(fs.readFileSync("consumer-work.json")); assert.equal(work.subtotal,125); assert.equal(work.currency,"SGD");
