import type {JobRecord} from './job-feed';

export const stages=['已投递','笔试','面试','录用','未通过','已撤回'] as const;
export type Application={id:string;company:string;title:string;date:string;version:string;stage:string;requirements:string};
export function newApplication(job:JobRecord):Application {
  const today=new Date();
  return {id:job.id,company:job.company,title:job.title,date:[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-'),version:'',stage:'已投递',requirements:job.requirements};
}
export function validApplications(value:unknown):value is Application[] {
  return Array.isArray(value)&&value.length<=1000&&new Set(value.map(a=>a?.id)).size===value.length&&value.every(a=>a&&['id','company','title','date','version','stage','requirements'].every(k=>typeof a[k]==='string'&&a[k].length<=40000)&&stages.some(s=>s===a.stage));
}
