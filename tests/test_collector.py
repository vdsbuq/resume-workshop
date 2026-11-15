import importlib.util,json,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('collector',Path(__file__).parents[1]/'scripts/collect_jobs.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class CollectorTests(unittest.TestCase):
 def test_closed_platform_status_overrides_future_deadline(self):
  job={'id':1,'jobName':'财务实习生','status':1,'deliverEnd':4824633600000,'createTime':1700000000000,'ext':json.dumps({'requirements':'会计','infos':'核对'})}
  page='__INITIAL_STATE__='+json.dumps({'store':{'jobDetail':{'detail':job,'jobCompany':{'companyName':'示例'}}}})
  self.assertEqual(m.parse(page,'https://www.nowcoder.com/jobs/detail/1')['availability'],'closed')
 def test_structured_parse(self):
  job={'name':'数据分析实习生','postId':'abc','serviceCondition':'掌握SQL','workContent':'统计分析'}
  result=m.parse('x "postInfo":'+json.dumps(job)+' ,"other":undefined','https://example.test')
  self.assertEqual(result['requirements'],'掌握SQL');self.assertEqual(result['company'],'百度')
 def test_reject_non_job(self):
  with self.assertRaises(ValueError):m.parse('<html>login</html>','url')
 def test_reject_unrelated(self):
  with self.assertRaises(ValueError):m.parse('"postInfo":'+json.dumps({'name':'销售实习生'}),'url')
if __name__=='__main__':unittest.main()
class RefreshTests(unittest.TestCase):
 def test_unchanged_content_preserves_change_time(self):
  j={'title':'数据分析实习','company':'甲','city':'北京','requirements':'SQL','duties':'分析','availability':'listed'}
  first=m.reconcile(None,j,'t1');again=m.reconcile(first,j,'t2');self.assertEqual(again['contentChangedAt'],'t1');self.assertEqual(again['lastVerifiedAt'],'t2')
 def test_changed_content_updates_change_time(self):
  first=m.reconcile(None,{'requirements':'SQL'},'t1');self.assertEqual(m.reconcile(first,{'requirements':'Python'},'t2')['contentChangedAt'],'t2')
 def test_network_failure_retains_evidence_and_verification(self):
  old={'requirements':'SQL','lastVerifiedAt':'t1','availability':'listed'};v=m.failed(old,'t2','timeout');self.assertEqual(v['requirements'],'SQL');self.assertEqual(v['lastVerifiedAt'],'t1');self.assertEqual(v['availability'],'listed');self.assertEqual(v['syncStatus'],'failed')
 def test_missing_source_is_not_network_failure(self):
  self.assertEqual(m.failed({'availability':'listed'},'t2','404',True)['availability'],'unavailable')
