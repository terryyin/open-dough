# Source review — SEED-212#use-terminal-with-mobile-keyboard

Launch: fresh general-purpose reviewer (no plan, product, or implementation
return). Input: story Goal, Scope, key examples, exclusions, plus human
amendment 2026-11-01 (“skip the real iphone test” / physical iPhone Safari
waived; phone-viewport automation closes the device-shaped gate).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | From the Side panel’s live attached terminal on a phone, the developer can read output, enter and edit instructions, navigate interactive option menus, and submit or cancel input without a physical keyboard | slice 4 | |
| 2 | Phone use is practical enough to drive the same native session the desktop uses | slice 4 | |
| 3 | Keep the existing xterm.js attachment and live native session/input path; add mobile controls around it; no replacement terminal engine and no separate mobile app | slice 2 | observed: `Terminal.tsx` mounts `TerminalKeyToolbar` via `insertText` from `useAttachedTerminal`; no new engine |
| 4.1 | Toolbar key Esc | slice 2 | observed: `agent-terminal-touch-keys.spec.ts` Esc cancel + `sent` `\u001b` |
| 4.2 | Toolbar key Tab | slice 2 | observed: keys spec Tab → `sent` `\t`; textarea stays focused |
| 4.3 | Toolbar key Up | slice 2 | observed: keys spec Up → `› Red` and `sent` `\u001b[A` |
| 4.4 | Toolbar key Down | slice 2 | observed: keys spec Down moves menu; `sent` `\u001b[B` |
| 4.5 | Toolbar key Left | slice 2 | observed: keys spec Left → `sent` `\u001b[D` |
| 4.6 | Toolbar key Right | slice 2 | observed: keys spec Right → `sent` `\u001b[C` |
| 4.7 | Toolbar key Enter | slice 2 | observed: keys spec Enter confirms menu → `echo Green` / `lines` |
| 4.8 | Less frequent controls including Ctrl+C in an expandable section | slice 2 | observed: More expands; Ctrl+C visible then `sent` `\u0003` |
| 4.9 | Activating a key sends corresponding input on terminal → WebSocket → PTY path | slice 2 | observed: `noteTerminalTraffic` `sent` matches sequences above |
| 4.10 | Activating a key keeps soft keyboard’s current visibility (neither dismiss nor force open) | slice 2 | observed: `tapTerminalKey` asserts xterm `textarea` remains focused after each tap (`preventDefault` on pointerdown) |
| 4.11 | Desktop hardware-keyboard and existing special-key behavior stay as they are | slice 2 | observed: desktop describe hides toolbar; Close still present |
| 5.1 | Composer: edit with native selection, autocorrection, and dictation | slice 3 | observed: `TerminalComposer` ordinary text `input` with autocorrect/spellcheck attrs; `agent-terminal-touch-composer.spec.ts` fills draft |
| 5.2 | Composer: deliberately Insert into the current terminal | slice 3 | observed: `agent-terminal-touch-composer.spec.ts` Insert → `sent` equals draft text once |
| 5.3 | Insert must not submit or execute the draft | slice 3 | observed: after Insert, `sent` has no trailing `\r`; draft cleared only on success (`agent-terminal-touch-composer.spec.ts`) |
| 5.4 | A deliberate Enter submits | slice 3 | observed: after Insert + typed suffix, toolbar Enter → `echo …` / `lines` with `\r` (`agent-terminal-touch-composer.spec.ts`) |
| 5.5 | Direct terminal typing remains available | slice 3 | observed: composer spec types into xterm after Insert; `sent` appends typed text |
| 5.6 | Unavailable attachment keeps unsent draft for deliberate retry; never auto-replayed | slice 3 | observed: disconnect keeps draft; reconnect leaves draft; Insert after reconnect sends once (`agent-terminal-touch-composer.spec.ts`) |
| 5.7 | Reuse existing attachment `insert` path | slice 3 | observed: `TerminalKeyToolbar` mounts `TerminalComposer` with `insert` from `Terminal`/`useAttachedTerminal` |


