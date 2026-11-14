import test from 'node:test';import assert from 'node:assert/strict';import {parseCareerDraft} from '../lib/career-storage';
const draft={version:1,step:2,company:'百度',jobId:'',material:'SQL课程',states:{SQL:'学过待实践'},completed:{'SQL:0':true},notes:{SQL:'完成查询'}};
test('career progress roundtrips and strips unknown properties',()=>{assert.deepEqual(parseCareerDraft({...draft,secret:'ignored'}),draft)});
test('career rejects oversized and invalid records',()=>{for(const v of [{...draft,material:'a'.repeat(30001)},{...draft,step:5},{...draft,states:{SQL:'expert'}},{...draft,completed:{SQL:'yes'}},{...draft,notes:{SQL:42}}])assert.throws(()=>parseCareerDraft(v));});
