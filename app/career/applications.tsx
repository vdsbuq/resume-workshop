import {useState} from 'react';
import {stages,type Application} from '@/lib/applications';

export default function Applications({items,onChange}:{items:Application[];onChange:(items:Application[])=>void}){
 const [month,setMonth]=useState('');
 const visible=items.filter(a=>!month||a.date.startsWith(month));
 function edit(id:string,patch:Partial<Application>){onChange(items.map(a=>a.id===id?{...a,...patch}:a));}
 return <section className="career-panel"><h2>我的投递</h2>
 <label>投递月份 <input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label>
 <p>共 {visible.length} 条　{stages.map(s=>s+' '+visible.filter(a=>a.stage===s).length).join('　')}</p>
 {!visible.length&&<p>{month?'这个月还没有记录。':'在职位详情点击「记录投递」开始。'}</p>}
 {visible.map(a=><article key={a.id}><h3>{a.title}</h3><p>{a.company}</p><div className="planner-fields">
 <label>投递日期<input type="date" value={a.date} onChange={e=>{if(e.target.value)edit(a.id,{date:e.target.value});}}/></label>
 <label>简历版本<input maxLength={120} value={a.version} placeholder="如：运营版" onChange={e=>edit(a.id,{version:e.target.value})}/></label>
 <label>当前进展<select value={a.stage} onChange={e=>edit(a.id,{stage:e.target.value})}>{stages.map(s=><option key={s}>{s}</option>)}</select></label></div>
 <details><summary>记录投递时的岗位要求</summary><p className="pre">{a.requirements}</p></details>
 <button className="career-secondary" onClick={()=>{if(window.confirm('删除这条投递记录？'))onChange(items.filter(x=>x.id!==a.id));}}>删除记录</button></article>)}</section>;
}
