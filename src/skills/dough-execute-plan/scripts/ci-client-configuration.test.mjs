import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { test } from 'node:test'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const observer = new URL('./watch-ci-execution.mjs', import.meta.url).href

test('client workflow and non-main branch select failures and exclude deployment', async () => {
  const program = `
    import { watchCiExecution } from ${JSON.stringify(observer)};
    const controller = new AbortController();
    const calls = [], events = [];
    await watchCiExecution({
      repo: 'client/project', branch: 'release/next', signal: controller.signal,
      emit: event => events.push(event), sleep: async () => controller.abort(),
      gh: async args => {
        calls.push(args);
        if (args[1] !== 'list') return { jobs: [] };
        const base = { attempt: 1, headSha: 'abc', event: 'push',
          status: 'completed', conclusion: 'failure' };
        return [
          { ...base, databaseId: 1, headBranch: 'release/next', workflowName: 'Client checks' },
          { ...base, databaseId: 2, headBranch: 'main', workflowName: 'Client checks' },
          { ...base, databaseId: 3, headBranch: 'release/next', workflowName: 'Deploy' },
        ];
      }
    });
    console.log(JSON.stringify({ calls, events }));
  `
  const { stdout } = await exec(process.execPath, ['--input-type=module', '-e', program], {
    env: { ...process.env, DOUGH_CI_WORKFLOW: 'checks.yaml', DOUGH_CI_WORKFLOW_NAME: 'Client checks' },
    timeout: 5000,
  })
  const { calls, events } = JSON.parse(stdout)
  assert.equal(calls[0][calls[0].indexOf('--workflow') + 1], 'checks.yaml')
  assert.equal(calls[0][calls[0].indexOf('--branch') + 1], 'release/next')
  assert.deepEqual(events.map(({ runId, workflow, branch }) => ({ runId, workflow, branch })), [
    { runId: 1, workflow: 'checks.yaml', branch: 'release/next' },
  ])
})
