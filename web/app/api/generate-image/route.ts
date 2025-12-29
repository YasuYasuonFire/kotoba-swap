import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('[Image Generation] Request received');
  try {
    const { beforeText, afterText } = await request.json();

    if (!beforeText || !afterText) {
      console.error('[Image Generation] Missing required fields');
      return NextResponse.json(
        { error: 'beforeText and afterText are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('[Image Generation] API Key missing');
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }
    console.log('[Image Generation] API Key check passed');

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Instagram Stories最適サイズ（9:16）の画像生成プロンプト
    // チャット形式の応答を防ぐため、命令形のプロンプトに変更
    const prompt = `
Generate a vertical image for Instagram Stories (9:16 aspect ratio).
The image MUST visually represent the transformation from a "Before" state to an "After" state.

Content requirements:
- Top section (Darker background, gray tones): Display the text "${beforeText}" clearly. Add a small "Before" label.
- Center: A large downward arrow (↓) or transformation icon.
- Bottom section (Brighter background, gradient from pink to orange): Display the text "${afterText}" clearly. Add a small "After" label.
- Footer: Include the hashtag "#ことばスワップ".
- Bottom Right: A small mascot character (round snowman-like, orange bowtie, pink cheeks).

Style:
- Modern and clean design.
- Legible fonts (Japanese support required).
- Soft gradients.
- Moderate use of emojis.
- High quality, professional graphic design.

Output ONLY the generated image. Do not provide a text description.
`;

    console.log('[Image Generation] Calling Gemini API (gemini-2.5-flash-image)...');
    
    // Gemini 2.5 Flash Image を使用
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: {
          imageConfig: {
              aspectRatio: '9:16'
          }
          // responseMimeType は画像生成では使用不可のため削除 
        }
      });

      console.log('[Image Generation] API Response received');
      
      const candidate = response.candidates?.[0];
      if (!candidate || !candidate.content || !candidate.content.parts) {
         throw new Error('No candidate content found');
      }

      // すべてのパートをチェックして画像データを探す
      let imageData: any = null;
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
            imageData = part.inlineData;
            break;
        }
      }

      if (imageData) {
        console.log('[Image Generation] Image data found, MIME:', imageData.mimeType);
        return NextResponse.json({
          success: true,
          image: {
            mimeType: imageData.mimeType || 'image/png',
            data: imageData.data,
          },
        });
      } else {
        console.error('[Image Generation] No inlineData found in any part.');
        // テキストパートがあればログ出力
        const textParts = candidate.content.parts.filter((p: any) => p.text).map((p: any) => p.text);
        if (textParts.length > 0) {
            console.error('[Image Generation] Received text response instead:', textParts.join('\n'));
        }
      }

    } catch (apiError: any) {
      console.error('[Image Generation] API Specific Error:', apiError);
      if (apiError.response) {
        console.error('[Image Generation] API Error Response:', JSON.stringify(apiError.response, null, 2));
      }
      throw apiError;
    }

    console.error('[Image Generation] Failed to extract image from response');
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[Image Generation] Fatal Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
