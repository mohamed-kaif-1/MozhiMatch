#!/usr/bin/env python3
"""Audit a delivered engineering blueprint. This does not test the future app."""
from pathlib import Path
import json
import re
import hashlib
import sys
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
errors=[]
checks=[]
def check(condition, name, detail=''):
    checks.append({'check':name,'passed':bool(condition),'detail':detail})
    if not condition: errors.append(name+(' — '+detail if detail else ''))

allfiles=[p for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts]
check(len(allfiles)>=120,'required file set',str(len(allfiles)))
json_files=[p for p in allfiles if p.suffix=='.json' or p.name=='api-schema.yaml']
objects={}
for p in json_files:
    try:objects[p.relative_to(ROOT).as_posix()]=json.loads(p.read_text(encoding='utf-8'))
    except Exception as exc:check(False,'JSON parse '+p.name,str(exc))
check(len(objects)==len(json_files),'all structured files parse',str(len(objects)))

for p in ROOT.rglob('*.md'):
    text=p.read_text(encoding='utf-8')
    check(text.startswith('# '),'heading '+p.relative_to(ROOT).as_posix())
    for dest in re.findall(r'\]\(([^)]+)\)',text):
        if dest.startswith(('http://','https://','mailto:','#')):continue
        target=dest.split('#')[0]
        check(not target or (p.parent/target).exists(),'relative link '+p.relative_to(ROOT).as_posix(),target)
    for line in text.splitlines():
        if line.startswith('Copy-Item '):
            parts=line.split()
            check(len(parts)==3 and (ROOT/parts[1]).exists(),'PowerShell copy source',line)

def flat(data,prefix=''):
    out={}
    for key,value in data.items():
        name=prefix+'.'+key if prefix else key
        if isinstance(value,dict):out.update(flat(value,name))
        else:out[name]=value
    return out

en=flat(objects['05_MULTILINGUAL/en.json']);ta=flat(objects['05_MULTILINGUAL/ta.json'])
check(set(en)==set(ta),'locale key parity',str(len(en)))
for key in en:
    check(set(re.findall(r'\{(\w+)\}',en[key]))==set(re.findall(r'\{(\w+)\}',ta.get(key,''))),'locale placeholders '+key)

tasks=objects['07_IMPLEMENTATION/tasks.json'];byid={t['id']:t for t in tasks}
check(len(tasks)==116 and len(byid)==116,'116 unique tasks')
for owner in ['Kaif','Aasim']:
    lane=sorted([t for t in tasks if t['owner']==owner],key=lambda t:t['start'])
    check(lane[0]['start']==0 and lane[-1]['end']==1440,'24-hour lane '+owner)
    check(sum(t['minutes'] for t in lane)==1440,'lane minutes '+owner)
    check(all(a['end']==b['start'] for a,b in zip(lane,lane[1:])),'nonoverlapping continuous lane '+owner)
for task in tasks:
    check(task['end']-task['start']==task['minutes'],'task duration '+task['id'])
    check((ROOT/task['prompt']).exists(),'task prompt '+task['id'])
    for dependency in task['dependencies']:
        check(dependency in byid and byid[dependency]['end']<=task['start'],'task dependency '+task['id'],dependency)

for n in range(15):
    p=ROOT/f'09_ANTIGRAVITY/prompts/PROMPT_{n:02}.md'
    check(p.exists(),'prompt exists '+str(n))
    if p.exists():
        content=p.read_text()
        for phrase in ['Context files','Objective','Preconditions','Scope and files','Implementation requirements','Restrictions','Acceptance criteria','Validation','Expected report','Stop and recovery conditions','Next phase']:
            check('## '+phrase in content,'prompt section '+str(n),phrase)
        for reference in re.findall(r'^- `([^`]+)`',content,re.M):
            check((ROOT/reference).exists(),'prompt input '+str(n),reference)

openapi=objects['03_BACKEND/api-schema.yaml']
schemas=openapi['components']['schemas']
check(schemas['AnalyzeRequest']==objects['03_BACKEND/request.schema.json'],'OpenAPI request parity')
check(schemas['AnalyzeResponse']==objects['03_BACKEND/response.schema.json'],'OpenAPI response parity')
check(schemas['ErrorResponse']==objects['03_BACKEND/error.schema.json'],'OpenAPI error parity')

