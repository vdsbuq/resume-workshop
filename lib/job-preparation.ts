import type {JobRecord} from './job-feed';

export type Availability = {city:string; days:string; months:string};
export const emptyAvailability:Availability = {city:'',days:'',months:''};
export function clauses(text:string) {
  return text.replace(/<[^>]+>/g,' ').split(/[，,；;。\n]+/).map(line=>line.trim()).filter(Boolean);
}
export function preference(line:string) {return /优先|加分|更佳|更好/.test(line);}
export function scheduleMatch(job:JobRecord, options:Availability) {
  const evidence:string[]=[];
  let unknown=false, conflict=false;
  if(options.city.trim()){
    evidence.push('地点：'+(job.city||'未注明'));
    if(!job.city||/不限|全国|远程/.test(job.city)) unknown=true;
    else if(!job.city.includes(options.city.trim().replace(/市$/,''))) conflict=true;
  }
  const lines=clauses(job.requirements+'\n'+job.duties);
  const units=[
    {value:options.days, pattern:/(?:每周|一周|每星期)[^\d]{0,12}(\d+)(?:[-~至到—]\d+)?天/},
    {value:options.months,pattern:/(?:实习|持续|至少|不少于|周期)[^\d]{0,12}(\d+)(?:[-~至到—]\d+)?个?月/}
  ];
  for(const {value,pattern} of units){
    if(!value)continue;
    let found=false;
    for(const line of lines){
      const normalized=line.replace(/\s/g,'').replace(/[一二三四五六七八九]/g,c=>String('一二三四五六七八九'.indexOf(c)+1)).replace(/1周/g,'一周');
      const match=pattern.exec(normalized);
      if(!match)continue;
      evidence.push(line);
      if(preference(line)||/以内|最多|不超过|以下|或/.test(line))continue;
      found=true;
      if(Number(value)<Number(match[1]))conflict=true;
    }
    if(!found)unknown=true;
  }
  return {status:conflict?'条件冲突':unknown?'需要确认':'条件合适',evidence:[...new Set(evidence)]};
}
