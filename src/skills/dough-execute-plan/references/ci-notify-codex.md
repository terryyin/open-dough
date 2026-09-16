# Codex CI notification adapter

Follow [ci-monitor.md](ci-monitor.md) for CI selection and failure recovery.

With `functions.exec`, `yield_control`, `notify`, `tools.exec_command`, and
`tools.write_stdin`, start one yielded observer before the first push. Reuse the
observer note in the active plan (planned) or conversation (quick) and terminal
`finished` entries; recover that note before replacement when handles are lost.
Resolve `/ABSOLUTE/RESOLVED/SKILL` inside `/ABSOLUTE/VERIFIED/CHECKOUT_ROOT` with
[runtime setup](runtime-setup.md). Do not arm when setup stops.

This isolate cannot import Node modules. Do not reconstruct parsing or extra
readers. Copy this host binding with verified repository, checkout, and
coordinator; do not add parser branches.

```js
const key = 'ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR'
if (load(key)?.status === 'finished') exit()
const io = { yield_time_ms: 1000, max_output_tokens: 2000 }
let tail = '', directory, pid, terminal
const events = []
const consume = (chunk) => {
  const lines = `${tail}${chunk}`.split('\n')
  tail = lines.pop()
  for (const line of lines) {
    if (line.startsWith('CI_OBSERVER_RESULT ')) terminal = JSON.parse(line.slice('CI_OBSERVER_RESULT '.length)).terminal
    else if (line.startsWith('CI_OBSERVER ')) ({ directory, pid } = JSON.parse(line.slice('CI_OBSERVER '.length)))
    else if (line.startsWith('{')) {
      const event = JSON.parse(line).event
      if (event?.type?.startsWith('CI_')) events.push(event)
    }
  }
}
const deliver = () => { for (const event of events.splice(0)) notify(event) }
try {
  let result = await tools.exec_command({
    cmd: 'node /ABSOLUTE/RESOLVED/SKILL/scripts/ci-mailbox.mjs stream --execution OWNER/REPO BRANCH',
    workdir: '/ABSOLUTE/VERIFIED/CHECKOUT_ROOT',
    tty: true,
    ...io,
  })
  consume(result.output)
  text({ key, status: result.session_id ? 'watching' : 'finished', sessionId: result.session_id, directory, pid, tail, terminal })
  await yield_control()
  deliver()
  while (result.session_id) {
    result = await tools.write_stdin({ session_id: result.session_id, chars: '', ...io })
    consume(result.output)
    deliver()
  }
  store(key, { status: terminal?.status === 'stopped' ? 'stopped' : 'finished', sessionId: undefined, directory, pid, tail, terminal })
} catch (error) {
  store(key, { status: 'lost' })
  notify({ type: 'CI_MONITOR_UNAVAILABLE', key, reason: String(error).slice(-1000) })
}
```

The first yielded output exposes session, directory, and PID. Save them with the
cell ID, coordinator, and checkout in the observer note before the first push.
Cell `store` may stay invisible until the cell finishes; do not coordinate
shutdown through cross-cell `load`/`store`. Continue delegation after yielding.
`notify` arrives at the next coordinator boundary. Do not `wait`, assign a
watching agent, or broaden ordinary permissions.

Without those host tools, report monitoring unavailable once and continue; never
poll or claim notifications from a background shell or file. Use another native
bridge only when its delivery contract is independently verified for this host.

When the shared [observer lifecycle](ci-monitor.md#own-one-observer) calls
for shutdown:

- With the receipt directory from the observer note, run
  `node /ABSOLUTE/RESOLVED/SKILL/scripts/ci-mailbox.mjs stop DIRECTORY`
  from the verified checkout. Let the existing reader consume the stream's
  terminal result, then reap its cell with one bounded wait. Do not issue a
  second `write_stdin` while that reader owns the PTY: concurrent reads can
  consume each other's terminal output and invalidate the process handle.
  Confirm the stop receipt, terminal result, and process exit before marking
  the observer note stopped. Cell termination alone proves no subprocess exit.
- Without handles, recover the observer note. Match coordinator/checkout and validate
  the saved directory's `request.json` root, repository, branch, and execution
  mode. Run `node /ABSOLUTE/RESOLVED/SKILL/scripts/ci-mailbox.mjs stop DIRECTORY`
  from that checkout. Read its terminal receipt and `result.json`; confirm the
  recorded PID disappears using a finite local `ps` wait. Never signal that PID.
  Missing/mismatched identity means no guessed stop, newest-mailbox lookup, or
  replacement launch. Older unidentified observers cannot be recovered. Stop
  errors, missing terminal evidence, or unconfirmed exit mean unresolved
  shutdown; never force termination or claim closure.

Preserve recorded failures and report unread events and `pendingCi: unobserved`,
not green CI. Consume delivered failures before completion; never wait for pending
CI. Keep acknowledgment and repair semantics unchanged. On resume, rearm only
absent, `stopped`, or `lost` observers after confirming the old process ended;
never restart terminal `finished` observers.

Normal and repair pushes retain the key, session, directory, process, and cell.
The observer discovers successive selected-branch pushes, persists events before streaming,
and owns observation until shutdown. Changed HEAD/SHA never requires setup again.
