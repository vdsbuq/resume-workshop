export type JobRecord={id:string;title:string;company:string;city:string;published:string;requirements:string;duties:string;url:string;collectedAt:string;source?:string;availability?:string;lastVerifiedAt?:string;lastAttemptAt?:string;syncStatus?:string;contentChangedAt?:string};
export type JobFeed={generatedAt:string;jobs:JobRecord[];errors:unknown[];lastRunAt?:string;lastFullSuccessAt?:string|null;intervalHours?:number};
export function parseJobFeed(v:unknown):JobFeed{
 if(!v||typeof v!=='object')throw Error('Invalid feed');const d=v as JobFeed;
 if(typeof d.generatedAt!=='string'||!Number.isFinite(Date.parse(d.generatedAt))||!Array.isArray(d.jobs)||d.jobs.length>1000||!Array.isArray(d.errors))throw Error('Invalid feed');
 const ids=new Set<string>();for(const j of d.jobs){for(const k of ['id','title','company','city','published','requirements','duties','url','collectedAt'] as const)if(typeof j[k]!=='string'||j[k].length>40000)throw Error('Invalid job');if(ids.has(j.id))throw Error('Duplicate job');ids.add(j.id);const u=new URL(j.url);if(u.protocol!=='https:'||!['talent.baidu.com','www.nowcoder.com'].includes(u.hostname))throw Error('Invalid source');}
 return d;
}
export function usableJob(j:JobRecord){return !['closed','unavailable'].includes(j.availability||'');}
