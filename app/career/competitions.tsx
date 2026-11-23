'use client';
import {useEffect,useState} from 'react';
import {competitions,competitionStatus} from '@/lib/competitions';
export default function CompetitionDirectory({direction}:{direction:string}){
 const [all,setAll]=useState(false);const [now,setNow]=useState<number|null>(null);
 useEffect(()=>{setNow(Date.now());const t=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(t);},[]);
 const list=competitions.filter(c=>all||c.directions.includes(direction));
 return <section id="competition-directory" className="career-panel competition-directory"><div className="career-section-head"><div><h2>竞赛信息</h2><p>共 {competitions.length} 项，当前显示 {list.length} 项。</p></div></div><label><input type="checkbox" checked={all} onChange={e=>setAll(e.target.checked)}/> 查看所有方向的竞赛</label><p className="career-note">报名日期由人工整理。校内报名可能提前截止，请看本校通知。</p>{!list.length&&<p>这个方向还没收录比赛，勾选上方选项可以看全部。</p>}<div className="competition-grid">{list.map(c=><article key={c.id}><span className="competition-status">{now===null?'正在核对日期':competitionStatus(c,now)}</span><h3>{c.title}</h3><p>{c.description}</p><p><b>可以准备：</b>{c.preparation}</p><details><summary>时间、资格与来源</summary><p>{c.timing}</p><p>{c.eligibility}</p><small>上次核对：{c.checkedAt}</small></details><a href={c.url} target="_blank" rel="noreferrer">查看赛事来源 ↗</a></article>)}</div></section>;
}
