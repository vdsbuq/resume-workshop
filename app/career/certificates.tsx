const syllabus = 'https://ncre.neea.edu.cn/html1/report/2412/185-1.htm';

const certificates = [
  { title: '初级会计专业技术资格', directions: ['finance'], reason: '目标是核算、财务助理或会计实习时，可以用初级会计实务和经济法基础梳理知识。', practice: '用一组模拟凭证完成入账、对账和月末汇总。', url: 'https://ausm.mof.gov.cn/' },
  { title: '计算机二级 · MS Office 高级应用与设计', directions: ['finance','hr','operations','supply','research','product'], reason: '目标岗位经常整理台账、调查结果或运营周报时，可以用这个科目系统练习办公软件。', practice: '把一份原始明细整理成能按月份和类别筛选的汇总表。', url: syllabus },
  { title: '计算机二级 · Python 语言程序设计', directions: ['data','algorithm','testing'], reason: '如果还在打编程基础，可以用考试大纲检查函数、文件读写和数据处理能力。', practice: '写一个可以重复运行的脚本，清洗一份数据并记录异常行。', url: syllabus },
  { title: '计算机二级 · CAD 设计与综合应用', directions: ['mechanical'], reason: '目标岗位涉及工程制图时，可以结合大纲练习绘图，先核对企业使用的软件。', practice: '完成一张零件图，标出尺寸、公差和修改记录。', url: syllabus },
  { title: '计算机三级 · 嵌入式系统开发技术', directions: ['embedded'], reason: '学过电路和程序设计、准备走嵌入式开发方向时，可用大纲盘点系统开发知识。', practice: '完成一次传感器采样，留下接线图、代码和调试记录。', url: syllabus }
];

export default function Certificates({direction}: {direction: string}) {
  const matches = certificates.filter(item => item.directions.includes(direction));
  return <section className="career-panel competition-directory" id="certificates">
    <div className="career-section-head"><div><h2>证书推荐</h2><p>按当前岗位方向整理。先看目标企业是否点名要求，再决定要不要投入备考时间。</p></div></div>
    {matches.length === 0 && <p>这个方向暂未收录专项证书。可以先查看岗位原文，把时间留给企业明确要求的技能和作品。</p>}
    <div className="competition-grid">{matches.map(item => <article key={item.title}>
      <h3>{item.title}</h3><p>{item.reason}</p><p><b>配套练习：</b>{item.practice}</p>
      <a href={item.url} target="_blank" rel="noreferrer">查看官方考试信息 ↗</a>
    </article>)}</div>
  </section>;
}
