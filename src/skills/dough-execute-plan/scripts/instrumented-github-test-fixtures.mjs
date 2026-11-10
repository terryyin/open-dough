// The synthetic gh executable used by the real request-owner boundary tests.
export const instrumentedGithub = `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.CI_GH_FIXTURE;
const args = process.argv.slice(2);
const stored = path.join(process.env.GH_CONFIG_DIR ?? root, 'hosts.yml');
const [token, user] = /secret-(\\w+)/.exec(
  process.env.GH_TOKEN || (fs.existsSync(stored) ? fs.readFileSync(stored, 'utf8') : ''),
) ?? [];
if (args[0] === 'auth') {
  process.stdout.write(token ?? '');
  process.exit(token ? 0 : 1);
}
const methodAt = args.indexOf('--method');
const method = methodAt < 0 ? 'GET' : args[methodAt + 1];
const route = args.at(-1) ?? '';
const record = (phase) =>
  fs.appendFileSync(
    path.join(root, 'calls.jsonl'),
    JSON.stringify({ args, method, route, phase, at: Date.now(), pid: process.pid, user }) + '\\n',
  );
const onEnd = path.join(root, 'on-end');
if (fs.existsSync(onEnd))
  process.on('SIGTERM', () => {
    record('told-to-end');
    if (fs.readFileSync(onEnd, 'utf8') !== 'stay') process.exit(143);
  });
const waitForRelease = async (release, hold) => {
  while ((hold === undefined || fs.existsSync(path.join(root, hold))) && !fs.existsSync(path.join(root, release)))
    await new Promise((resolve) => setTimeout(resolve, 20));
};
const finish = (head, body, exitCode = 0, stderr = '') => {
  record('answered');
  process.stderr.write(stderr);
  process.stdout.write(head + '\\r\\n\\r\\n' + body, () => process.exit(exitCode));
};
(async () => {
  record('asked');
  const state = JSON.parse(fs.readFileSync(path.join(root, 'github.json'), 'utf8'));
  if (args[0] !== 'api' || args[1] !== '--include' ||
      !((method === 'GET' && args.length === 3) ||
        (method === 'POST' && args.length === 5 && methodAt === 2)))
    return finish('', '', 2, 'unexpected gh call');
  await waitForRelease('release', 'hold');
  const limited = path.join(root, 'limited.json');
  if (fs.existsSync(limited)) {
    const { count, match, wait, only } = JSON.parse(fs.readFileSync(limited, 'utf8'));
    if (count > 0 && route.includes(match) && (only ?? user) === user) {
      fs.writeFileSync(limited, JSON.stringify({ count: count - 1, match, wait, only }));
      return finish('HTTP/2.0 429 Too Many Requests\\r\\nRetry-After: ' + wait, '{}', 1, 'gh: slow down (HTTP 429)');
    }
  }
  const { pathname, searchParams } = new URL(route, 'https://api.github.test/');
  const page = Number(searchParams.get('page') ?? 1);
  const perPage = Number(searchParams.get('per_page') ?? 30);
  const json = (body) => finish('HTTP/2.0 200 OK', JSON.stringify(body));
  const asked = pathname.replace(/^\\/repos\\/owner\\/repo\\/actions\\//, '');
  let answer = state.answers?.[method + ' ' + asked] ??
    (method === 'GET' ? state.answers?.[asked] : undefined);
  if (!answer && /^jobs\\/\\d+\\/logs$/.test(asked))
    answer = {
      head: 'HTTP/2.0 200 OK',
      body: state.log + (user ? ' for ' + user : ''),
      holdLogs: state.holdLogs,
    };
  if (answer) {
    if (answer.holdLogs) await waitForRelease('release-logs');
    return finish(answer.head ?? '', answer.body ?? '', answer.code ?? 0, answer.stderr ?? '');
  }
  if (method !== 'GET') return finish('HTTP/2.0 405 Method Not Allowed', '{}', 1, 'gh: Method Not Allowed (HTTP 405)');
  let found;
  if (asked === 'workflows/ci.yml')
    return json({ id: 7001, name: 'CI', path: '.github/workflows/ci.yml', state: 'active' });
  if (asked === 'workflows/7001/runs')
    return json({ total_count: state.runs.length, workflow_runs: state.runs.slice(0, perPage) });
  if ((found = /^runs\\/(\\d+)\\/attempts\\/(\\d+)$/.exec(asked)) && state.attempts[found[1] + '/' + found[2]])
    return json(state.attempts[found[1] + '/' + found[2]]);
  if ((found = /^runs\\/(\\d+)$/.exec(asked)) && (state.runs ?? []).some((run) => String(run.id) === found[1]))
    return json(state.runs.find((run) => String(run.id) === found[1]));
  if ((found = /^runs\\/(\\d+)\\/attempts\\/(\\d+)\\/jobs$/.exec(asked))) {
    const jobs = state.attemptJobs?.[found[1] + '/' + found[2]] ?? state.jobs;
    return json({
      total_count: jobs.length,
      jobs: jobs.slice((page - 1) * perPage, page * perPage),
    });
  }
  finish('HTTP/2.0 404 Not Found', '{}', 1, 'gh: Not Found (HTTP 404)');
})();
`;
