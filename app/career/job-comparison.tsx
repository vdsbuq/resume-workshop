import {useState} from 'react';
import {requirementEvidence, skillRules} from '@/lib/career';
import {usableJob, type JobRecord} from '@/lib/job-feed';

import {Changes} from './preparation-tools';

type Props = {jobs:JobRecord[]; favorites:string[]; onRemove:(id:string)=>void; onBrowse:()=>void};

export default function JobComparison({jobs,favorites,onRemove,onBrowse}:Props) {
  const [selection,setSelection] = useState<string[]>([]);
  const records = new Map(jobs.map(job=>[job.id,job]));
  const compared = jobs.filter(job=>favorites.includes(job.id) && selection.includes(job.id));
  const skills = skillRules.map(rule=>{
    const evidence = compared.map(job=>requirementEvidence(job.requirements,rule.pattern)[0]);
    return {rule,evidence,count:evidence.filter(Boolean).length};
  }).filter(skill=>skill.count).sort((a,b)=>b.count-a.count);
  const shared = skills.filter(skill=>skill.count>=2);

  function toggle(id:string) {
    setSelection(compared.some(job=>job.id===id)
      ? compared.filter(job=>job.id!==id).map(job=>job.id)
      : [...compared.map(job=>job.id),id].slice(0,3));
  }

  return <section className="career-panel comparison">
    <h2>收藏与对比</h2>
    {favorites.length===0 ? <p>还没有收藏。<button className="career-secondary" onClick={onBrowse}>去挑岗位</button></p> :
      <><p>勾选 2 至 3 个岗位对比。</p>
        {favorites.map(id=>{
          const job=records.get(id);
          const checked=compared.some(item=>item.id===id);
          return <div className="saved-job" key={id}>
            <label><input type="checkbox" checked={checked} disabled={!job||(!checked&&compared.length===3)} onChange={()=>toggle(id)}/>
              {job ? job.company+' · '+job.title : '岗位已移出目录'}{job&&!usableJob(job)&&'（历史岗位）'}</label>
            {job&&<Changes job={job}/>}<button onClick={()=>{setSelection(prev=>prev.filter(key=>key!==id));onRemove(id);}}>取消收藏</button>
          </div>;
        })}
      </>}
    {compared.length>=2 && <>
      <div className="comparison-scroll" tabIndex={0} aria-label="岗位对比表">
        <table><caption>任职要求对比</caption><thead><tr><th scope="col">对比项</th>{compared.map(job=><th key={job.id} scope="col"><a href={job.url} target="_blank" rel="noreferrer">{job.title}</a></th>)}</tr></thead>
          <tbody><tr><th scope="row">企业</th>{compared.map(job=><td key={job.id}>{job.company}</td>)}</tr>
          <tr><th scope="row">城市</th>{compared.map(job=><td key={job.id}>{job.city||'详见原文'}</td>)}</tr>
          {skills.map(({rule,evidence})=><tr key={rule.name}><th scope="row">{rule.name}</th>{compared.map((job,i)=><td key={job.id}>{evidence[i]?<details><summary>查看原句</summary><p>{evidence[i]}</p></details>:'原文未提及'}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <h3>可以一起准备的练习</h3>
      {shared.length ? shared.map(({rule,evidence})=><details key={rule.name}>
        <summary>{rule.project}（{rule.name}）</summary>
        <p>提到这项技能的岗位：{compared.filter((_,i)=>evidence[i]).map(job=>job.company+' · '+job.title).join('、')}</p>
        <ol>{rule.steps.map(step=><li key={step}>{step}</li>)}</ol>
      </details>) : <p>这些岗位的任职要求中，暂未找到共同的技能关键词。</p>}
    </>}
  </section>;
}
