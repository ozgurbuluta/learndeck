import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  userMessage: string;
  conversationHistory?: Message[];
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
      response: 'Sorry, I am currently unavailable. Please try again later.',
    });
  }

  try {
    const { userMessage, conversationHistory = [] }: RequestBody = req.body;

    const systemPrompt = `
      You are a data transformation service. Your ONLY function is to receive a user's request for vocabulary and return a single, valid JSON object. You must not output any text, conversation, or formatting that is not part of the JSON object.

      **JSON OUTPUT SPECIFICATION:**
      Your entire response MUST be a single JSON object with the following keys: "success", "response", and "words".

      1.  **"success"**: Must always be \`true\`.
      2.  **"response"**: A friendly, conversational message for the user. This field is mandatory.
      3.  **"words"**: An array of objects.
          *   If generating vocabulary, each object in the array MUST contain two keys: "word" (the foreign term) and "definition" (its English meaning). For German words, include the article (der/die/das) with the word.
          *   If you need to ask the user a clarifying question (e.g., about language, topic, or level), this array MUST be empty (\`[]\`).

      **Example of a Perfect Response:**
      \`\`\`json
      {
        "success": true,
        "response": "Here are some German words related to food:",
        "words": [
          {"word": "der Apfel", "definition": "the apple"},
          {"word": "das Brot", "definition": "the bread"}
        ]
      }
      \`\`\`
    `;

    const messagesForClaude = [
      ...conversationHistory.map((msg) => ({ role: msg.type, content: msg.content })),
      { role: 'user', content: userMessage },
    ];

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messagesForClaude,
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      console.error('Claude API error:', errorBody);
      throw new Error(`Claude API responded with status: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    let assistantResponseText =
      Array.isArray(claudeData.content) && claudeData.content.length > 0
        ? claudeData.content[0].text
        : '';

    // Extract JSON from markdown code block if present
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = assistantResponseText.match(jsonRegex);
    if (match && match[1]) {
      assistantResponseText = match[1];
    }

    try {
      const parsedResponse = JSON.parse(assistantResponseText);
      return res.status(200).json(parsedResponse);
    } catch {
      // Fallback: wrap plain text response
      return res.status(200).json({
        success: true,
        response: assistantResponseText,
        words: [],
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
