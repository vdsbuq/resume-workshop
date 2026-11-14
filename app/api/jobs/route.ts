import snapshot from '@/data/jobs.json';
import {parseJobFeed} from '@/lib/job-feed';
export const dynamic='force-dynamic';
export async function GET(){
 if(process.env.NODE_ENV==='development')return Response.json({...snapshot,delivery:'local'},{headers:{'Cache-Control':'no-store'}});
 try{
  const r=await fetch('https://raw.githubusercontent.com/vdsbuq/resume-workshop/main/data/jobs.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw Error('Feed unavailable');const text=await r.text();if(text.length>4000000)throw Error('Feed too large');const feed=parseJobFeed(JSON.parse(text));
  return Response.json({...feed,delivery:'remote'},{headers:{'Cache-Control':'public, max-age=60, s-maxage=300'}});
 }catch{return Response.json({...snapshot,delivery:'fallback',warning:'更新源暂时不可用，当前展示随版本保存的快照。'},{headers:{'Cache-Control':'no-store'}});}
}
