'use client';
import {useEffect,useState} from 'react';
import {competitions,competitionStatus} from '@/lib/competitions';
export default function CompetitionDirectory({direction}:{direction:string}){
 const [all,setAll]=useState(false);const [now,setNow]=useState<number|null>(null);
 useEffect(()=>{setNow(Date.now());const t=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(t);},[]);
 const list=competitions.filter(c=>all||c.directions.includes(direction));
 return <section className="career-panel competition-directory"><div className="career-section-head"><div><h2>竞赛与实践机会</h2><p>共收录 {competitions.length} 项；方向关联是准备建议，不代表参赛资格。</p></div></div><label><input type="checkbox" checked={all} onChange={e=>setAll(e.target.checked)}/> 查看所有方向的竞赛</label><p className="career-note">竞赛信息为人工核查，尚未接入自动更新。报名窗口可能调整，请同时核对官方和校内通知。</p>{!list.length&&<p>该方向暂未收录经核查的专项竞赛，可查看全部赛事或先完成自主实践。</p>}<div className="competition-grid">{list.map(c=><article key={c.id}><span className="competition-status">{now===null?'正在核对日期':competitionStatus(c,now)}</span><h3>{c.title}</h3><p>{c.description}</p><p><b>可以准备：</b>{c.preparation}</p><details><summary>时间、资格与来源</summary><p>{c.timing}</p><p>{c.eligibility}</p><small>人工核查：{c.checkedAt}；不是实时状态。</small></details><a href={c.url} target="_blank" rel="noreferrer">查看赛事来源 ↗</a></article>)}</div></section>;
}
