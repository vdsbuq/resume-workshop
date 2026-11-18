"""Bounded public recruitment collector. No cookies, login, or CAPTCHA bypass."""
import urllib.parse
import hashlib
import argparse,datetime,json,pathlib,re,sqlite3,time,urllib.request,urllib.robotparser,urllib.error
ROOT=pathlib.Path(__file__).resolve().parents[1]
SEED='https://talent.baidu.com/jobs/detail/INTERN/5904f901-4ea7-4b1b-80c0-662a835eb090'
SEEDS=[SEED,'https://talent.baidu.com/jobs/detail/INTERN/9fda9a23-dfce-4230-bbad-6dffe04b4e2e','https://talent.baidu.com/jobs/detail/INTERN/a361b79c-86e5-4295-8bdd-a1f9c9988a5d']
SEEDS += ['https://www.nowcoder.com/jobs/detail/395542','https://www.nowcoder.com/jobs/detail/97627']
SEEDS += ['https://talent.baidu.com/jobs/detail/INTERN/'+i for i in ['139e3bea-1454-4991-88b4-6e8e14958db9','02c27a56-1bf6-42fd-b7cf-3156b2850728','c5e698fd-dab6-4242-a570-03657c21ffb6','9ed5cd68-582b-4a4f-b612-3250a3a62735','ac9bfc68-f403-42e4-803d-13ad690293b8']]
DIRECTIONS=json.loads((ROOT/'data/career-directions.json').read_text(encoding='utf-8-sig'))
def direction(title):
 return next((d['id'] for d in DIRECTIONS if any(k in title for k in d['keywords'])),None)
SEEDS += ['https://www.nowcoder.com/jobs/detail/'+i for i in ['219048','437814','474247','25274','285187']]
SEEDS += ['https://www.nowcoder.com/jobs/detail/'+i for i in ['464857','419435','458978','453161','462580','371953','210972','185370','439650','446230','439552','439426','470297','364026','447190','169956','429159','469447','461663']]
SEEDS += ['https://talent.baidu.com/jobs/detail/INTERN/'+i for i in ['24f9253e-9524-4d7a-87f8-ef31f9a3dd40', 'e2d04cbc-08d4-4dd0-9fc1-803bb10ef55d', '076e4cd6-d07f-40ac-882f-93dfddd84d91', '0ad545f8-07df-42f1-9a10-28e79d5dc407', '88eaf53d-b89d-4b9a-96c6-6b22791474ac', '48b3b420-6001-4950-89ae-161cbb03c8ae', 'f4aa7aac-3d94-43b6-9762-ced2340391af', '0016a3f3-f5d4-4930-b23b-a58b5dc093a8', '86ea29ad-f00f-4688-a003-4acb0c0778e3', '3f99034a-0491-4303-911b-6a742d64d400', '1eed2d7d-f373-4585-8646-f8e964aee3b1', 'ac539eb3-99f6-4b5d-88cc-23fecd9fca92', 'c351df3e-6f13-49d5-9252-8adaeff4a7be', '11e8fdcb-1120-48d8-b32b-bf656a74c11f', '3c4c99ac-e48d-4012-9ee2-c2f4e2b031a1', 'ee085594-48e5-4028-8345-c4033cbe439d', '866c315d-59b1-4664-a85c-c5f78ed979cd', '5814ff27-373f-4c3e-be0f-052ec8b79454']]
UA='ResumeWorkshopResearch/0.1'
DISCOVERY_URL='https://talent.baidu.com/jobs/list?recruitType=INTERN'

def discover_links(page):
 marker='"listDetailData":'
 if marker not in page:raise ValueError('Missing internship list')
 jobs,_=json.JSONDecoder().raw_decode(page.split(marker,1)[1])
 return list(dict.fromkeys('https://talent.baidu.com/jobs/detail/INTERN/'+j['postId'] for j in jobs if '实习' in j.get('name','') and direction(j['name']) and re.fullmatch(r'[a-f0-9-]{36}',j.get('postId',''))))[:10]
def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':UA})
 with urllib.request.urlopen(req,timeout=20) as r:
  if urllib.parse.urlparse(r.url).hostname != urllib.parse.urlparse(url).hostname:raise ValueError('Unexpected redirect')
  b=r.read(2000001)
  if len(b)>2000000:raise ValueError('Response too large')
  return b.decode('utf-8')