try:
    from jsonschema import Draft202012Validator, FormatChecker
    for path in ['03_BACKEND/request.schema.json','03_BACKEND/response.schema.json','03_BACKEND/error.schema.json','04_AI/provider-output.schema.json']:
        Draft202012Validator.check_schema(objects[path]);check(True,'schema validity '+path)
    examples=[('03_BACKEND/examples/request.json','03_BACKEND/request.schema.json'),('03_BACKEND/examples/response.json','03_BACKEND/response.schema.json'),('03_BACKEND/examples/fallback.json','03_BACKEND/response.schema.json'),('03_BACKEND/examples/error.json','03_BACKEND/error.schema.json'),('04_AI/provider-example.json','04_AI/provider-output.schema.json')]
    for example,schema in examples:
        issues=list(Draft202012Validator(objects[schema],format_checker=FormatChecker()).iter_errors(objects[example]))
        check(not issues,'fixture schema '+example,'; '.join(x.message for x in issues))
    req=objects['03_BACKEND/examples/request.json'];validator=Draft202012Validator(objects['03_BACKEND/request.schema.json'],format_checker=FormatChecker())
    for split in ['10_TESTING/fixtures/development.json','10_TESTING/fixtures/holdout-inputs.json']:
        for item in objects[split]:
            sample=dict(req,items=[item])
            check(not list(validator.iter_errors(sample)),'input item schema '+item['id'])
except ImportError:
    checks.append({'check':'JSON Schema fixture validation','passed':None,'detail':'SKIPPED — install optional jsonschema to repeat full schema checks'})

# Validate the example's source spans and complete fixed-field coverage independently of the future implementation.
req=objects['03_BACKEND/examples/request.json'];response=objects['03_BACKEND/examples/response.json']
items={x['id']:x for x in req['items']}
for result in response['items']:
    src=items[result['id']]
    refs=[(x['field']['kind'],x['field']['label']) for x in result['comparisons']]
    expected=[('stem',None)]+[('option',x['label']) for x in src['en']['options']]
    check(Counter(refs)==Counter(expected),'example full field coverage')
    for comparison in result['comparisons']:
        for lang in ['en','ta']:
            f=comparison['field']
            raw=src[lang]['stem'] if f['kind']=='stem' else next(o['text'] for o in src[lang]['options'] if o['label']==f['label'])
            span=comparison[lang];units=raw.encode('utf-16-le')
            sliced=units[span['start']*2:span['end']*2].decode('utf-16-le')
            check(sliced==span['text'] and raw.count(span['text'])==1,'example exact evidence '+lang+' '+str(f))

# WCAG relative luminance for the chosen text/surface pairs.
def luminance(col):
    rgb=[int(col[i:i+2],16)/255 for i in (1,3,5)]
    values=[v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4 for v in rgb]
    return sum(v*w for v,w in zip(values,[0.2126,0.7152,0.0722]))
colors=objects['02_FRONTEND/design-tokens.json']['colors']
for foreground,background in [('ink','paper'),('ink','surface'),('muted','surface'),('primaryText','primary'),('successText','successBg'),('warningText','warningBg'),('dangerText','dangerBg'),('ink','support')]:
    a,b=luminance(colors[foreground]),luminance(colors[background]);ratio=(max(a,b)+0.05)/(min(a,b)+0.05)
    check(ratio>=4.5,'text contrast '+foreground+'/'+background,format(ratio,'.2f')+':1')

manifest=objects.get('FILE_MANIFEST.json')
if manifest:
    for entry in manifest['files']:
        p=ROOT/entry['path']
        check(p.exists(),'manifest path '+entry['path'])
        if p.exists():check(hashlib.sha256(p.read_bytes()).hexdigest()==entry['sha256'],'manifest hash '+entry['path'])

report={'kind':'documentation_and_fixture_validation','application_tests':'NOT_RUN','live_model_benchmark':'NOT_RUN','checks':len(checks),'failures':errors,'passed':not errors,'details':checks}
if '--json' in sys.argv:print(json.dumps(report,ensure_ascii=False,indent=2))
else:
    print(json.dumps({k:v for k,v in report.items() if k!='details'},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
