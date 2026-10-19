"""Continue the reviewed fixture through the internal source-land handoff."""
from pathlib import Path
import json, shutil, subprocess, sys
source=Path(__file__).resolve().parents[4]
prior=Path(sys.argv[1]).resolve();root=Path(sys.argv[2]).resolve()
root.mkdir(parents=True,exist_ok=False)
def git(path,*args):return subprocess.check_output(['git','-C',str(path),*args],text=True).strip()
for name in ['open-dough','alpha','beta']:
    subprocess.run(['git','clone','-q','--bare',str(prior/f'{name}.git'),str(root/f'{name}.git')],check=True)
    subprocess.run(['git','clone','-q',str(root/f'{name}.git'),str(root/name)],check=True)
    git(root/name,'config','user.name','Fixture maintainer')
    git(root/name,'config','user.email','fixture@example.invalid')
od=root/'open-dough'
shutil.rmtree(od/'.agents/skills/dough-land')
shutil.copytree(source/'.agents/skills/dough-land',od/'.agents/skills/dough-land')
shutil.rmtree(od/'.agents/skills/collect-client-feedback')
shutil.copytree(source/'.agents/skills/collect-client-feedback',od/'.agents/skills/collect-client-feedback')
shutil.copytree(source/'src/skills',od/'src/skills')
with (od/'AGENTS.md').open('a') as f:
    f.write('''\nMaintenance delivery uses Dough Land through the composing skill's explicit\nsource handoff. Its installed helper runtime is this repository's\n`.agents/skills/`. Follow the maintained publisher and verify remote acceptance;\nplain ad hoc commit/push is not this project's delivery convention.\nNo execution story is selected: this is ordinary reviewed record maintenance.\n''')
with (od/'DearDough.md').open('a') as f:
    f.write('''\n## DD-099 — Repeated accepted checks\n\nShared Open Dough guidance. Execution od-check-new, 2026-10-19T10:00:00+09:00,\nCodex, release unknown. Accepted unchanged checks reran at two boundaries,\ncosting 17 minutes. Evidence: fixture://open-dough/check-new.\n''')
git(od,'add','-A');git(od,'commit','-qm','Prepare source handoff candidate and supplied new observation');git(od,'push','-q','origin','HEAD:refs/heads/main')
for name in ['open-dough','alpha','beta']:shutil.copy2(root/name/'DearDough.md',root/f'{name}-source-before.md')
(root/'inventory.json').write_text(json.dumps([{'id':n,'localPath':str(root/n),'ref':b,'origin':str(root/f'{n}.git')} for n,b in [('open-dough','main'),('alpha','main'),('beta','master')]],indent=2)+'\n')
(root/'prompt.txt').write_text(f'''Use $collect-client-feedback to run the next complete shared-feedback maintenance\ncycle on the supplied inventory {root}/inventory.json only.\nThe established Open Dough integration checkout is {od}. Canonical catalog is\ndocs/maintainer/finding-names.md; follow its linked findings. Watch list is\ndocs/maintainer/near-term-watch-list.md, backlog .planning/PRODUCT-BACKLOG.md,\nseeds .planning/seeds/. The current Open Dough log contains a newly supplied report.\nExisting records and prior accepted maintenance are actual starting state; preserve\naccepted work, evidence and identities. This explicit invocation authorizes\ncollection, mapping adoption, justified cleanup, selection and owned maintenance\npublication to every changed fixture origin. Use each project's delivery\nconventions and the candidate skill's source handoff when applicable. Do not read\nproduction configuration or change production repositories, implement responses\nor release guidance. Report at {root}/cycle-report.md, including actual coverage,\nchanged files and per-repository publication results.\n''')
print(root)
