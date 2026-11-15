import directions from '@/data/career-directions.json';
export {directions};
export const majors=['未选择 / 跨专业探索','计算机科学与技术','软件工程','数据科学与大数据技术','统计学','数学与应用数学','信息管理与信息系统','经济学','金融学','工商管理','市场营销','电子商务','新闻传播','心理学','社会学','设计学','会计学','财务管理','人力资源管理','法学','机械工程','自动化','电子信息工程','物流管理','供应链管理','其他专业'];
export function classifyDirection(title:string){return directions.find(d=>d.keywords.some(k=>title.includes(k)))?.id||'';}
export function directionLabel(id:string){return directions.find(d=>d.id===id)?.label||'数据分析实习';}
