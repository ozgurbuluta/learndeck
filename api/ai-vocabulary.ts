import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

interface UserPreferences {
  targetLanguage?: string;
  nativeLanguage?: string;
  level?: string;
  useCases?: string[];
  categories?: string[];
}

interface RequestBody {
  userMessage: string;
  conversationHistory?: Message[];
  userPreferences?: UserPreferences;
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
    const { userMessage, conversationHistory = [], userPreferences }: RequestBody = req.body;

    // Build personalized context from user preferences
    let personalizationContext = '';
    let nativeLanguage = 'English'; // Default
    let targetLanguage = 'German'; // Default

    if (userPreferences) {
      const parts: string[] = [];

      if (userPreferences.targetLanguage) {
        targetLanguage = userPreferences.targetLanguage;
        parts.push(`Target language: ${userPreferences.targetLanguage}`);
      }

      if (userPreferences.nativeLanguage) {
        nativeLanguage = userPreferences.nativeLanguage;
        parts.push(`Native language (for definitions): ${userPreferences.nativeLanguage}`);
      }

      if (userPreferences.level) {
        const levelDescriptions: Record<string, string> = {
          beginner: 'Beginner (A1-A2) - Use simple, common words and basic phrases',
          intermediate: 'Intermediate (B1-B2) - Include everyday conversational vocabulary',
          advanced: 'Advanced (C1-C2) - Include sophisticated, nuanced vocabulary',
        };
        parts.push(`Proficiency level: ${levelDescriptions[userPreferences.level] || userPreferences.level}`);
      }

      if (userPreferences.useCases && userPreferences.useCases.length > 0) {
        const useCaseDescriptions: Record<string, string> = {
          work: 'professional/business contexts',
          daily: 'everyday life situations',
          travel: 'travel and tourism',
          study: 'academic and formal contexts',
        };
        const useCases = userPreferences.useCases
          .map(uc => useCaseDescriptions[uc] || uc)
          .join(', ');
        parts.push(`Learning focus: ${useCases}`);
      }

      if (userPreferences.categories && userPreferences.categories.length > 0) {
        parts.push(`Interests: ${userPreferences.categories.join(', ')}`);
      }

      if (parts.length > 0) {
        personalizationContext = `\n\n**USER PROFILE (tailor vocabulary to these preferences):**\n${parts.join('\n')}`;
      }
    }

    const systemPrompt = `
      You are a vocabulary assistant helping users learn ${targetLanguage}. Your ONLY function is to receive a user's request for vocabulary and return a single, valid JSON object. You must not output any text, conversation, or formatting that is not part of the JSON object.
${personalizationContext}

      **JSON OUTPUT SPECIFICATION:**
      Your entire response MUST be a single JSON object with the following keys: "success", "response", and "words".

      1.  **"success"**: Must always be \`true\`.
      2.  **"response"**: A friendly, conversational message for the user. This field is mandatory.
      3.  **"words"**: An array of objects.
          *   If generating vocabulary, each object in the array MUST contain two keys: "word" (the ${targetLanguage} term) and "definition" (its ${nativeLanguage} meaning/translation).
          *   For languages with articles (German: der/die/das, French: le/la/les, Spanish: el/la/los/las, etc.), include the article with the word.
          *   IMPORTANT: Match the vocabulary difficulty to the user's proficiency level. For beginners, use simple common words. For advanced learners, include sophisticated vocabulary.
          *   If you need to ask the user a clarifying question (e.g., about topic or preferences), this array MUST be empty (\`[]\`).

      **Example of a Perfect Response (for ${targetLanguage} with ${nativeLanguage} definitions):**
      \`\`\`json
      {
        "success": true,
        "response": "Here are some ${targetLanguage} words related to food:",
        "words": [
          {"word": "example_word", "definition": "translation in ${nativeLanguage}"},
          {"word": "another_word", "definition": "translation in ${nativeLanguage}"}
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messagesForClaude,
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      console.error('Claude API error:', errorBody);
      return res.status(500).json({
        success: false,
        error: `Claude API error: ${errorBody}`,
        response: 'Sorry, I could not process your request. Please try again.',
        words: [],
      });
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
