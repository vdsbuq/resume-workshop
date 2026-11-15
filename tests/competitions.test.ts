import test from 'node:test';
import assert from 'node:assert/strict';
import {competitions,competitionStatus} from '../lib/competitions';
import {directions,classifyDirection} from '../lib/career-directions';
test('competition registration changes to closed at its explicit deadline',()=>{
 const c=competitions[0];assert.equal(competitionStatus(c,Date.parse('2026-11-15T00:00:00Z')),'官方报名窗口内');assert.equal(competitionStatus(c,Date.parse(c.end!)),'报名已截止');assert.equal(competitionStatus(competitions[1],Date.now()),'赛期需核实 / 学习参考');
});
test('competition direction references and domain links are valid',()=>{
 for(const c of competitions){assert.equal(new URL(c.url).protocol,'https:');for(const d of c.directions)assert.ok(directions.some(v=>v.id===d));}
});
test('specialist roles retain their relevant direction',()=>{
 assert.equal(classifyDirection('机械臂算法实习生'),'mechanical');assert.equal(classifyDirection('金融运营实习生'),'finance');assert.equal(classifyDirection('供应链规划与交付数据工程师实习生'),'supply');
});
