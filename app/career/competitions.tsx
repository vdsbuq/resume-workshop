'use client';
import {useEffect,useState} from 'react';
import {competitions,competitionStatus} from '@/lib/competitions';
import {classifyDirection} from '@/lib/career-directions';
import type {JobRecord} from '@/lib/job-feed';
const practiceSkills:Record<string,string>={
 'lanqiao-code':'程序设计、限时调试','lanqiao-design':'视觉表达、作品排版',
 'logistics-bjtu':'配送流程调查、成本比较','mechanical-innovation':'结构设计、样机测试',
 'ecommerce-innovation':'用户访谈、成本测算',rm:'机械装配、电控或视觉调试',
 mcm:'建模、数据验证、论文写作',ada:'创意策划、视觉表达',market:'问卷设计、调查分析',
 'tianchi-paper':'数据清洗、趋势分析','tianchi-car':'特征处理、预测误差分析'
};
export default function CompetitionDirectory({direction,savedJobs}:{direction:string;savedJobs:JobRecord[]}){
 const [all,setAll]=useState(false);const [now,setNow]=useState<number|null>(null);
 useEffect(()=>{setNow(Date.now());const t=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(t);},[]);
 const list=competitions.filter(c=>all||c.directions.includes(direction));
 return <section id="competition-directory" className="career-panel competition-directory"><div className="career-section-head"><div><h2>竞赛信息</h2><p>共 {competitions.length} 项，当前显示 {list.length} 项。</p></div></div><label><input type="checkbox" checked={all} onChange={e=>setAll(e.target.checked)}/> 查看所有方向的竞赛</label><p className="career-note">报名日期由人工整理。校内报名可能提前截止，请看本校通知。</p>{!list.length&&<p>这个方向还没收录比赛，勾选上方选项可以看全部。</p>}<div className="competition-grid">{list.map(c=><article key={c.id}><span className="competition-status">{now===null?'正在核对日期':competitionStatus(c,now)}</span><h3>{c.title}</h3><p>{c.description}</p><p><b>能练到：</b>{practiceSkills[c.id]}</p><p><b>可以准备：</b>{c.preparation}</p><p><b>对应的收藏岗位：</b>{savedJobs.filter(j=>c.directions.includes(classifyDirection(j.title))).map(j=>j.company+' · '+j.title).join('、')||'暂无同方向收藏'}</p><details><summary>报名时间与组队资格</summary><p>{c.timing}</p><p>{c.eligibility}</p><small>上次核对：{c.checkedAt}</small></details><a href={c.url} target="_blank" rel="noreferrer">查看赛事来源 ↗</a></article>)}</div></section>;
}
