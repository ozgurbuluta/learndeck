import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  userMessage: string;
  conversationHistory?: Message[];
  targetLanguage: string;
  nativeLanguage?: string;
  level?: string;
  topic?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

  if (!CLAUDE_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Missing API key.',
    });
  }

  try {
    const {
      userMessage,
      conversationHistory = [],
      targetLanguage,
      nativeLanguage = 'English',
      level = 'beginner',
      topic,
    }: RequestBody = req.body;

    // Build system prompt for conversation practice
    const levelGuidelines: Record<string, string> = {
      beginner: 'Use simple, common words and short sentences. Speak slowly and clearly. Use present tense mostly.',
      intermediate: 'Use everyday vocabulary with some idioms. Include past and future tenses. Keep sentences moderate length.',
      advanced: 'Use sophisticated vocabulary and complex sentence structures. Include idioms, subjunctive, and nuanced expressions.',
    };

    const systemPrompt = `You are a friendly conversation partner helping someone practice ${targetLanguage}.
Their native language is ${nativeLanguage} and their level is ${level}.

Guidelines:
- ${levelGuidelines[level] || levelGuidelines.beginner}
- Respond ONLY in ${targetLanguage}
- Keep responses short (1-3 sentences) to encourage back-and-forth
- Be encouraging and patient
- If the user makes grammar mistakes, gently model the correct form in your response
- Ask follow-up questions to keep the conversation going
${topic ? `- The conversation topic is: ${topic}` : ''}

After your ${targetLanguage} response, add a translation helper in this format:
[Translation: your response in ${nativeLanguage}]

Respond in JSON format:
{
  "response": "Your response in ${targetLanguage}",
  "translation": "Translation in ${nativeLanguage}",
  "suggestion": "Optional: A suggested response the user could say next (in ${targetLanguage})"
}`;

    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: systemPrompt,
        messages,
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      console.error('Claude API error:', errorBody);
      return res.status(500).json({
        success: false,
        error: `Claude API error: ${errorBody}`,
      });
    }

    const claudeData = await claudeResponse.json();
    let responseText =
      Array.isArray(claudeData.content) && claudeData.content.length > 0
        ? claudeData.content[0].text
        : '';

    // Extract JSON from markdown code block if present
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = responseText.match(jsonRegex);
    if (match && match[1]) {
      responseText = match[1];
    }

    try {
      const parsedResponse = JSON.parse(responseText);
      return res.status(200).json({
        success: true,
        ...parsedResponse,
      });
    } catch {
      // Fallback: return plain text as response
      return res.status(200).json({
        success: true,
        response: responseText,
        translation: '',
        suggestion: '',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
