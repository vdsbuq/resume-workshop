import test from 'node:test';
import assert from 'node:assert/strict';
import {exportPracticePlan} from '../lib/career-export';
test('export includes actual progress, evidence and personal outcome without marking unfinished tasks done',()=>{
 const text=exportPracticePlan({direction:'数据分析',major:'统计',jobs:[{title:'实习',url:'https://example.com/job'}],plans:[{name:'SQL',project:'查询练习',steps:['清洗','分析'],deliverables:'报告'}],states:{SQL:'学过待实践'},completed:{'SQL:0':true},notes:{SQL:'分析了100行数据 https://example.com/work'},resources:{}});
 assert.match(text,/\[已完成\] 清洗/);assert.match(text,/\[待完成\] 分析/);assert.match(text,/分析了100行数据/);assert.match(text,/https:\/\/example.com\/job/);assert.match(text,/不代表能力认证/);
});
