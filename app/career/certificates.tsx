const syllabus = 'https://ncre.neea.edu.cn/html1/report/2412/185-1.htm';

export const certificates = [
  { title: '初级会计专业技术资格', directions: ['finance'], reason: '想投会计助理，可以先翻初级会计实务的样题。看到一张报销单，你知道该记到哪个科目吗？', practice: '用一组模拟凭证完成入账、对账和月末汇总。', url: 'https://ausm.mof.gov.cn/' },
  { title: '计算机二级 · MS Office 高级应用与设计', directions: ['finance','hr','operations','supply','research','product'], reason: '如果招聘要求里写了 Excel，先试试下面这道题。已经能独立做周报的话，再看企业有没有单独要求证书。', practice: '把一份原始明细整理成能按月份和类别筛选的汇总表。', url: syllabus },
  { title: '计算机二级 · Python 语言程序设计', directions: ['data','algorithm','testing'], reason: '刚学 Python，可以拿往年题检查自己会不会读文件、写函数。想投数据分析，再试着处理一份有空行和错别字的表。', practice: '写一个可以重复运行的脚本，清洗一份数据并记录异常行。', url: syllabus },
  { title: '计算机二级 · CAD 设计与综合应用', directions: ['mechanical'], reason: '目标岗位涉及工程制图时，可以结合大纲练习绘图，先核对企业使用的软件。', practice: '完成一张零件图，标出尺寸、公差和修改记录。', url: syllabus },
  { title: '计算机三级 · 嵌入式系统开发技术', directions: ['embedded'], reason: '学过电路和程序设计、准备走嵌入式开发方向时，可用大纲盘点系统开发知识。', practice: '完成一次传感器采样，留下接线图、代码和调试记录。', url: syllabus }
];

export default function Certificates({direction}: {direction: string}) {
  const matches = certificates.filter(item => item.directions.includes(direction));
  return <section className="career-panel competition-directory" id="certificates">
    <div className="career-section-head"><div><h2>证书推荐</h2><p>这些考试可作参考。是否要求持证，看职位原文。</p></div></div>
    {matches.length === 0 && <p>这个方向还没收录证书。</p>}
    <div className="competition-grid">{matches.map(item => <article key={item.title}>
      <h3>{item.title}</h3><p>{item.reason}</p><p><b>配套练习：</b>{item.practice}</p>
      <a href={item.url} target="_blank" rel="noreferrer">查看官方考试信息 ↗</a>
    </article>)}</div>
  </section>;
}