| 6.1 | One-finger swipe moves terminal scrollback history only (`scrollLines`) | slice 2 | observed: keys spec swipe changes `menu history` text; `sent` unchanged |
| 6.2 | Swipe must not send Up/Down or move an option-menu selection | slice 2 | observed: after swipe, `› Blue` still selected; `sent` equal |
| 6.3 | Toolbar arrows navigate menus and move the application cursor | slice 2 | observed: Down/Up change `›` marker; Enter confirms |
| 7.1 | Fit terminal, toolbar, and composer actions to visible area when soft keyboard opens/closes or device rotates | slice 4 | |
| 7.2 | Explicit hide-keyboard control | slice 4 | |
| 7.3 | Toolbar, composer actions, and Close reachable at reduced height | slice 4 | |
| 7.4 | Attachment, typed input, and unsent composer draft survive; no reconnect only to fit | slice 4 | |
| 8.1 | Proportionate automated checks on real browser → terminal → PTY path including phone-viewport journeys | slice 2 | observed: `agent-terminal-touch-keys.spec.ts` + neighbor `agent-terminal-touch.spec.ts` on attachment path |
| 8.2 | Physical iPhone Safari observation waived (developer 2026-11-01); phone-viewport automation closes device-shaped gate | slice 1 | observed: story Proof + plan slices 1 and 5 done under waiver |
| 8.3 | Apply repository failing and flaky test policy | slice 2 | observed: focused specs EXIT:0; no known flaky skip introduced |
| 9.1 | Toolbar activation must not steal focus dismissing soft keyboard or trigger unrelated dashboard shortcuts | slice 2 | observed: textarea focused after toolbar taps; no shortcut side effects in journey |
| 9.2 | Composer Insert must not append trailing Enter or submit | slice 3 | observed: `agent-terminal-touch-composer.spec.ts` Insert; `sent` equals draft without `\r` |


| 9.3 | Swipe-to-scroll must not emit navigation key sequences | slice 2 | observed: `sent` unchanged across swipe |
| 9.4 | New controls follow accessible names and 44px touch targets | slice 2 | observed: aria-labels; each primary key ≥44×44 |
| 10.1 | One Side panel terminal view | slice 2 | observed: toolbar inside Terminal region; no new panel |
| 10.2 | Coarse-pointer key toolbar with terminal; primary keys visible; less-frequent expand | slice 2 | observed: `@media (any-pointer: coarse)` CSS; More expands Ctrl+C |
| 10.3 | Optional composer with Insert distinct from Enter | slice 3 | observed: Compose under More; Insert button vs toolbar Enter; desktop hides both |

| 10.4 | Explicit hide-keyboard control available | slice 4 | |
| 10.5 | Exact layout is an implementation choice if examples and 44px hold | slice 2 | observed: horizontal scroll strip with sticky Enter/More |
| 10.6 | No new Board or Sessions sidebar chrome | slice 2 | observed: diff confined to Terminal chrome and tests |
| 11 | Keep both direct typing and the composer in scope | slice 3 | observed: composer + direct typing steps in same journey |

| E1 | Menu: Down twice + Enter confirms; Esc cancels; keys with keyboard shown or hidden | slice 2 | observed: Esc → cancelled; reopen; Down×2+Enter → Green; focus retained as soft-keyboard stand-in |
| E2 | Keyboard open: Tab, Left/Right; toolbar does not hide keyboard/lose input/trigger shortcut; expandable Ctrl+C | slice 2 | observed: Tab/Left/Right + Ctrl+C steps; focus held |
| E3 | Short direct typing with on-screen keyboard without corrupted text | slice 2 | observed: neighbor `agent-terminal-touch.spec.ts` editing journey remains green with toolbar present |
| E4 | Composer Insert then deliberate Enter; draft survives unavailable attachment | slice 3 | observed: full journey in `agent-terminal-touch-composer.spec.ts` |


| E5 | Swipe history without moving menu; arrows navigate without relying on swipe | slice 2 | observed: swipe vs arrows steps in keys spec |
| E6 | Open/hide keyboard and rotate; attachment/input/draft survive; controls reachable | slice 4 | |
| E7 | Desktop typing, special keys, dictation, ordinary scrolling retain current behavior | slice 2 | observed: desktop no-toolbar; touch neighbor + `session-terminal-voice.spec.ts` green |
| D1 | Sticky Ctrl/Alt deferred |  | D1 |
| D2 | Long-press key repeat deferred |  | D2 |
| D3 | Touch text-selection overlay deferred |  | D3 |
| D4 | Synthetic wheel / host-specific application scroll deferred |  | D4 |
| D5 | New terminal engine / separate mobile app / second session path deferred |  | D5 |
