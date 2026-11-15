import {skillRules} from './career';
export const projectSkills:Record<string,string[]>={
 data:['SQL','Excel','Python','可视化'],frontend:['前端开发','视觉与交互设计'],operations:['内容策划','用户研究'],product:['产品分析','用户研究'],research:['用户研究','可视化'],testing:['测试评估','Python'],finance:['财务核对','Excel'],hr:['招聘与人才管理','用户研究'],legal:['法律检索','沟通协作'],mechanical:['机械与控制','Python'],embedded:['嵌入式开发','测试评估'],design:['视觉与交互设计','用户研究'],supply:['供应链管理','Excel'],backend:['后端开发','SQL'],algorithm:['算法基础','Python']
};
export function recommendedProjects(direction:string){return (projectSkills[direction]||[]).map(name=>skillRules.find(s=>s.name===name)!).filter(Boolean);}