def parse(page,url):
 if urllib.parse.urlparse(url).hostname=='www.nowcoder.com':
  marker='__INITIAL_STATE__='
  if marker not in page:raise ValueError('Missing recruitment data')
  state,_=json.JSONDecoder().raw_decode(page.split(marker,1)[1]);detail=state['store']['jobDetail'];j=detail['detail'];ext=json.loads(j['ext'])
  if '实习' not in j['jobName'] or not direction(j['jobName']):raise ValueError('Outside selected job scope')
  return dict(id='nowcoder-'+str(j['id']),title=j['jobName'],company=detail['jobCompany']['companyName'],city='、'.join(j.get('jobCityList',[])),published=datetime.datetime.fromtimestamp(j['createTime']/1000,datetime.timezone.utc).strftime('%Y-%m-%d'),requirements=ext['requirements'],duties=ext['infos'],url=url,collectedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),source='牛客招聘平台',deadline=j.get('deliverEnd'),sourceStatus=j.get('status'),availability='closed' if (j.get('status')==1 or isinstance(j.get('deliverEnd'),(int,float)) and 1000000000000<j['deliverEnd']<datetime.datetime.now(datetime.timezone.utc).timestamp()*1000) else 'listed')

 marker='"postInfo":';start=page.find(marker)
 if start<0:raise ValueError('No structured vacancy found')
 job,_=json.JSONDecoder().raw_decode(page[start+len(marker):])
 if '实习' not in job['name'] or not direction(job['name']):raise ValueError('Outside selected job scope')
 return dict(id=job['postId'],title=job['name'],company='百度',city=job.get('workPlace',''),published=job.get('publishDate',''),requirements=job['serviceCondition'],duties=job['workContent'],url=url,collectedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),source='百度招聘官网',availability='closed' if re.search(r'"isValid"\s*:\s*false',page) else 'listed')
def reconcile(previous, fresh, now):
 fresh=dict(fresh)
 content={k:fresh.get(k) for k in ['title','company','city','requirements','duties','availability']}
 digest=hashlib.sha256(json.dumps(content,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
 fresh.update(contentHash=digest,lastAttemptAt=now,lastVerifiedAt=now,syncStatus='ok',contentChangedAt=now if not previous or previous.get('contentHash')!=digest else previous.get('contentChangedAt',now))
 return fresh

def failed(previous, now, error, missing=False):
 record=dict(previous)
 record.update(lastAttemptAt=now,syncStatus='missing' if missing else 'failed',syncError=error)
 if missing:record['availability']='unavailable'
 return record

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--url',action='append');args=ap.parse_args()
 path=ROOT/'data/jobs.json'
 old=json.loads(path.read_text(encoding='utf-8-sig')) if path.exists() else {'jobs':[]}
 records={j['url']:j for j in old['jobs']}
 urls=list(dict.fromkeys(args.url or SEEDS+list(records)))
 if args.url and len(urls)>100:raise SystemExit('At most 100 pages per run')
 if not args.url:urls.sort(key=lambda u:records.get(u,{}).get('lastAttemptAt',''))
 for u in urls:
  if not re.fullmatch(r'https://(?:talent\.baidu\.com/jobs/detail/INTERN/[a-f0-9-]{36}|www\.nowcoder\.com/jobs/detail/[0-9]+)',u):raise SystemExit('Unsupported recruitment URL')
 policies={};policy_errors={}
 for host in sorted(set(urllib.parse.urlparse(u).hostname for u in urls)):
  rp=urllib.robotparser.RobotFileParser()
  try:
   try:rp.parse(fetch('https://'+host+'/robots.txt').splitlines())
   except urllib.error.HTTPError as e:
    if e.code!=404:raise
    rp.parse([])
   policies[host]=rp
  except Exception as e:policy_errors[host]=str(e)
 errors=[];success=0
 if not args.url:
  try:
   host='talent.baidu.com'
   if host in policy_errors:raise ValueError(policy_errors[host])
   if not policies[host].can_fetch(UA,DISCOVERY_URL):raise ValueError('robots.txt disallows discovery')
   found=discover_links(fetch(DISCOVERY_URL))
   # Keep the request budget bounded; never drop existing records from the file.
   fresh_links=[u for u in found if u not in records]
   urls=list(dict.fromkeys(fresh_links+urls+found))[:100]
   print('Discovery: found',len(found),'eligible links',flush=True)
  except Exception as e:
   errors.append({'url':DISCOVERY_URL,'error':str(e),'attemptedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()})
 urls=urls[:100]
 for u in urls:
  now=datetime.datetime.now(datetime.timezone.utc).isoformat()
  try:
   host=urllib.parse.urlparse(u).hostname
   if host in policy_errors:raise ValueError('robots check failed: '+policy_errors[host])
   if not policies[host].can_fetch(UA,u):raise ValueError('robots.txt disallows collection')
   j=parse(fetch(u),u);records[u]=reconcile(records.get(u),j,now);success+=1;print('Verified:',j['title'],flush=True)
  except Exception as e:
   errors.append({'url':u,'error':str(e),'attemptedAt':now})
   if u in records:records[u]=failed(records[u],now,str(e),isinstance(e,urllib.error.HTTPError) and e.code in [404,410])
   print('Failed:',u,str(e),flush=True)
  time.sleep(2)
 now=datetime.datetime.now(datetime.timezone.utc).isoformat()
 payload={'generatedAt':now,'lastRunAt':now,'lastFullSuccessAt':now if not errors and set(records).issubset(urls) else old.get('lastFullSuccessAt'),'intervalHours':6,'attemptedCount':len(urls),'successfulCount':success,'jobs':sorted(records.values(),key=lambda j:j['id']),'errors':errors}
 tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8');tmp.replace(path)
 db=sqlite3.connect(ROOT/'data/jobs.sqlite');db.execute('CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, payload TEXT NOT NULL)')
 for j in records.values():db.execute('INSERT OR REPLACE INTO jobs VALUES (?,?)',(j['id'],json.dumps(j,ensure_ascii=False)))
 db.commit();db.close()
 if errors:raise SystemExit(1)
if __name__=='__main__':main()
