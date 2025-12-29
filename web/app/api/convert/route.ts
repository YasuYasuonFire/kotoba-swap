import { NextResponse } from "next/server";
import { fallbackConvert } from "@/lib/convert/fallback";

export const runtime = "nodejs";

type Style = "前向き";

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20; // per IP / minute
const rate = new Map<string, { count: number; resetAt: number }>();

function getIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function rateLimit(ip: string) {
  const now = Date.now();
  const cur = rate.get(ip);
  if (!cur || cur.resetAt < now) {
    rate.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }
  if (cur.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((cur.resetAt - now) / 1000);
    return { ok: false, retryAfter };
  }
  cur.count += 1;
  return { ok: true };
}

async function openaiConvert(params: { text: string; style: Style }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const system = [
    "あなたは年末年始の自虐ネタをポジティブに言い換える編集者です。",
    "X(Twitter)でウケそうなオバハン的・共感を呼ぶ言い回しで、明るく前向きに変換してください。",
    "自虐ネタ（食べてばっかり、ダラダラ、勉強しない等）を、ユーモアを交えつつ肯定する表現に。",
    "嘘や断定はせず、入力文の意味を保ちつつ気持ちをポジティブに転換。",
    "絵文字は1-2個まで。文量は目安100文字以内。",
    "出力は必ず JSON のみ（前後の文章なし）で返してください。",
    'フォーマット: {"converted":"...","alternatives":["...","..."]}',
    "alternatives はニュアンス違いを2つ。",
  ].join("\n");

  const user = [
    `トーン: ${params.style}`,
    "入力文:",
    params.text,
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI API error: ${res.status} ${text}`.slice(0, 500));
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim() || "";
  if (!content) throw new Error("OpenAI returned empty content");

  // JSONだけ返す前提だが、万一囲いが付いても拾う
  const jsonText = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(jsonText) as {
    converted?: unknown;
    alternatives?: unknown;
  };
  const converted =
    typeof parsed.converted === "string" ? parsed.converted.trim() : "";
  const alternatives = Array.isArray(parsed.alternatives)
    ? parsed.alternatives.filter((x): x is string => typeof x === "string")
    : [];

  if (!converted) throw new Error("OpenAI JSON parse failed (converted empty)");

  return {
    converted,
    alternatives: alternatives.slice(0, 2),
  };
}

export async function POST(req: Request) {
  const ip = getIp(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "しばらく時間をおいてお試しください。" },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON形式が不正です。" },
      { status: 400 },
    );
  }

  const text =
    typeof (body as any)?.text === "string" ? (body as any).text.trim() : "";
  const style =
    (body as any)?.style === "やわらかく" ||
    (body as any)?.style === "ビジネス丁寧" ||
    (body as any)?.style === "前向き"
      ? ((body as any).style as Style)
      : ("ビジネス丁寧" as Style);

  if (!text) {
    return NextResponse.json(
      { ok: false, error: "変換したい文を入力してください。" },
      { status: 400 },
    );
  }
  if (text.length > 800) {
    return NextResponse.json(
      { ok: false, error: "長すぎます（800文字以内にしてください）。" },
      { status: 400 },
    );
  }

  try {
    if (process.env.OPENAI_API_KEY) {
      const r = await openaiConvert({ text, style });
      return NextResponse.json({
        ok: true,
        converted: r.converted,
        alternatives: r.alternatives,
        used: "openai",
      });
    }

    const r = fallbackConvert({ text, style });
    return NextResponse.json({
      ok: true,
      converted: r.converted,
      alternatives: r.alternatives,
      used: "fallback",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "変換に失敗しました";
    return NextResponse.json(
      { ok: false, error: msg.slice(0, 300) },
      { status: 500 },
    );
  }
}


