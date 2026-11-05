"use client";

import { Target, ChevronDown, Sparkles, FileSearch, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Resume } from "@/lib/resume";

export default function JobAnalysis({ resume }: { resume: Resume }) {
  const [job, setJob] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ text: string; snapshot: string } | null>(null);
  // Contact details are unnecessary for evidence comparison.
  const material = JSON.stringify({ role: resume.personal.role, summary: resume.personal.summary, education: resume.education, projects: resume.projects, experience: resume.experience, skills: resume.skills });
  const snapshot = JSON.stringify([job, material]);
  async function analyze() {
    if (busy) return;
    const text = JSON.stringify({ jobDescription: job, resume: JSON.parse(material) });
    if (!job.trim() || !password.trim()) { setError("请填写岗位描述和演示口令。"); return; }
    if (text.length > 16000) { setError("材料过长，请精简岗位描述或简历经历后重试。"); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/polish", { method: "POST", headers: { "Content-Type": "application/json", "x-demo-password": password }, body: JSON.stringify({ action: "analyze", text }), signal: AbortSignal.timeout(50000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "分析失败，请重试。");
      setResult({ text: data.suggestion, snapshot });
    } catch (err) { setError(err instanceof Error && err.name === "TimeoutError" ? "分析超时，请稍后重试。" : err instanceof Error ? err.message : "连接失败，请重试。"); }
    finally { setBusy(false); }
  }
  return <details className="job-analysis">
    <summary><span className="analysis-icon"><Target size={22} /></span><span className="analysis-title">岗位分析与求职决策<small>从岗位要求出发，找到经历中的竞争力</small></span><span className="analysis-tag">AI 辅助分析</span><ChevronDown className="analysis-chevron" size={18} /></summary>
    <div className="analysis-content"><div className="analysis-steps"><span><b>01</b> 输入目标岗位</span><ArrowRight size={14} /><span><b>02</b> 对照简历证据</span><ArrowRight size={14} /><span><b>03</b> 明确准备方向</span></div>
    <p>粘贴目标岗位描述，与当前简历逐项对照。“未体现”不代表你不会；建议需要你核实，不代表招聘结论。</p>
    <div className="analysis-grid"><div><label className="field"><span>目标岗位描述（最多 6,000 字）</span><textarea rows={6} maxLength={6000} value={job} onChange={e => setJob(e.target.value)} placeholder="粘贴岗位职责、技能要求等信息" /></label>
    <button className="button" disabled={busy} onClick={() => setJob("【虚构演示岗位】数据分析实习生：使用 Excel 整理业务数据，使用 SQL 查询数据库，制作可视化图表，与业务团队沟通分析结果。有问卷分析或课程项目经验优先。")}><FileSearch size={15} /> 试用示例岗位</button></div><div className="analysis-settings">
    <label className="field"><span>AI 演示口令</span><input type="password" autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} /></label>
    <p className="analysis-privacy"><ShieldCheck size={16} /> 点击后将把岗位描述和当前简历的经历、技能发送至 DeepSeek；不发送姓名、电话、邮箱等联系字段。经历正文请自行检查隐私。</p>
    <button className="button primary" disabled={busy} onClick={analyze}><Sparkles size={16} />{busy ? "正在分析，请稍候…" : "开始岗位分析"}</button></div></div>
    {error && <p className="analysis-alert" role="alert">{error}</p>}
    {result && <section aria-live="polite"><h3>岗位对照与行动建议</h3>{result.snapshot !== snapshot && <p className="analysis-alert" role="status">岗位或简历已修改，下方为旧材料的分析，请重新分析。</p>}<p className="analysis-report">{result.text}</p><small>AI 分析供参考。请核对引用证据，确认已有经历后再修改简历。</small></section>}
  </div></details>;
}
