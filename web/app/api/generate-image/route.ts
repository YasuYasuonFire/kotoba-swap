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
- Create a comical and heartwarming illustration that visually depicts the situation described in the text.
- BEFORE: Depict the "Before" situation (${beforeText}) in a slightly chaotic or humorous way (gray/monochrome tones).
- AFTER: Depict the "After" situation (${afterText}) in a bright, happy, and positive way (warm colors like pink/orange).
- Transition: Use a visual element (like an arrow or magic sparkle) to connect the two scenes.
- Character: Include a cute, round snowman-like mascot with an orange bowtie and pink cheeks interacting with the scene.

Text overlay (low priority, keep it subtle if included):
- "${beforeText}"
- "${afterText}"
- "#ことばスワップ"

Style:
- Comical, illustrative, and vector art style.
- Warm, inviting, and positive atmosphere.
- High quality graphic design.

Output ONLY the generated image. Do not provide a text description.
`;

    console.log('[Image Generation] Calling Gemini API (gemini-3-pro-image-preview)...');
    
    // Gemini 3 Pro Image Preview を使用
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-3-pro-image-preview',
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
