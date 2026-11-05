"use client";

import JobAnalysis from "./job-analysis";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  LayoutTemplate,
  LoaderCircle,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  X,
  BriefcaseBusiness,
  FolderKanban,
  BadgeCheck,
  Eye,
  PenLine,
} from "lucide-react";
import {
  emptyResume,
  sampleResume,
  parseResume,
  sectionNames,
  storageKey,
  type Entry,
  type Resume,
  type SectionKey,
} from "@/lib/resume";

type Tab = "personal" | SectionKey | "skills";
type AIState = {
  section: SectionKey;
  id: string;
  original: string;
  action: "polish" | "shorten" | "suggest";
  suggestion: string;
};
const tabs = [
  { key: "personal", title: "基本信息", icon: UserRound },
  { key: "education", title: "教育背景", icon: GraduationCap },
  { key: "projects", title: "项目与竞赛", icon: FolderKanban },
  { key: "experience", title: "实习与社团", icon: BriefcaseBusiness },
  { key: "skills", title: "技能与证书", icon: BadgeCheck },
] as const;
const actionNames = {
  polish: "润色表达",
  shorten: "精简字数",
  suggest: "提示补充信息",
};

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <label className={"field" + (multiline ? " field-wide" : "")}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          maxLength={20000}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          maxLength={500}
        />
      )}
    </label>
  );
}

