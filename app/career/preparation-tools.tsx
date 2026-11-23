import {useState} from 'react';
import {clauses,preference,scheduleMatch,emptyAvailability} from '@/lib/job-preparation';
import type {JobRecord} from '@/lib/job-feed';

export function ScheduleFinder({jobs,onSelect}:{jobs:JobRecord[];onSelect:(job:JobRecord)=>void}){
  const [options,setOptions]=useState(emptyAvailability);
  const active=Object.values(options).some(v=>v.trim());
  const matches=active?jobs.map(job=>({job,...scheduleMatch(job,options)})):[];
  return <details className="job-analysis-tools"><summary>按课表找实习</summary>
    <p>在当前筛选的岗位中，核对你能到岗的时间和地点。</p>
    <div className="planner-fields">{([['city','城市'],['days','每周可到岗天数'],['months','可连续实习月数']] as const).map(([key,label])=><label key={key}>{label}
      {key==='city'?<input value={options.city} placeholder="不限" onChange={e=>setOptions({...options,city:e.target.value})}/>:
      <select value={options[key]} onChange={e=>setOptions({...options,[key]:e.target.value})}><option value="">不限</option>{Array.from({length:key==='days'?7:12},(_,i)=><option key={i+1}>{i+1}</option>)}</select>}</label>)}</div>
    {active&&['条件合适','需要确认','条件冲突'].map(status=><details key={status}><summary>{status}（{matches.filter(m=>m.status===status).length}）</summary>
    {matches.filter(m=>m.status===status).map(m=><div key={m.job.id}><button className="career-secondary" onClick={()=>onSelect(m.job)}>{m.job.company} · {m.job.title}</button><p>{m.evidence.join('；')||'原文未找到明确的时间条件'}</p></div>)}</details>)}
  </details>;
}
export function RequirementGroups({job}:{job:JobRecord}){
 const lines=clauses(job.requirements);
 const groups=[['明确要求',lines.filter(l=>!preference(l)&&/必须|必备|须具备|至少|不少于|要求具备/.test(l))],['优先或加分',lines.filter(preference)]] as const;
 return <details className="role-source"><summary>明确要求与加分项</summary>{groups.map(([title,items])=><div key={title}><h4>{title}</h4>{items.length?<ul>{items.map((line,i)=><li key={i}>{line}</li>)}</ul>:<p>未识别到明确措辞。</p>}</div>)}</details>;
}
export function Changes({job}:{job:JobRecord}){
 return <details><summary>岗位变化（{job.changes?.length||0}）</summary>{job.changes?.length?job.changes.map((c,i)=><div key={i}><strong>{c.at.slice(0,10)} · {c.label}</strong><p>之前：{c.before}</p><p>更新后：{c.after}</p></div>):<p>尚未记录到前后两次采集之间的变化。</p>}</details>;
}
const prompts=[
 {match:/排班|招新|社团/,role:'招聘、运营',ask:'遇到时间冲突时，你怎么重新安排人手？'},
 {match:/报销|对账|预算/,role:'财务、采购',ask:'你是怎样发现差额，并核对原始记录的？'},
 {match:/问卷|调查|访谈/,role:'用户研究、市场运营',ask:'哪一条反馈改变了你们原先的判断？'},
 {match:/报表|销售|Excel|SQL/i,role:'数据分析、运营',ask:'你检查过哪些数据？整理后的表被用来做什么？'},
 {match:/原型|海报|设计/,role:'设计、产品',ask:'根据谁的反馈，你改过哪一处？'}
];
export function Coursework({material}:{material:string}){
 const hits=prompts.filter(item=>item.match.test(material));
 return <details><summary>从课程作业和社团经历里找素材</summary>{hits.length?hits.map(item=><p key={item.role}><b>{item.role}</b>　{item.ask}</p>):<p>可以在上方写一件你做过的小事，比如排班、整理问卷或核对报销单。</p>}</details>;
}
