import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { beforeText, afterText } = await request.json();

    if (!beforeText || !afterText) {
      return NextResponse.json(
        { error: 'beforeText and afterText are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Nano Banana (Gemini 2.5 Flash Image) を使用
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    // Instagram Stories最適サイズ（9:16）の画像生成プロンプト
    const prompt = `
美しいシェア画像を生成してください。
縦長のInstagramストーリーズフォーマット（9:16比率）で、以下の内容を含めてください：

上部セクション（暗めの背景、グレー系）：
"${beforeText}"
小さく「Before」と表示

中央に大きな下向き矢印 ↓ または変換を示すアイコン

下部セクション（明るい背景、グラデーション - ピンクからオレンジ）：
"${afterText}"
小さく「After」と表示

最下部：
"#ことばスワップ"のハッシュタグ

デザインスタイル：
- モダンでクリーン
- 読みやすいフォント（日本語対応）
- 柔らかいグラデーション
- 絵文字を適度に配置
- マスコットキャラクター（可愛い雪だるまのような丸いキャラクター、オレンジの蝶ネクタイ、ピンクのほっぺ）を小さく右下に
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const generatedImage = response.candidates?.[0]?.content?.parts?.[0];

    // 画像データの取得（Gemini APIの実際のレスポンス形式に応じて調整が必要）
    if (generatedImage && 'inlineData' in generatedImage && generatedImage.inlineData) {
      const imageData = generatedImage.inlineData;
      return NextResponse.json({
        success: true,
        image: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        },
      });
    }

    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
