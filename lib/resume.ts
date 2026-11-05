import { samplePhoto } from "./sample-photo";
export const templates = {
  classic: { name: "经典单栏", description: "蓝色分隔，清晰稳重" },
  sidebar: { name: "简洁双栏", description: "技能侧栏，突出信息层次" },
  academic: { name: "学术黑白", description: "居中抬头，适合学术与正式申请" },
  modern: { name: "现代简约", description: "留白与细线，突出项目经历" },
  elegant: { name: "雅致商务", description: "衬线标题，沉稳而有辨识度" },
} as const;
export type TemplateKey = keyof typeof templates;

export type SectionKey = "education" | "projects" | "experience";
export type Entry = {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  description: string;
};
export type Resume = {
  version: 1;
  photo?: string;
  template: TemplateKey;
  personal: {
    name: string;
    role: string;
    phone: string;
    email: string;
    city: string;
    link: string;
    summary: string;
    age?: string;
    hometown?: string;
    politicalStatus?: string;
    graduation?: string;
  };
  education: Entry[];
  projects: Entry[];
  experience: Entry[];
  skills: string;
};
export const sectionNames: Record<SectionKey, string> = {
  education: "教育背景",
  projects: "项目与竞赛",
  experience: "实习与社团",
};
export const storageKey = "resume-workshop-v1";
export function emptyResume(): Resume {
  return {
    version: 1,
    template: "classic",
    personal: {
      name: "",
      role: "",
      phone: "",
      email: "",
      city: "",
      link: "",
      summary: "",
    },
    education: [],
    projects: [],
    experience: [],
    skills: "",
  };
}
export function sampleResume(): Resume {
  return {
    ...emptyResume(),
    photo: samplePhoto,
    personal: {
      name: "林知夏",
      role: "数据分析实习生",
      phone: "138 0000 0000",
      email: "zhixia@example.com",
      city: "上海",
      graduation: "2027 年 6 月",
      link: "github.com/example",
      summary:
        "信息管理与信息系统专业在读，具备 SQL 查询、Python 数据清洗及 Excel 可视化经验。参与调研分析与经营看板项目，能够从业务问题出发整理指标、分析差异并清晰汇报。",
    },
    education: [
      {
        id: "edu-1",
        title: "明川大学（虚构示例）",
        subtitle: "信息管理与信息系统 · 本科",
        period: "2023.09 — 2027.06",
        description:
          "主修课程：统计学、数据库原理、管理信息系统、Python 数据分析\n专业成绩：GPA 3.7 / 4.0；获校级学业奖学金",
      },
    ],
    projects: [
      {
        id: "project-1",
        title: "校园消费行为分析",
        subtitle: "课程项目 · 数据分析负责人",
        period: "2026.03 — 2026.06",
        description:
          "整理并清洗 320 份校园消费问卷，统一缺失值和异常值处理规则。\n使用 Python 与 Excel 分析消费结构，制作可视化图表，呈现不同年级的消费差异。\n与 4 名组员合作撰写研究报告，提出校园服务优化建议。",
      },
      {
        id: "project-2",
        title: "全国大学生市场调查与分析大赛",
        subtitle: "团队成员 · 调研与展示",
        period: "2025.11 — 2026.04",
        description:
          "参与设计 18 道问卷题目，整理访谈记录，按消费频次与预算划分用户画像。\n对比不同群体的渠道偏好，制作交叉分析图表，形成校园服务改进建议。\n负责答辩材料与图表呈现，团队获校赛二等奖（虚构演示经历）。",
      },
    ],
    experience: [
      {
        id: "intern-1",
        title: "星禾零售科技（虚构企业）",
        subtitle: "运营分析实习生 · 经营支持组",
        period: "2026.07 — 2026.09",
        description: "使用 SQL 汇总 3 家门店的订单与商品数据，核对销售额、客单价及退款率的统计口径。\n搭建 Excel 周报，按门店、品类和活动拆解销售变化，输出 8 期经营分析简报。\n排查重复订单与缺失商品编码，维护异常记录，与运营同事核实后更新数据。",
      },
      {
        id: "exp-1",
        title: "校青年志愿者协会",
        subtitle: "项目部干事",
        period: "2024.09 — 2025.06",
        description:
          "协助组织 6 场校园志愿活动，维护报名、签到与工时台账，协调现场分工。\n整理参与反馈并编写复盘纪要，将常见问题汇总为后续活动检查清单。",
      },
    ],
    skills:
      "数据处理：SQL 多表连接与分组聚合；Python / Pandas 清洗与汇总\n分析展示：Excel 数据透视表、常用函数；Matplotlib 图表；PowerPoint 汇报\n业务方法：指标口径整理、问卷分析、用户分组、经营周报\n语言证书：大学英语六级（CET-6）、普通话二级甲等",
  };
}
const isText = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 20000;
export function parseResume(value: unknown): Resume {
  if (!value || typeof value !== "object")
    throw new Error("不是有效的简历备份");
  const r = value as Resume;
  if (
    r.version !== 1 ||
    !Object.hasOwn(templates, r.template) ||
    !r.personal ||
    !isText(r.skills)
  )
    throw new Error("备份格式或版本不支持");
  for (const key of Object.keys(
    emptyResume().personal,
  ) as (keyof Resume["personal"])[])
    if (!isText(r.personal[key])) throw new Error("个人信息格式不正确");
  if (r.photo !== undefined && (typeof r.photo !== "string" || r.photo.length > 500000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(r.photo)))
    throw new Error("照片格式不正确或过大");
  const optionalPersonal: Partial<Resume["personal"]> = {};
  for (const key of ["age", "hometown", "politicalStatus", "graduation"] as const) {
    const field = r.personal[key];
    if (field !== undefined) {
      if (typeof field !== "string" || field.length > 500) throw new Error("选填个人信息格式不正确");
      if (field.trim()) optionalPersonal[key] = field;
    }
  }
  const ids = new Set<string>();
  for (const section of [
    "education",
    "projects",
    "experience",
  ] as SectionKey[]) {
    if (!Array.isArray(r[section]) || r[section].length > 50)
      throw new Error("经历列表格式不正确或条目过多");
    for (const entry of r[section]) {
      if (
        !entry ||
        !["id", "title", "subtitle", "period", "description"].every((k) =>
          isText(entry[k as keyof Entry]),
        ) ||
        !entry.id ||
        ids.has(entry.id)
      )
        throw new Error("经历内容格式不正确或编号重复");
      ids.add(entry.id);
    }
  }
  return {
    version: 1,
    template: r.template,
    ...(r.photo ? { photo: r.photo } : {}),
    personal: { ...optionalPersonal, ...Object.fromEntries(
      Object.keys(emptyResume().personal).map((k) => [
        k,
        r.personal[k as keyof Resume["personal"]],
      ]),
    ) } as Resume["personal"],
    education: r.education.map(cleanEntry),
    projects: r.projects.map(cleanEntry),
    experience: r.experience.map(cleanEntry),
    skills: r.skills,
  };
}
function cleanEntry(e: Entry): Entry {
  return {
    id: e.id,
    title: e.title,
    subtitle: e.subtitle,
    period: e.period,
    description: e.description,
  };
}
