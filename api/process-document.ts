import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ExtractedWord {
  word: string;
  definition: string;
  article?: string;
}

interface RequestBody {
  content: string;
  fileType: string;
  existingWords?: string[];
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
    const { content, fileType, existingWords = [] }: RequestBody = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Missing content' });
    }

    // Normalize content based on file type
    const normalizedContent = normalizeContent(content, fileType);

    if (normalizedContent.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Document has no extractable text.',
      });
    }

    // Extract words using Claude
    const words = await extractWordsWithClaude(normalizedContent, CLAUDE_API_KEY, existingWords);

    if (!words.length) {
      return res.status(400).json({
        success: false,
        error: 'No vocabulary found in document.',
      });
    }

    return res.status(200).json({
      success: true,
      words,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function normalizeContent(content: string, fileType: string): string {
  if (fileType.includes('csv')) {
    return content
      .split('\n')
      .flatMap((l) => l.split(','))
      .map((c) => c.replace(/['"]/g, '').trim())
      .join(' ');
  }
  return content;
}

async function extractWordsWithClaude(
  content: string,
  apiKey: string,
  existingWords: string[]
): Promise<ExtractedWord[]> {
  const snippet = content.length > 16000 ? content.slice(0, 16000) + '...' : content;

  const exclusionClause =
    existingWords.length > 0
      ? `\n6. **Exclusion**: DO NOT extract any of the following words: ${existingWords.join(', ')}.`
      : '';

  const prompt = `You are an expert linguist and vocabulary assistant.

DOCUMENT ANALYSIS:
The user has uploaded a document. Analyze the following text to identify vocabulary words.

VOCABULARY EXTRACTION (CRITICAL INSTRUCTIONS):
1. Extract up to 20 useful, non-trivial vocabulary words from the text.
2. For EACH word, provide a concise, accurate ENGLISH definition or translation.
3. For German nouns, include the article (der/die/das) with the word.
4. EXCLUDE metadata, common filler words, and random character sequences.${exclusionClause}

OUTPUT FORMAT:
Return ONLY a valid JSON array. No other text or markdown.
Example: [{"word":"der Apfel","definition":"the apple"},{"word":"das Buch","definition":"the book"}]

DOCUMENT TEXT:
${snippet}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.1,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';

  try {
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const words: ExtractedWord[] = JSON.parse(cleaned);
    return words.filter(validateWord).slice(0, 20);
  } catch {
    console.error('Failed to parse Claude response:', text);
    return [];
  }
}

function validateWord(item: ExtractedWord): boolean {
  if (!item || typeof item.word !== 'string' || typeof item.definition !== 'string') {
    return false;
  }
  const w = item.word.trim();
  const d = item.definition.trim();

  if (w.length < 2 || w.length > 50) return false;
  if (d.length < 3 || d.length > 250) return false;
  // Check for at least one vowel
  if (!/[aeiouyäöüáéíóú]/i.test(w)) return false;
  return true;
}
