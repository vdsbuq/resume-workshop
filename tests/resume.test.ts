import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyResume, sampleResume, parseResume, templates, type TemplateKey } from "../lib/resume";
import { POST } from "../app/api/polish/route";

test("示例和空白简历均可备份往返", () => {
  for (const resume of [sampleResume(), emptyResume()])
    assert.deepEqual(parseResume(JSON.parse(JSON.stringify(resume))), resume);
});
test("拒绝损坏、未知版本、重复编号和超大经历列表", () => {
  for (const value of [
    null,
    {},
    { ...sampleResume(), version: 2 },
    { ...sampleResume(), personal: {} },
    {
      ...sampleResume(),
      education: [sampleResume().education[0], sampleResume().education[0]],
    },
    { ...sampleResume(), projects: Array(51).fill(sampleResume().projects[0]) },
  ])
    assert.throws(() => parseResume(value));
});
test("导入不会保留未知属性", () => {
  const sample = sampleResume();
  assert.deepEqual(parseResume({ ...sample, secret: "unexpected" }), sample);
});
test("AI 接口配置、口令、校验、正常结果和服务错误", async () => {
  const originalFetch = globalThis.fetch;
  const oldKey = process.env.DEEPSEEK_API_KEY;
  const oldPassword = process.env.DEMO_PASSWORD;
  const req = (body: unknown, password = "test-pass") =>
    new Request("http://localhost/api/polish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-demo-password": password,
      },
      body: JSON.stringify(body),
    });
  try {
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.DEMO_PASSWORD;
    assert.equal(
      (
        await POST(
          new Request("http://localhost/api/polish", {
            method: "POST",
            headers: {
              origin: "http://127.0.0.1:3000",
              host: "127.0.0.1:3000",
            },
          }),
        )
      ).status,
      503,
    );
    assert.equal(
      (
        await POST(
          new Request("http://localhost/api/polish", {
            method: "POST",
            headers: {
              origin: "https://other.example",
              host: "127.0.0.1:3000",
            },
          }),
        )
      ).status,
      403,
    );
    assert.equal((await POST(req({}))).status, 503);
    process.env.DEEPSEEK_API_KEY = "test-key";
    process.env.DEMO_PASSWORD = "test-pass";
    assert.equal((await POST(req({}, "wrong"))).status, 401);
    assert.equal(
      (await POST(req({ action: "polish", text: "a".repeat(2001) }))).status,
      400,
    );
    assert.equal(
      (await POST(req({ action: "unknown", text: "经历" }))).status,
      400,
    );
    globalThis.fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body));
      assert.equal(body.messages[1].content, "用 Excel 整理问卷");
      return Response.json({
        choices: [{ message: { content: "使用 Excel 整理问卷数据。" } }],
      });
    };
    const res = await POST(
      req({ action: "polish", text: "用 Excel 整理问卷" }),
    );
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      suggestion: "使用 Excel 整理问卷数据。",
    });
    assert.equal((await POST(req({ action: "analyze", text: "a".repeat(16001) }))).status, 400);
    globalThis.fetch = async (_input, init) => {
      const payload = JSON.parse(String(init?.body));
      assert.equal(payload.max_tokens, 2500);
      assert.match(payload.messages[0].content, /未体现不等于/);
      assert.equal(payload.messages[1].content.length, 3000);
      return Response.json({ choices: [{ message: { content: "岗位要求：SQL；简历未体现，请核实。" } }] });
    };
    assert.equal((await POST(req({ action: "analyze", text: "岗".repeat(3000) }))).status, 200);
    globalThis.fetch = async () => new Response("", { status: 429 });
    assert.equal(
      (await POST(req({ action: "polish", text: "经历" }))).status,
      502,
    );
    globalThis.fetch = async () => Response.json({ choices: [] });
    assert.equal(
      (await POST(req({ action: "polish", text: "经历" }))).status,
      502,
    );
    globalThis.fetch = async () => {
      throw new DOMException("timeout", "TimeoutError");
    };
    assert.match(
      (await (await POST(req({ action: "polish", text: "经历" }))).json())
        .error,
      /超时/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = oldKey;
    if (oldPassword === undefined) delete process.env.DEMO_PASSWORD;
    else process.env.DEMO_PASSWORD = oldPassword;
  }
});

test("所有模板备份往返保持内容，旧模板兼容，未知模板拒绝", () => {
  for (const template of Object.keys(templates) as TemplateKey[]) {
    const resume = { ...sampleResume(), template };
    assert.deepEqual(parseResume(JSON.parse(JSON.stringify(resume))), resume);
  }
  assert.throws(() => parseResume({ ...sampleResume(), template: "unknown" }));
});

test("照片备份保留且拒绝远程地址和过大数据", () => {
  const resume = { ...sampleResume(), photo: "data:image/jpeg;base64,/9j/" };
  assert.deepEqual(parseResume(resume), resume);
  for (const photo of ["https://example.com/a.jpg", "data:image/svg+xml;base64,AAAA", "a".repeat(500001)]) assert.throws(() => parseResume({ ...sampleResume(), photo }));
});

test("选填基本信息兼容旧备份并校验字段", () => {
  const resume = sampleResume();
  resume.personal.age = "22 岁";
  resume.personal.hometown = "浙江杭州";
  assert.deepEqual(parseResume(resume), resume);
  assert.throws(() => parseResume({ ...resume, personal: { ...resume.personal, age: 22 } }));
  const old = emptyResume();
  assert.deepEqual(parseResume(old), old);
});
