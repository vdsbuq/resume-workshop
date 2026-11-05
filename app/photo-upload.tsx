"use client";
import { useState } from "react";

export default function PhotoUpload({ value, onChange }: { value?: string; onChange: (photo?: string) => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) { setError("请选择 8 MB 以内的 JPG、PNG 或 WebP 照片。"); return; }
    setBusy(true);
    const url = URL.createObjectURL(file);
    try {
      const img = new Image(); img.src = url; await img.decode();
      const scale = Math.min(1, 600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error();
      ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL("image/jpeg", .85);
      if (photo.length > 500000) throw new Error();
      onChange(photo);
    } catch { setError("照片读取失败，请换一张较小的图片重试。"); }
    finally { URL.revokeObjectURL(url); setBusy(false); }
  }
  return <div className="photo-upload field-wide">
    {value ? <img src={value} alt="当前证件照" /> : <div className="photo-placeholder">证件照<br />选填</div>}
    <div><label className="field"><span>{busy ? "正在处理照片…" : value ? "替换照片" : "上传照片（选填）"}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { void upload(e.target.files?.[0]); e.target.value = ""; }} /></label>
    <small>建议使用竖版证件照。照片仅在浏览器保存，并随备份导出，不发送给 AI。</small>
    {value && <button type="button" className="button" disabled={busy} onClick={() => onChange()}>移除照片</button>}
    {error && <p role="alert">{error}</p>}</div>
  </div>;
}