function ResumePreview({ resume }: { resume: Resume }) {
  const p = resume.personal;
  const sections = (
    ["education", "projects", "experience"] as SectionKey[]
  ).map((key) => {
    const entries = resume[key].filter(
      (e) =>
        e.title.trim() ||
        e.subtitle.trim() ||
        e.description.trim() ||
        e.period.trim(),
    );
    return entries.length > 0 ? (
      <section className={"resume-section section-" + key} key={key}>
        <h2>{sectionNames[key]}</h2>
        {entries.map((e) => (
          <article className="resume-entry" key={e.id}>
            <div className="entry-heading">
              <h3>{e.title}</h3>
              <span>{e.period}</span>
            </div>
            {e.subtitle && <p className="entry-subtitle">{e.subtitle}</p>}
            {e.description.trim() && (
              <ul>
                {e.description
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, i) => (
                    <li key={i}>{line.replace(/^[-•]\s*/, "")}</li>
                  ))}
              </ul>
            )}
          </article>
        ))}
      </section>
    ) : null;
  });
  return (
    <div className={"resume-sheet " + resume.template} id="resume-document">
      <header className="resume-header">
        <h1>{p.name || "你的姓名"}</h1>
        {p.role && <p className="resume-role">{p.role}</p>}
        <div className="resume-contact">
          {[p.phone, p.email, p.city, p.link].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </header>
      <div className="resume-body">
        <div className="resume-main">
          {p.summary.trim() && (
            <section className="resume-section">
              <h2>个人简介</h2>
              <p className="summary-text">{p.summary}</p>
            </section>
          )}
          {sections}
        </div>
        {resume.skills.trim() && (
          <section className="resume-section resume-skills">
            <h2>技能与证书</h2>
            {resume.skills
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <p key={i}>{line}</p>
              ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [resume, setResume] = useState<Resume>(sampleResume);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState("正在读取");
  const [active, setActive] = useState<Tab>("personal");
  const [mobile, setMobile] = useState<"edit" | "preview">("edit");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<
    "templates" | "clear" | "sample" | "import" | null
  >(null);
  const [pendingImport, setPendingImport] = useState<Resume | null>(null);
  const [ai, setAI] = useState<AIState | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiError, setAIError] = useState("");
  const [undo, setUndo] = useState<{
    section: SectionKey;
    id: string;
    before: string;
    after: string;
  } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const lastRequest = useRef(0);
  const importInput = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resumeRef = useRef(resume);
  resumeRef.current = resume;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setResume(parseResume(JSON.parse(saved)));
    } catch {
      setNotice("无法读取本地记录。已加载示例；如需恢复，请导入之前的备份。");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    setSaveStatus("保存中…");
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(resume));
        setSaveStatus("已保存到此浏览器");
      } catch {
        setSaveStatus("保存失败，请下载备份");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [resume, ready]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 6500);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    if (!cooldown) return;
    const id = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);
  useEffect(() => {
    if (modal || ai) {
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
    } else dialogRef.current?.close();
  }, [modal, ai]);

  function patchPersonal(key: keyof Resume["personal"], value: string) {
    setResume((r) => ({ ...r, personal: { ...r.personal, [key]: value } }));
  }
  function patchEntry(
    section: SectionKey,
    id: string,
    key: keyof Entry,
    value: string,
  ) {
    setResume((r) => ({
      ...r,
      [section]: r[section].map((e) =>
        e.id === id ? { ...e, [key]: value } : e,
      ),
    }));
  }
  function move(section: SectionKey, index: number, delta: number) {
    setResume((r) => {
      const entries = [...r[section]];
      [entries[index], entries[index + delta]] = [
        entries[index + delta],
        entries[index],
      ];
      return { ...r, [section]: entries };
    });
  }
  function backup() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "简历工坊-备份.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("备份已下载，可在其他设备上导入。");
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 1000000) throw new Error("备份文件不能超过 1 MB");
      const parsed = parseResume(JSON.parse(await file.text()));
      setPendingImport(parsed);
      setModal("import");
    } catch (e) {
      setNotice("导入失败：" + (e instanceof Error ? e.message : "文件无效"));
    }
    if (importInput.current) importInput.current.value = "";
  }
  function openAI(section: SectionKey, entry: Entry) {
    setAI({
      section,
      id: entry.id,
      original: entry.description,
      action: "polish",
      suggestion: "",
    });
    setAIError("");
  }
  async function requestAI() {
    if (!ai || busy) return;
    if (Date.now() - lastRequest.current < 10000) {
      setAIError("请稍等片刻再试，每次调用间隔至少 10 秒。");
      return;
    }
    if (!password.trim()) {
      setAIError("请输入演示口令。");
      return;
    }
    setBusy(true);
    setAIError("");
    lastRequest.current = Date.now();
    setCooldown(10);
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-demo-password": password,
        },
        body: JSON.stringify({ action: ai.action, text: ai.original }),
        signal: AbortSignal.timeout(50000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "请求失败，请重试");
      setAI((current) =>
        current ? { ...current, suggestion: data.suggestion } : null,
      );
    } catch (e) {
      setAIError(
        e instanceof Error && e.name === "TimeoutError"
          ? "响应超时，请稍后重试。"
          : e instanceof Error
            ? e.message
            : "无法连接 AI 服务。",
      );
    } finally {
      setBusy(false);
    }
  }
  function acceptAI() {
    if (!ai?.suggestion || ai.action === "suggest") return;
    const current = resumeRef.current[ai.section].find((e) => e.id === ai.id);
    if (!current || current.description !== ai.original) {
      setAIError("这段经历已发生变化。请保留当前内容，关闭后重新发起润色。");
      return;
    }
    patchEntry(ai.section, ai.id, "description", ai.suggestion);
    setUndo({
      section: ai.section,
      id: ai.id,
      before: ai.original,
      after: ai.suggestion,
    });
    setAI(null);
    setNotice("已采纳建议，请核对事实。可以撤销最近一次采纳。");
  }
  function undoAI() {
    if (!undo) return;
    const current = resume[undo.section].find((e) => e.id === undo.id);
    if (current?.description !== undo.after) {
      setNotice("内容已被继续修改，为避免覆盖，本次不撤销。");
      return;
    }
    patchEntry(undo.section, undo.id, "description", undo.before);
    setUndo(null);
    setNotice("已恢复原文。");
  }
  const progress = [
    !!resume.personal.name.trim(),
    resume.education.some((e) => e.title.trim()),
    resume.projects.some((e) => e.title.trim()),
    resume.experience.some((e) => e.title.trim()),
    !!resume.skills.trim(),
  ].filter(Boolean).length;

  return (
    <>
      <div className="app-shell">
        <header className="topbar">
          <a href="/" className="brand">
            <span className="brand-icon">
              <FileText size={22} />
            </span>
            <span>
              简历工坊<small>RESUME WORKSHOP</small>
            </span>
          </a>
          <div className="topbar-right">
            <span className="local-badge">
              <ShieldCheck size={14} /> 本地保存 · 隐私优先
            </span>
            <button className="button primary" onClick={() => window.print()}>
              <Download size={16} /> 导出 PDF
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">让每一段经历，都被看见</div>
              <h1>
                把经历，写成机会<span>.</span>
              </h1>
              <p>读懂岗位要求，梳理经历证据，制定求职准备计划。</p>
            </div>
            <div className="heading-note">
              <span className="tiny-spark">
                <Sparkles size={19} />
              </span>
              <div>
                你的经历，值得更好的表达
                <small>真实内容 × 清晰排版 × AI 灵感</small>
              </div>
            </div>
          </div>
          <JobAnalysis resume={resume} />
          <div className="workspace-toolbar">
            <div className="document-name">
              <FileText size={17} />
              <strong>我的简历</strong>
              <span className="save-status">
                <span className="status-dot" />
                {saveStatus}
              </span>
            </div>
            <div className="toolbar-actions">
              <button onClick={() => setModal("sample")}>加载示例</button>
              <span className="divider" />
              <button onClick={backup}>
                <Download size={14} />
                下载备份
              </button>
              <button onClick={() => importInput.current?.click()}>
                <Upload size={14} />
                导入
              </button>
              <button
                title="清空简历"
                aria-label="清空简历"
                onClick={() => setModal("clear")}
              >
                <Trash2 size={15} />
              </button>
              <input
                type="file"
                accept=".json,application/json"
                hidden
                ref={importInput}
                onChange={(e) => importFile(e.target.files?.[0])}
              />
            </div>
          </div>
          <div className="mobile-switch">
            <button
              className={mobile === "edit" ? "selected" : ""}
              onClick={() => setMobile("edit")}
            >
              <PenLine size={16} /> 编辑内容
            </button>
            <button
              className={mobile === "preview" ? "selected" : ""}
              onClick={() => setMobile("preview")}
            >
              <Eye size={16} /> 实时预览
            </button>
          </div>
          <div className={"workspace mobile-" + mobile}>
            <section className="editor-panel" aria-label="简历编辑">
              <div className="editor-intro">
                <div>
                  <span className="step-label">YOUR STORY</span>
                  <h2>完善你的经历</h2>
                </div>
                <span className="progress-label">{progress} / 5 个模块</span>
              </div>
              <div className="progress-track">
                <span style={{ width: progress * 20 + "%" }} />
              </div>
              <nav className="section-tabs" aria-label="编辑模块">
                {tabs.map(({ key, title, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActive(key)}
                    className={active === key ? "active" : ""}
                    aria-selected={active === key}
                  >
                    <Icon size={17} />
                    <span>{title}</span>
                  </button>
                ))}
              </nav>
              <div className="editor-content">
                {active === "personal" ? (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>基本信息</h3>
                        <p>一个好的开始，让对方记住你。</p>
                      </div>
                      <UserRound size={23} />
                    </div>
                    <div className="fields-grid">
                      <Field
                        label="姓名"
                        value={resume.personal.name}
                        placeholder="你的姓名"
                        onChange={(v) => patchPersonal("name", v)}
                      />
                      <Field
                        label="求职意向"
                        value={resume.personal.role}
                        placeholder="例如：数据分析实习生"
                        onChange={(v) => patchPersonal("role", v)}
                      />
                      <Field
                        label="联系电话"
                        value={resume.personal.phone}
                        placeholder="便于联系的手机号码"
                        onChange={(v) => patchPersonal("phone", v)}
                      />
                      <Field
                        label="电子邮箱"
                        value={resume.personal.email}
                        placeholder="you@example.com"
                        onChange={(v) => patchPersonal("email", v)}
                      />
                      <Field
                        label="所在城市"
                        value={resume.personal.city}
                        placeholder="例如：上海"
                        onChange={(v) => patchPersonal("city", v)}
                      />
                      <Field
                        label="个人链接（选填）"
                        value={resume.personal.link}
                        placeholder="GitHub / 作品集地址"
                        onChange={(v) => patchPersonal("link", v)}
                      />
                      <Field
                        label="个人简介（选填）"
                        multiline
                        value={resume.personal.summary}
                        placeholder="用两三句话介绍你的背景、优势和求职方向。"
                        onChange={(v) => patchPersonal("summary", v)}
                      />
                    </div>
                    <div className="writing-tip">
                      <span>✦</span>
                      <div>
                        <strong>小提示：让信息恰到好处</strong>
                        <p>
                          突出与你的目标岗位相关的经历。无需填写身份证号、家庭住址等敏感信息。
                        </p>
                      </div>
                    </div>
                    <button
                      className="button next-button"
                      onClick={() => setActive("education")}
                    >
                      下一步：教育背景 <ChevronRight size={16} />
                    </button>
                  </>
                ) : active === "skills" ? (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>技能与证书</h3>
                        <p>写下你真正掌握的能力，每行一个类别。</p>
                      </div>
                      <BadgeCheck size={23} />
                    </div>
                    <Field
                      label="专业技能、语言与证书"
                      multiline
                      value={resume.skills}
                      onChange={(v) => setResume((r) => ({ ...r, skills: v }))}
                      placeholder={
                        "数据工具：Excel、Python、SQL\n语言证书：大学英语六级"
                      }
                    />
                    <div className="writing-tip">
                      <span>✦</span>
                      <div>
                        <strong>具体，比堆砌更有说服力</strong>
                        <p>
                          只写你能在面试中讲清楚的技能，把最相关的能力放在前面。
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="section-heading">
                      <div>
                        <h3>{sectionNames[active]}</h3>
                        <p>
                          {active === "education"
                            ? "从最近一段教育经历开始。"
                            : "描述你的行动与结果，用事实展现价值。"}
                        </p>
                      </div>
                      {active === "education" ? (
                        <GraduationCap size={23} />
                      ) : (
                        <FolderKanban size={23} />
                      )}
                    </div>
                    {resume[active].map((entry, index) => (
                      <article className="entry-editor" key={entry.id}>
                        <div className="entry-controls">
                          <span>经历 {String(index + 1).padStart(2, "0")}</span>
                          <div>
                            <button
                              aria-label={`上移经历 ${index + 1}`}
                              disabled={index === 0}
                              onClick={() => move(active, index, -1)}
                            >
                              <ArrowUp size={15} />
                            </button>
                            <button
                              aria-label={`下移经历 ${index + 1}`}
                              disabled={index === resume[active].length - 1}
                              onClick={() => move(active, index, 1)}
                            >
                              <ArrowDown size={15} />
                            </button>
                            <button
                              aria-label={`删除经历 ${index + 1}`}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "删除这条经历？此操作不可撤销。",
                                  )
                                )
                                  setResume((r) => ({
                                    ...r,
                                    [active]: r[active].filter(
                                      (e) => e.id !== entry.id,
                                    ),
                                  }));
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <div className="fields-grid">
                          <Field
                            label={
                              active === "education"
                                ? "学校名称"
                                : "项目 / 组织名称"
                            }
                            value={entry.title}
                            onChange={(v) =>
                              patchEntry(active, entry.id, "title", v)
                            }
                          />
                          <Field
                            label="时间段"
                            value={entry.period}
                            placeholder="2025.09 — 至今"
                            onChange={(v) =>
                              patchEntry(active, entry.id, "period", v)
                            }
                          />
                          <div className="field-wide">
                            <Field
                              label={
                                active === "education"
                                  ? "专业与学历"
                                  : "担任角色"
                              }
                              value={entry.subtitle}
                              onChange={(v) =>
                                patchEntry(active, entry.id, "subtitle", v)
                              }
                            />
                          </div>
                          <Field
                            multiline
                            label="经历描述（每行一个要点）"
                            value={entry.description}
                            onChange={(v) =>
                              patchEntry(active, entry.id, "description", v)
                            }
                            placeholder="做了什么？使用什么方法？取得什么结果？"
                          />
                        </div>
                        <button
                          className="ai-entry-button"
                          disabled={!entry.description.trim()}
                          onClick={() => openAI(active, entry)}
                        >
                          <Sparkles size={14} /> AI 帮我写得更好{" "}
                          <ArrowUpRight size={13} />
                        </button>
                      </article>
                    ))}
                    <button
                      className="add-entry"
                      disabled={resume[active].length >= 50}
                      onClick={() =>
                        setResume((r) => ({
                          ...r,
                          [active]: [
                            ...r[active],
                            {
                              id: crypto.randomUUID(),
                              title: "",
                              subtitle: "",
                              period: "",
                              description: "",
                            },
                          ],
                        }))
                      }
                    >
                      <Plus size={17} /> 添加{sectionNames[active]}经历
                    </button>
                    {undo && (
                      <button className="undo-button" onClick={undoAI}>
                        <RotateCcw size={14} /> 撤销最近一次 AI 采纳
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="editor-bottom">
                <ShieldCheck size={14} />{" "}
                简历仅保存在当前浏览器，建议定期下载备份。
              </div>
            </section>
            <section className="preview-panel" aria-label="简历预览">
              <div className="preview-toolbar">
                <div>
                  <span className="live-dot" />
                  实时预览 <span className="a4-badge">A4</span>
                </div>
                <button
                  className="template-button"
                  onClick={() => setModal("templates")}
                >
                  <LayoutTemplate size={15} />
                  {resume.template === "classic" ? "经典单栏" : "简洁双栏"}
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="paper-stage">
                <ResumePreview resume={resume} />
              </div>
              <p className="preview-caption">
                <Eye size={13} /> 内容修改实时同步 · 最终分页以打印预览为准
              </p>
            </section>
          </div>
          <footer className="page-footer">
            <span>
              简历工坊 <span className="footer-dot">·</span>{" "}
              为你的下一步，认真准备。
            </span>
            <span>用真实经历，讲好自己的故事。</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
          <button aria-label="关闭提示" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      <dialog
        ref={dialogRef}
        className={ai ? "modal ai-modal" : "modal"}
        onCancel={(e) => {
          if (busy) e.preventDefault();
          else {
            setModal(null);
            setAI(null);
          }
        }}
      >
        <button
          className="close-modal"
          aria-label="关闭对话框"
          disabled={busy}
          onClick={() => {
            setModal(null);
            setAI(null);
          }}
        >
          <X size={20} />
        </button>
        {ai ? (
          <>
            <span className="modal-icon">
              <Sparkles size={23} />
            </span>
            <h2>让你的经历，更有说服力</h2>
            <p className="modal-subtitle">
              只优化表达，不替你编造经历。采纳前请核对事实。
            </p>
            <div className="ai-actions">
              {Object.entries(actionNames).map(([key, label]) => (
                <button
                  disabled={busy}
                  className={ai.action === key ? "selected" : ""}
                  key={key}
                  onClick={() => {
                    setAI({
                      ...ai,
                      action: key as AIState["action"],
                      suggestion: "",
                    });
                    setAIError("");
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="ai-comparison">
              <div>
                <h3>原始内容</h3>
                <p>{ai.original}</p>
                <small>{ai.original.length} / 2,000 字</small>
              </div>
              <div className="ai-result">
                <h3>
                  <Sparkles size={14} />
                  {ai.action === "suggest" ? "可以补充什么" : "AI 建议"}
                </h3>
                {busy ? (
                  <div className="ai-loading">
                    <LoaderCircle className="spin" size={24} />
                    <p>正在认真整理你的表达…</p>
                  </div>
                ) : ai.suggestion ? (
                  <p>{ai.suggestion}</p>
                ) : (
                  <p className="empty-result">
                    选择一个方向，让 AI 帮你发现更好的表达。
                  </p>
                )}
              </div>
            </div>
            <label className="field">
              <span>演示口令</span>
              <input
                type="password"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="向项目所有者获取口令"
                disabled={busy}
              />
            </label>
            <p className="privacy-note">
              点击生成即将上方这段文字发送给
              DeepSeek；不会发送整份简历。口令仅暂存在当前页面。
            </p>
            {aiError && (
              <p role="alert" className="error-message">
                {aiError}
              </p>
            )}
            <div className="modal-footer">
              <button
                className="button"
                disabled={busy}
                onClick={() => setAI(null)}
              >
                保留原文
              </button>
              {ai.suggestion && ai.action !== "suggest" ? (
                <button className="button primary" onClick={acceptAI}>
                  <Check size={16} />
                  采纳建议
                </button>
              ) : (
                <button
                  className="button primary"
                  disabled={busy || cooldown > 0 || ai.original.length > 2000}
                  onClick={requestAI}
                >
                  {busy
                    ? "生成中…"
                    : cooldown > 0
                      ? `${cooldown} 秒后可重试`
                      : "生成建议"}
                  <Sparkles size={15} />
                </button>
              )}
            </div>
          </>
        ) : modal === "templates" ? (
          <>
            <span className="modal-icon">
              <LayoutTemplate size={23} />
            </span>
            <h2>选择你的简历风格</h2>
            <p className="modal-subtitle">切换排版，内容完整保留。</p>
            <div className="template-cards">
              {(["classic", "sidebar"] as const).map((t) => (
                <button
                  key={t}
                  className={
                    "template-card " + (resume.template === t ? "chosen" : "")
                  }
                  onClick={() => {
                    setResume((r) => ({ ...r, template: t }));
                    setModal(null);
                  }}
                >
                  <div className={"mini-paper mini-" + t}>
                    <b />
                    <i />
                    <i />
                    <div>
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                  <strong>{t === "classic" ? "经典单栏" : "简洁双栏"}</strong>
                  <span>
                    {t === "classic"
                      ? "清晰稳重，适合大多数岗位"
                      : "侧栏展示技能，层次更鲜明"}
                  </span>
                  {resume.template === t && <Check size={17} />}
                </button>
              ))}
            </div>
          </>
        ) : modal ? (
          <>
            <h2>
              {modal === "clear"
                ? "清空当前简历？"
                : modal === "sample"
                  ? "加载示例简历？"
                  : "导入备份简历？"}
            </h2>
            <p className="modal-subtitle">
              这会替换当前全部内容。建议先下载备份，以免丢失你的编辑。
            </p>
            <div className="modal-footer">
              <button className="button" onClick={backup}>
                先下载备份
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setResume(
                    modal === "clear"
                      ? emptyResume()
                      : modal === "sample"
                        ? sampleResume()
                        : pendingImport!,
                  );
                  setModal(null);
                  setPendingImport(null);
                  setUndo(null);
                  setNotice("内容已更新。");
                }}
              >
                确认
                {modal === "clear"
                  ? "清空"
                  : modal === "sample"
                    ? "加载"
                    : "导入"}
              </button>
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
