"""Disposable slice-1 native review aid. Creates only isolated local repositories."""
from pathlib import Path
import json, shutil, subprocess, sys

source = Path(__file__).resolve().parents[4]
root = Path(sys.argv[1]).resolve()
root.mkdir(parents=True, exist_ok=False)

def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], text=True).strip()

def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)

projects = [('open-dough', 'main'), ('alpha', 'main'), ('beta', 'master')]
for name, branch in projects:
    repo = root / name
    repo.mkdir()
    subprocess.run(['git', 'init', '-q', '-b', branch, str(repo)], check=True)
    git(repo, 'config', 'user.name', 'Fixture maintainer')
    git(repo, 'config', 'user.email', 'fixture@example.invalid')
    write(repo/'AGENTS.md', f'''# Isolated feedback review\nThis repository uses `{branch}` on its local `origin`. Canonical feedback is\n`DearDough.md`. Use ordinary Git delivery; no hooks or formatter apply.\nOnly maintenance records are in scope. Do not access production repositories.\n''')
    write(repo/'guidance.md', 'Published guidance: never publish unrelated files.\n')

od = root/'open-dough'
shutil.copytree(source/'.agents/skills', od/'.agents/skills')
# Candidate public handoff is materialized only in this disposable installation.
shutil.rmtree(od/'.agents/skills/dough-land')
shutil.copytree(source/'src/skills/dough-land', od/'.agents/skills/dough-land')
shutil.copytree(source/'docs/adrs', od/'docs/adrs')
shutil.copy2(source/'AGENTS.md', od/'AUTHORING.md')
write(od/'.planning/PRODUCT-BACKLOG.md', '''# Product backlog\n\n## Near-future direction\n\nReduce observed agent execution waste while preserving user work.\n\n## Taken\n\n- [Preserve observations during transport interruptions](seeds/SEED-001-feedback.md#preserve-observations) — SEED-001#preserve-observations\n\n## Backlog list\n\n- [Unrelated useful work](seeds/SEED-001-feedback.md#unrelated-useful-work) — SEED-001#unrelated-useful-work\n- [Avoid repeating accepted checks](seeds/SEED-001-feedback.md#avoid-repeating-checks) — SEED-001#avoid-repeating-checks\n''')
write(od/'.planning/seeds/SEED-001-feedback.md', '''---\nid: SEED-001\nstatus: seed\nplanted: 2026-10-01\nplanted_during: isolated native review\ntrigger_when: explicit feedback maintenance\nscope: small\n---\n# SEED-001: Reduce execution waste\n\n## Why This Matters\n\nAgents need to preserve user work and avoid repeating completed operations.\n\n## Stories\n\n<a id="preserve-observations"></a>\n### 1. Preserve observations during transport interruptions\n\nFor executing agents, preserve a known observation across transport interruptions.\nAddresses [ODF-002](../../docs/maintainer/findings/ODF-002.md). Already Taken.\n\n<a id="unrelated-useful-work"></a>\n### 2. Unrelated useful work\n\nFor maintainers, make the unrelated established outcome visible.\n\n<a id="avoid-repeating-checks"></a>\n### 3. Avoid repeating accepted checks\n\nFor executing agents, reuse completed accepted checks across slice boundaries\nwithout rerunning them. Addresses [ODF-001](../../docs/maintainer/findings/ODF-001.md).\nOn delivery record the actual response and containing release on ODF-001.\n''')
write(od/'docs/maintainer/finding-names.md', '''# Finding names\n\nCodes are permanent; highest allocated is ODF-009. Never reuse a removed code.\nLinked records own meaning, disposition and evidence. Count project/execution once.\n\n## ODF-001 — [Repeated accepted checks](findings/ODF-001.md) <a id="odf-001"></a>\n\n## ODF-002 — [Lost observation after transport](findings/ODF-002.md) <a id="odf-002"></a>\n\n## ODF-003 — [Unrelated files published](findings/ODF-003.md) <a id="odf-003"></a>\n\n## ODF-004 — [Obsolete approval question](findings/ODF-004.md) <a id="odf-004"></a>\n''')
findings = {
'001': ('Repeated accepted checks', 'Agents rerun accepted unchanged checks at each slice boundary.', '**Follow-up:** [Avoid repeating accepted checks](../../../.planning/seeds/SEED-001-feedback.md#avoid-repeating-checks), queued, not resolved.'),
'002': ('Lost observation after transport', 'Transport interruption loses a known observation locator.', '**Follow-up:** [Preserve observations during transport interruptions](../../../.planning/seeds/SEED-001-feedback.md#preserve-observations), Taken, ongoing, not resolved.'),
'003': ('Unrelated files published', 'Whole-checkout publication included unrelated user changes.', '**Follow-up:** Open, unqueued.'),
'004': ('Obsolete approval question', 'Agent asks again for an already authorized maintenance commit.', '**Follow-up:** Response implemented in guidance.md; containing release and actual adoption/exposure remain unverified. Do not queue implementation again.'),
}
for code,(title,meaning,follow) in findings.items():
    write(od/f'docs/maintainer/findings/ODF-{code}.md', f'## ODF-{code} — {title}\n\n**Meaning:** {meaning}\n\n{follow}\n')
