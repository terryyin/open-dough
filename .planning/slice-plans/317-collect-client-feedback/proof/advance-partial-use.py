"""Change only independently owned availability/source inputs between invocations."""
from pathlib import Path
import json, subprocess, sys

root = Path(sys.argv[1]).resolve()
phase = sys.argv[2]

def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], text=True).strip()

if phase == 'clients':
    (root/'beta.offline.git').rename(root/'beta.git')
    report = 'clients-report.md'
elif phase == 'finish':
    (root/'open-dough.offline.git').rename(root/'open-dough.git')
    # The project owner supplies its previously absent source; maintenance did not
    # manufacture an empty successful review in either partial invocation.
    (root/'gamma/DearDough.md').write_text('''# Project feedback

## DD-001 — Local preview port collision

Local-only product issue: gamma-preview on 2026-10-19T12:00:00+09:00 found
gamma's development preview port occupied, costing 4 minutes. The shared guidance
was not implicated. Evidence: fixture://gamma/local-preview.
''')
    git(root/'gamma', 'add', 'DearDough.md')
    git(root/'gamma', 'commit', '-qm', 'Project owner supplies missing local feedback source')
    git(root/'gamma', 'push', '-q', 'origin', 'HEAD:refs/heads/main')
    report = 'recovery-report.md'
elif phase == 'missing-config':
    (root/'inventory.json').rename(root/'inventory.unavailable.json')
    report = 'missing-config-report.md'
else:
    raise SystemExit(f'unknown phase: {phase}')
prompt = f'''The user explicitly invoked combined local-then-shared feedback maintenance;
this task is only its authorized shared-phase handoff to $collect-client-feedback.
Resume the same finite cycle using {root}/inventory.json, actual Git state and the
retained reports at {root}/partial-report.md and {root}/clients-report.md when
present. The established Open Dough integration checkout is {root}/open-dough.
Canonical destinations: docs/maintainer/finding-names.md and its linked owners,
docs/maintainer/near-term-watch-list.md, .planning/PRODUCT-BACKLOG.md and
.planning/seeds/. The caller passes collection, unambiguous adoption, justified
cleanup, supported selection and owned publication authority to each intended
fixture origin, using project delivery conventions. Preserve completed work and
unrelated bytes. Inspect current sources/discovery/targets; independent project
owners maintain these inputs. Report actual coverage and publication/refresh/
resource results at {root}/{report}.
Only these fixture repositories are authorized. Do not read production inventory
or change production projects, repair infrastructure, edit inventory, implement
responses, release/install guidance or build combined-phase orchestration. Keep
temporary helpers/reports outside repositories. Do not edit supplied skill files.
'''
(root/'prompt.txt').write_text(prompt)
(root/f'{phase}-prompt.txt').write_text(prompt)
print(json.dumps({'phase':phase, 'report':str(root/report)}))
