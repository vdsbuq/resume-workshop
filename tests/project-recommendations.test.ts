import test from 'node:test';
import assert from 'node:assert/strict';
import {directions} from '../lib/career-directions';
import {recommendedProjects} from '../lib/project-recommendations';
import {parseCareerDraft} from '../lib/career-storage';
test('all supported directions have at least two distinct actionable projects',()=>{for(const d of directions){const p=recommendedProjects(d.id);assert.ok(p.length>=2,d.id);assert.equal(new Set(p.map(x=>x.name)).size,p.length);for(const x of p){assert.ok(x.steps.length>=3);assert.ok(x.deliverables);}}});
test('saved project and results roundtrip in existing backup format',()=>{const draft={version:1,step:0,company:'',jobId:'',material:'',states:{},completed:{'project:法律检索':true,'法律检索:0':true},notes:{'法律检索':'我的学习记录'}};assert.deepEqual(parseCareerDraft(JSON.parse(JSON.stringify(draft))),draft);});