write(od/'docs/maintainer/near-term-watch-list.md', '# Released responses under observation\n\n_No verified relevant-use starts yet._\n')
write(od/'DearDough.md', '''# Process findings\n\n## DD-001 — Unrelated files published\n\nShared Open Dough feedback. Execution od-severe on 2026-10-10, Codex, release\nunknown. Whole-checkout maintenance published an unrelated private user note.\nObserved effect: the user had to remove the note from the origin and review its\nexposure. Evidence: fixture://open-dough/od-severe/publication.\nInference: isolation instruction was skipped; no frequency claim.\n\n## DD-002 — Obsolete approval question\n\nShared Open Dough feedback. Execution od-approved on 2026-10-09, Claude Code,\nrelease unknown. Agent asked for maintenance commit permission already supplied.\nObserved effect: one extra user exchange. Evidence: fixture://open-dough/od-approved.\nResponse is implemented in guidance.md; containing release and actual adoption\nare not yet verified.\n''')
write(root/'alpha/DearDough.md', '''# Process findings\n\n## DD-001 — Repeated accepted checks\n\nShared Open Dough guidance.\n- Execution alpha-check-a; timestamp 2026-10-11T09:00:00+09:00; Codex; release unknown; evidence fixture://alpha/check-a. Accepted unchanged checks reran at three boundaries, costing 48 minutes.\n- Execution alpha-check-b; timestamp 2026-10-12T09:00:00+09:00; Cursor; release unknown; evidence fixture://alpha/check-b. Same mechanism cost 42 minutes.\n\n## ODF-001 — Repeated accepted checks\n\nFormer local code: DD-001.\nSame project execution alpha-check-a, fixture://alpha/check-a, 2026-10-11T09:00:00+09:00, Codex, release unknown. This is a second report of the same 48 minutes, not another execution.\n\n## DD-002 — Lost observation after transport\n\nShared Open Dough feedback. Execution alpha-transport, 2026-10-13, Codex, release\nunknown. A known locator vanished on transport interruption and rebuilding it\ncost 20 minutes. Evidence: fixture://alpha/transport.\n\n## DD-003 — Local stylesheet spelling\n\nProject-local only. Execution alpha-css, 2026-10-13, local CSS naming convention.\nA misleading class label cost one minute. Not caused by shared Open Dough guidance.\n\n## DD-004 — Repeated heading punctuation\n\nShared feedback. Execution alpha-cosmetic, 2026-10-13, Codex, release unknown.\nOne heading had a cosmetic extra dot, one minute to correct, output unaffected.\nEvidence: fixture://alpha/cosmetic.\n\n## DD-005 — Predicted disaster from a long heading\n\nShared feedback suggestion only: a long heading might cause a future agent to\npublish secrets. No execution or observed harmful effect; speculative inference.\nEvidence: fixture://alpha/hypothesis.\n''')
write(root/'beta/DearDough.md', '''# Process findings\n\n## DD-001 — Reread after losing a locator\n\nAttribution to shared guidance is uncertain. Execution beta-reread on 2026-10-14,\nClaude Code, release unknown. An observation could not be located and the agent\nreread a transcript for 12 minutes. It is not known whether transport lost it,\nor the project note lacked the locator initially. Evidence: fixture://beta/reread.\nDo not assume the same cause as transport-interruption reports.\n\n## DD-002 — Repeated accepted checks\n\nShared Open Dough guidance. Execution beta-check, 2026-10-14T11:00:00+09:00,\nClaude Code, release unknown. Accepted unchanged checks reran at two boundaries,\ncosting 36 minutes. Evidence: fixture://beta/check.\n''')
for name,branch in projects:
    repo=root/name
    git(repo,'add','-A');git(repo,'commit','-qm','Fixture input')
    if name=='open-dough':
        # Prove code allocation survives a previously pruned, higher code.
        write(repo/'docs/maintainer/findings/ODF-010.md', '## ODF-010 — Retired historical finding\n')
        git(repo,'add','-A');git(repo,'commit','-qm','Historical allocation ODF-010')
        (repo/'docs/maintainer/findings/ODF-010.md').unlink()
        git(repo,'add','-A');git(repo,'commit','-qm','Retire historical finding')
        with (repo/'guidance.md').open('a') as f:f.write('Do not ask again for explicitly authorized maintenance commits.\n')
        git(repo,'add','-A');git(repo,'commit','-qm','Implement approval response; release not yet tagged')
    bare=root/f'{name}.git'
    subprocess.run(['git','init','--bare','-q',str(bare)],check=True)
    git(repo,'remote','add','origin',str(bare));git(repo,'push','-qu','origin',branch)
    subprocess.run(['git','--git-dir',str(bare),'symbolic-ref','HEAD',f'refs/heads/{branch}'],check=True)
    shutil.copy2(repo/'DearDough.md',root/f'{name}-source-before.md')
write(root/'inventory.json',json.dumps([{'id':n,'localPath':str(root/n),'ref':b,'origin':str(root/f'{n}.git')} for n,b in projects],indent=2)+'\n')
write(root/'prompt.txt', f'''Use $collect-client-feedback to run one complete shared-feedback maintenance cycle.\nThis is an explicitly authorized native observation in isolated repositories.\nUse only the inventory at {root}/inventory.json and these three repositories;\ndo not read production inventory or alter any production repository.\nThe established Open Dough integration checkout is {od}; its canonical catalog\nis docs/maintainer/finding-names.md, linked findings under docs/maintainer/findings/,\nwatch list docs/maintainer/near-term-watch-list.md, backlog .planning/PRODUCT-BACKLOG.md,\nand seeds .planning/seeds/. All three origins are local bare fixtures.\nThe invocation authorizes collection, clear mapping adoption, justified compaction/\ncleanup, selecting up to two priorities and ordinary maintenance commit/integration/\nsynchronization in every changed fixture repository, including Open Dough.\nFollow the candidate skill and its existing children. Do not implement responses\nor make releases. Preserve local-only findings and uncertainty. Report concrete\nresult locations and each origin target's accepted SHA, with limits.\nWrite your completion report to {root}/cycle-report.md.\n''')
print(root)
