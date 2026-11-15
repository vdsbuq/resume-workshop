export type Competition={id:string;title:string;directions:string[];url:string;description:string;preparation:string;eligibility:string;checkedAt:string;status:'window'|'closed'|'reference';start?:string;end?:string;timing:string};
export const competitions:Competition[]=[
 {id:'lanqiao-code',title:'蓝桥杯软件赛与电子赛',directions:['frontend','backend','algorithm','embedded','testing','data'],url:'https://dasai.lanqiao.cn/pages/v7/dasai/competition/individual_competition.html',description:'包含编程、Web、测试及嵌入式等科目，按自己的基础选择具体赛项。',preparation:'先做对应科目历年练习，整理代码、错题和测试记录。',eligibility:'全日制在校生，组别及学校报名流程以官方规则为准；官网列明报名费300元/人。',checkedAt:'2026-11-15',status:'window',start:'2026-10-08T10:00:00+08:00',end:'2026-12-18T14:00:00+08:00',timing:'官方报名窗口：2026/10/08 10:00—12/18 14:00（北京时间）；校内截止可能提前。'},
 {id:'lanqiao-design',title:'蓝桥杯视觉艺术设计赛',directions:['design','operations','product'],url:'https://design.lanqiao.cn/home',description:'面向视觉艺术设计作品，具体命题、类别与规格查看本届规则。',preparation:'整理创意说明、设计过程和原创作品，核对素材授权。',eligibility:'在校全日制学生；团队及专业条件按具体赛项核实，费用见官方。',checkedAt:'2026-11-15',status:'reference',timing:'已核对官方入口，具体赛项截止时间需再次核实。'},
 {id:'rm',title:'RoboMaster 2027 高校系列赛',directions:['mechanical','embedded','algorithm'],url:'https://www.robomaster.com/zh-CN/resource/announcement/competition',description:'围绕机器人开展机械、电控与算法协作，适合了解校队的实际技术分工。',preparation:'先联系本校队伍，整理仿真、控制或视觉方面的作品。',eligibility:'以高校队伍规则为准，通常涉及设备及团队投入。',checkedAt:'2026-11-15',status:'reference',timing:'官网已发布2027赛季报名名单；不标记为仍可报名，请核实具体赛项。'},
 {id:'mcm',title:'全国大学生数学建模竞赛',directions:['data','algorithm','finance','supply','research'],url:'https://www.mcm.edu.cn/',description:'通过实际问题练习建模、数据分析、验证和论文表达。',preparation:'选一道往年题，保存数据处理、模型假设、代码与报告。',eligibility:'参赛资格、组队及校内选拔以当届通知为准。',checkedAt:'2026-11-15',status:'closed',timing:'2026届已进入评奖阶段；当前用于往年题练习，等待下一届通知。'},
 {id:'ada',title:'全国大学生广告艺术大赛',directions:['design','operations','product'],url:'https://www.sun-ada.net/home/about_intrs2.html',description:'官方指南列出平面、视频、策划、文案与UI等作品类别。',preparation:'选择官方命题，制作原创作品并记录受众、创意和迭代过程。',eligibility:'全日制在校大学生、研究生等，具体类别和提交方式查阅指南。',checkedAt:'2026-11-15',status:'reference',timing:'当前核对的是第18届指南，不代表当前可报名。'},
 {id:'market',title:'全国大学生市场调查与分析大赛',directions:['research','data','operations','hr','finance'],url:'https://www.hbfs.edu.cn/xxglx/ba/7b/c6832a375419/pagem.htm',description:'高校发布的第17届通知，可了解市场调查、分析报告与团队展示要求。',preparation:'练习调查设计、匿名反馈整理和样本局限说明。',eligibility:'按本科、研究生等组别及所在学校安排核实；来源为高校通知。',checkedAt:'2026-11-15',status:'reference',timing:'不同组别和学校截止时间不同，未统一标注为可报名。'},
 {id:'tianchi-paper',title:'天池：学术前沿趋势分析',directions:['data','research'],url:'https://tianchi.aliyun.com/competition/entrance/531866/introduction',description:'历史学习赛参考，可练习资料清洗和趋势表达。',preparation:'整理可复现分析脚本和图表说明。',eligibility:'数据获取及账号要求见平台；不代表当前开放报名。',checkedAt:'2026-11-14',status:'reference',timing:'学习参考，未核实当前赛期。'},
 {id:'tianchi-car',title:'天池：二手车交易价格预测',directions:['data','algorithm'],url:'https://tianchi.aliyun.com/competition/entrance/231784/introduction',description:'历史学习赛参考，用于练习预测模型和验证方法。',preparation:'先完成数据清洗与简单基线，防止测试数据泄漏。',eligibility:'平台账号、数据许可与当前赛期需到官方确认。',checkedAt:'2026-11-14',status:'reference',timing:'学习参考，未核实当前赛期。'}
];
export function competitionStatus(c:Competition,now:number){
 if(c.status==='closed')return '本届已结束';
 if(c.status!=='window'||!c.start||!c.end)return '赛期需核实 / 学习参考';
 if(now<Date.parse(c.start))return '尚未开始';
 return now<Date.parse(c.end)?'官方报名窗口内':'报名已截止';
}
