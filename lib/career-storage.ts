import {directions,majors} from './career-directions';
export const careerStorageKey='resume-workshop-career-v1';
export type CareerDraft={version:1;favorites?:string[];direction?:string;major?:string;step:number;company:string;jobId:string;material:string;states:Record<string,string>;completed:Record<string,boolean>;notes:Record<string,string>};
export function parseCareerDraft(v:unknown):CareerDraft{
 if(!v||typeof v!=='object')throw Error('无效备份');const d=v as Record<string,unknown>;
 if(d.version!==1||!Number.isInteger(d.step)||Number(d.step)<0||Number(d.step)>3)throw Error('版本或步骤无效');
 for(const k of ['company','jobId','material'])if(typeof d[k]!=='string'||(d[k] as string).length>(k==='material'?30000:300))throw Error('字段无效');
 function record(k:string,kind:'status'|'boolean'|'note'){const x=d[k];if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).length>100)throw Error('记录无效');const result:Record<string,any>={};for(const [key,val] of Object.entries(x)){if(key.length>100||['__proto__','constructor','prototype'].includes(key))throw Error('键无效');if(kind==='boolean'?typeof val!=='boolean':kind==='status'?!['','已有实践','学过待实践','需要学习'].includes(String(val)):typeof val!=='string'||val.length>5000)throw Error('值无效');result[key]=val;}return result;}
 if(d.direction!==undefined&&!directions.some(x=>x.id===d.direction))throw Error('岗位方向无效');
 if(d.major!==undefined&&!majors.includes(String(d.major)))throw Error('专业无效');
 const favorites=d.favorites;
 if(favorites!==undefined && (!Array.isArray(favorites)||favorites.length>1000||favorites.some(id=>typeof id!=='string'||!id||id.length>300)))throw Error('收藏数据无效');
 return {...(Array.isArray(favorites)?{favorites:[...new Set<string>(favorites)]}:{}),...(d.direction!==undefined?{direction:d.direction as string}:{}),...(d.major!==undefined?{major:d.major as string}:{}),version:1,step:Number(d.step),company:d.company as string,jobId:d.jobId as string,material:d.material as string,states:record('states','status'),completed:record('completed','boolean'),notes:record('notes','note')};
}
