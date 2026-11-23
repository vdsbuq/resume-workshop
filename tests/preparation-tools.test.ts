import test from 'node:test';
import assert from 'node:assert/strict';
import {scheduleMatch} from '../lib/job-preparation';
import {newApplication,validApplications} from '../lib/applications';
import type {JobRecord} from '../lib/job-feed';
const job:JobRecord={id:'test',title:'运营实习',company:'测试企业',city:'杭州',published:'',collectedAt:'',url:'',requirements:'每周至少三天，至少实习3个月。',duties:''};
const options={city:'杭州',days:'3',months:'3'};
test('课表对照区分明确条件、偏好和未注明的条件',()=>{
 assert.equal(scheduleMatch(job,options).status,'条件合适');
 assert.equal(scheduleMatch(job,{...options,days:'2'}).status,'条件冲突');
 assert.equal(scheduleMatch({...job,requirements:'每周5天优先'},options).status,'需要确认');
});
test('投递记录保留当时的要求，也能发现重复或损坏的备份',()=>{
 const a=newApplication(job);
 assert.equal(a.requirements,job.requirements);
 assert.ok(validApplications([a]));
 assert.ok(!validApplications([a,a]));
 assert.ok(!validApplications([{...a,stage:'invalid'}]));
});
