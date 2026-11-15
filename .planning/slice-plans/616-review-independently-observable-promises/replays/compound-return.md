The ids below describe observable promises, without assigning slices or acceptance. “Select scope” refers to the five bullets under “Select text”; “Swipe scope” refers to the two swipe bullets. The overall journey applies to phone or tablet browsers and sessions of any host.

1. **The phone key toolbar offers Select beside Paste.** Source: Select scope 1.
2. **One tap on Select enters selection mode.** Sources: Select scope 1; examples 1 and 3; UI.
3. **Selection mode replaces the live terminal, in place, with paused ordinary page text.** Sources: Select scope 1; example 1. The existing terminal area becomes the text view.
4. **The paused copy contains every line held by the terminal when Select is used: screen contents and retained scrollback.** Source: Select scope 2; example 3’s 200-line terminal.
5. **Text remaining in a disconnected attachment can be selected.** Source: Select scope 5.
6. **Text remaining in an ended attachment can be selected.** Source: Select scope 5.
7. **The paused copy opens at the lines the terminal was showing.** Sources: Select scope 2; examples 1, 3 and 5. Example 3 starts at line 40; example 5 starts at the earlier application screen reached by swiping.
8. **Ordinary touch scrolling reaches the paused copy’s entire retained contents.** Sources: Select scope 2; example 3, where line 1 and the last line remain reachable.
9. **The device’s native long-press selection works on paused text.** Sources: Select scope 1; example 1.
10. **The device’s native selection handles work on paused text.** Sources: Select scope 1; example 1’s handle drag across two lines.
11. **The device’s native selection magnifier works on paused text.** Source: Select scope 1.
12. **The device’s system Copy puts the selected range on the clipboard.** Sources: Goal; Select scope 1; example 1.
13. **Pasting the copied range elsewhere produces exactly the selected text.** Sources: Goal; example 1’s paste into another field; example 4’s specified copied results.
14. **One selection can span more than one screen when the terminal holds that text.** Sources: Select scope 2; example 3’s selection from line 35 through line 80.
15. **The Dashboard adds no selection gesture of its own.** Source: Select scope 1.
16. **The Dashboard adds no selection highlight of its own.** Source: Select scope 1.
17. **The Dashboard adds no Copy control of its own.** Source: Select scope 1.
18. **Paused text preserves the characters displayed by the terminal.** Source: Select scope 3, “the same characters”; scope limit 1’s screen-matching qualification.
19. **Paused text preserves the terminal’s aligned columns.** Source: Select scope 3.
20. **Paused text preserves the terminal’s row order.** Source: Select scope 3, “row by row.”
21. **A line wrapped by the terminal copies as one logical line, without breaks introduced by that wrapping.** Sources: Select scope 3; example 4’s 100-character line across three rows.
22. **Line breaks drawn by the session application remain line breaks when copied, with the displayed indentation preserved.** Sources: Select scope 3; scope limit 1; example 4’s Claude Code URL at 41 columns copying as two lines.
23. **Landscape provides longer terminal rows in the application-wrapping situation described by the source.** Source: scope limit 1, “landscape gives longer rows.”
24. **The paused text remains still while the session continues working.** Sources: the paused-copy description; UI, “the screen no longer moves”; example 2’s output arriving during pause.
25. **The paused display does not blink.** Source: UI, “the screen no longer moves or blinks.”
26. **Select visibly reads as on while paused.** Sources: Select scope 4; UI.
27. **Using Select again returns to the live terminal showing its current output, including output received during pause.** Sources: Select scope 4; example 2; UI’s same-control exit.
28. **Pausing and returning send nothing to the session.** Sources: Select scope 4; example 2.
29. **Pausing and returning preserve the same attachment without reconnecting.** Sources: Select scope 4; example 2.
30. **After returning to live mode, typing reaches the session as before.** Source: example 2.
31. **Paused text fits the visible terminal area, including above an open soft keyboard and after rotation.** Source: UI.
32. **Using Select does not raise the soft keyboard.** Source: UI.
33. **A session needing the developer while paused is announced through the Dashboard’s existing session attention.** Source: UI.
34. **The paused text itself does not announce that session-attention event.** Source: UI, “not by the paused text.”
35. **A one-finger vertical swipe moves the terminal’s own scrollback when the terminal holds the output.** Sources: Swipe scope 1; examples 3 and 6. Example 6 qualifies this with an application that does not scroll itself.
36. **Swiping terminal-owned scrollback sends the session nothing.** Source: example 6.
37. **When the application has taken over the screen and scrolls its own output, a one-finger vertical swipe scrolls that output as a desktop wheel would at the touched place.** Sources: Swipe scope 2; example 5’s downward swipe revealing earlier Claude Code conversation.
38. **The application-scrolling swipe sends no arrow keys to the session.** Sources: Swipe scope 2; example 5.
39. **The application-scrolling swipe leaves typed input unchanged.** Sources: Swipe scope 2; example 5.
40. **The swipe routing decision follows what the terminal reports about the application, independently of host name.** Sources: Swipe scope 2; Goal’s “session of any host.”
41. **Fine-pointer desktop use exposes no Select control.** Sources: desktop sentence; example 7.
42. **Fine-pointer desktop mouse selection retains its existing terminal behavior.** Sources: desktop sentence; example 7.
43. **Fine-pointer desktop wheel use retains its existing terminal behavior.** Sources: desktop sentence; example 7.

Unnumbered source context:

- The existing mobile Dashboard offers input only; completing reading and reuse explains the goal.
- Native long-press selection directly on the live terminal is not promised.
- A single selection reaches terminal-held text. Selecting multiple screens of an application-held conversation at once is not promised; the described journey is to swipe, then select again.
- Terminal colors and text styles are optional in paused text.
- Application-created wrapping can leave breaks and indentation in copied URLs or commands. Obtaining unbroken text from a session conversation is a separate possible per-host story, deferred by Terry’s 2026-11-11 decision unless practical problems justify it.
- Local Chromium touch emulation is the specified automated proof method. It covers paused text, selected-range clipboard and paste behavior, return to live output, and both swipe cases; it cannot perform physical-device long-press selection.
- A developer’s physical-phone confirmation of that native gesture is a once-after-delivery proof deferral.
- Small-screen, one-handed use, an open keyboard and a working session explain the UI needs.
- The linked UX/UI North Star contains unbuilt direction; its contents were not supplied or consulted.
