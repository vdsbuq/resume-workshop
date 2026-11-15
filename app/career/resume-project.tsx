'use client';
import {useState} from 'react';
import {emptyResume,parseResume,storageKey} from '@/lib/resume';
export default function ResumeProject({name,record}:{name:string;record:string}){
 const [open,setOpen]=useState(false);const [title,setTitle]=useState(name);const [period,setPeriod]=useState('');const [role,setRole]=useState('自主实践');const [description,setDescription]=useState('');const [message,setMessage]=useState('');
 function begin(){setTitle(name);setDescription(record);setMessage('');setOpen(true);}
 function save(){try{
  const raw=localStorage.getItem(storageKey);const resume=raw?parseResume(JSON.parse(raw)):emptyResume();
  const id='practice-'+name;
  if(resume.projects.some(p=>p.id===id)){setMessage('这个项目已经加入过简历，请到简历编辑器修改，避免重复添加。');return;}
  const updated=parseResume({...resume,projects:[...resume.projects,{id,title:title.trim(),subtitle:role.trim(),period:period.trim(),description:description.trim()}]});
  localStorage.setItem(storageKey,JSON.stringify(updated));window.location.assign('/');
 }catch{setMessage('未能保存，请检查当前简历备份或浏览器存储空间。原简历未被替换。');}}
 return <><button className="career-secondary" disabled={!record.trim()} onClick={begin}>整理为简历项目</button>{open&&<div className="project-draft" role="region" aria-label="简历项目草稿"><h4>确认你的真实项目经历</h4><p>仅载入你填写的记录，不会把任务要求写成已完成成果。日期和个人角色请自行补充。</p><label className="career-material">项目名称<input maxLength={500} value={title} onChange={e=>setTitle(e.target.value)}/></label><label className="career-material">个人角色<input maxLength={500} value={role} onChange={e=>setRole(e.target.value)}/></label><label className="career-material">实际开展时间<input maxLength={500} placeholder="例如：2026.10—2026.11" value={period} onChange={e=>setPeriod(e.target.value)}/></label><label className="career-material">实际工作与成果<textarea rows={5} maxLength={20000} value={description} onChange={e=>setDescription(e.target.value)}/></label><p role="status">{message}</p><div className="project-actions"><button className="career-primary" disabled={!title.trim()||!description.trim()} onClick={save}>确认加入并打开简历</button><button className="career-secondary" onClick={()=>setOpen(false)}>取消</button></div></div>}</>;
}
