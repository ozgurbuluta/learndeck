import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RequestBody {
  targetWord: string;
  spokenWord: string;
  targetLanguage: string;
  nativeLanguage?: string;
  similarityScore: number;
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
    console.error('CLAUDE_API_KEY is not set.');
    return res.status(500).json({
      success: false,
      error: 'Missing API key.',
    });
  }

  try {
    const {
      targetWord,
      spokenWord,
      targetLanguage,
      nativeLanguage = 'English',
      similarityScore,
    }: RequestBody = req.body;

    // Build feedback request
    const systemPrompt = `You are a friendly language pronunciation coach for ${targetLanguage} learners whose native language is ${nativeLanguage}.

Your task is to provide helpful, encouraging feedback on pronunciation attempts.

Guidelines:
- Be encouraging and positive, even for mistakes
- Explain common pronunciation challenges specific to ${nativeLanguage} speakers learning ${targetLanguage}
- Provide specific, actionable tips
- Use simple language that learners can understand
- If the attempt was close, highlight what was correct
- Keep responses concise (2-3 sentences max)

Respond in JSON format:
{
  "feedback": "Your main feedback message",
  "tip": "One specific pronunciation tip",
  "encouragement": "Brief encouraging phrase"
}`;

    const userMessage = `The learner tried to say "${targetWord}" in ${targetLanguage}.
The speech recognition heard: "${spokenWord}"
Similarity score: ${(similarityScore * 100).toFixed(0)}%

Please provide pronunciation feedback.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
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
      // Fallback: return plain text as feedback
      return res.status(200).json({
        success: true,
        feedback: responseText,
        tip: '',
        encouragement: 'Keep practicing!',
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
