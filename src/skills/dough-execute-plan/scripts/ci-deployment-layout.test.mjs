import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const source = fileURLToPath(new URL('../', import.meta.url))

for (const [host, platform, event] of [
  ['cursor', '.agents', 'postToolUse'],
  ['claude', '.claude', 'PostToolUse'],
]) {
  test(`${host}: deployed hook fragment finds the relocated runtime in a path with spaces`, async (t) => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), 'dough client ')))
    t.after(() => rmSync(root, { recursive: true, force: true }))
    const skill = join(root, platform, 'skills', 'dough-execute-plan')
    const storage = join(root, 'mailboxes')
    mkdirSync(skill, { recursive: true })
    cpSync(join(source, 'scripts'), join(skill, 'scripts'), {
      recursive: true,
      filter: path => !/test|fixture/.test(path.slice(source.length)),
    })
    const env = { ...process.env, DOUGH_CI_MAILBOX_ROOT: storage, CLAUDE_PROJECT_DIR: root }
    const { stdout } = await exec(process.execPath, [join(skill, 'scripts/ci-mailbox.mjs'), 'probe'], { cwd: root, env })
    const receipt = JSON.parse(stdout.slice('CI_OBSERVER '.length))
    const request = JSON.parse(readFileSync(join(receipt.directory, 'request.json')))
    assert.equal(request.root.replace(/\/$/, ''), root)
    const { hooks } = JSON.parse(readFileSync(join(source, 'assets', `${host}-hooks.json`)))
    const command = host === 'cursor' ? hooks[event][0].command : hooks[event][0].hooks[0].command
    const child = exec('sh', ['-c', command], { cwd: root, env, timeout: 5000 })
    child.child.stdin.end(JSON.stringify({
      session_id: 'coordinator', conversation_id: 'coordinator', generation_id: 'turn',
      hook_event_name: event, tool_name: host === 'cursor' ? 'Shell' : 'Bash',
      tool_output: JSON.stringify({ output: stdout }), tool_response: { stdout },
    }))
    const output = JSON.parse((await child).stdout)
    assert.match(output.additional_context ?? output.hookSpecificOutput.additionalContext, /CI_MONITOR_READY/)
  })
}
