import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { ExtractedWord } from '../_shared/types.ts'

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface RequestBody {
  content: string // Raw text or Base-64 (for PDF) or CSV string
  fileType: string // MIME type coming from the client
  userId: string
  folderIds: string[]
  existingWords?: string[]
}

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

// Wild-open CORS – tighten if necessary
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

// ­Supabase client for DB work
const getSupabase = () =>
  createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

/* -------------------------------------------------------------------------- */
/*                                  HANDLER                                   */
/* -------------------------------------------------------------------------- */

serve(async (req) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, fileType, userId, folderIds, existingWords }: RequestBody = await req.json()

    if (!content || !userId) {
      return json({ success: false, error: 'Missing required fields' }, 400)
    }

    /* ------------------------- STEP 1 – NORMALISE TEXT ------------------------- */

    const normalised = await normaliseContent(content, fileType)
    if (normalised.trim().length < 20) {
      return json(
        {
          success: false,
          error: 'Document has no extractable text.',
        },
        400
      )
    }

    /* --------------------- STEP 2 – EXTRACT VOCABULARY --------------------- */

    let words = await extractWords(normalised, existingWords)

    if (!words.length) {
      return json(
        {
          success: false,
          error: 'No vocabulary found',
        },
        400
      )
    }

    /* --------------- STEP 3 – ENSURE EVERY WORD HAS DEFINITION --------------- */

    words = await ensureDefinitions(words, normalised)

    /* -------------------------- STEP 4 – PERSIST DATA ------------------------- */

    const saved = await saveWordsToDatabase(getSupabase(), words, userId, folderIds)

    return json({ success: true, savedCount: saved.length, words })
  } catch (err) {
    console.error('process-document error:', {
      message: err.message,
      stack: err.stack,
    })
    return json(
      { success: false, error: err?.message ?? 'Server error' },
      500
    )
  }
})

/* -------------------------------------------------------------------------- */
/*                               CORE FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

async function normaliseContent(content: string, fileType: string): Promise<string> {
  if (fileType.includes('csv')) return extractTextFromCSV(content)
  // For PDF and TXT, content is already plain text from the client
  return content
}

async function extractWords(content: string, existingWords?: string[]): Promise<ExtractedWord[]> {
  const apiKey = Deno.env.get('CLAUDE_API_KEY')
  if (!apiKey) throw new Error('CLAUDE_API_KEY is not set.')

  try {
    return await extractWithClaude(content, apiKey, existingWords)
  } catch (err) {
    console.error('Claude extraction failed, no fallback possible.', err)
    throw new Error('AI-based vocabulary extraction failed.')
  }
}

async function ensureDefinitions(words: ExtractedWord[], context: string): Promise<ExtractedWord[]> {
  const missing = words.filter((w) => !w.definition || w.definition.trim().length < 2)
  if (!missing.length) return words

  console.log(`Attempting to enrich definitions for ${missing.length} words.`)
  const apiKey = Deno.env.get('CLAUDE_API_KEY')
  if (!apiKey) return words

  try {
    const enriched = await translateDefinitionsWithClaude(
      missing.map((w) => w.word),
      context,
      apiKey
    )
    const map = new Map(enriched.map((e) => [e.word.toLowerCase(), e.definition]))
    return words.map((w) => ({ ...w, definition: map.get(w.word.toLowerCase()) ?? w.definition }))
  } catch (err) {
    console.warn('Definition enrichment step failed.', err)
    return words // Return original words on failure
  }
}

/* -------------------------------------------------------------------------- */
/*                            LLM HELPER UTILITIES                             */
/* -------------------------------------------------------------------------- */

async function extractWithClaude(
  content: string,
  apiKey: string,
  existingWords?: string[]
): Promise<ExtractedWord[]> {
  const prompt = buildExtractionPrompt(content, existingWords)
  const { text } = await callClaude(prompt, apiKey, 2000)

  try {
    const cleaned = text.replace(/```json\n?|```/g, '').trim()
    const data: ExtractedWord[] = JSON.parse(cleaned)
    return data.filter(validateExtractedWord(content)).slice(0, 20)
  } catch (err) {
    console.error('Initial Claude JSON parse failed.', { error: err, text })
    return [] // Fail gracefully if parsing fails
  }
}

async function translateDefinitionsWithClaude(
  words: string[],
  context: string,
  apiKey: string
): Promise<ExtractedWord[]> {
  const prompt = buildTranslationPrompt(words, context)
  const { text } = await callClaude(prompt, apiKey, 1000)
  try {
    const cleaned = text.replace(/```json\n?|```/g, '').trim()
    const result = JSON.parse(cleaned)
    return Array.isArray(result) ? result.filter((r) => r.word && r.definition) : []
  } catch (err) {
    console.error('Failed to parse translation response from Claude.', { error: err, text })
    return []
  }
}

function buildExtractionPrompt(content: string, existingWords: string[] = []): string {
  const snippet = content.length > 16000 ? content.slice(0, 16000) + '...' : content
  const exclusionClause =
    existingWords.length > 0
      ? `\n6. **Exclusion**: DO NOT extract any of the following words which have already been processed: ${existingWords.join(
          ', '
        )}.`
      : ''

  return `You are an expert linguist and vocabulary assistant.

DOCUMENT ANALYSIS:
The user has uploaded a document. Your first task is to analyze the following text to identify the primary language and subject matter.

VOCABULARY EXTRACTION (CRITICAL INSTRUCTIONS):
1. From the text, extract up to 20 useful, non-trivial vocabulary words. These words MUST be physically present in the text.
2. For EACH word you extract, you MUST provide a concise, accurate ENGLISH definition or translation.
3. For German nouns, if you can identify the grammatical article (der, die, das), you MUST include it in a separate "article" field. For all other words, omit this field.
4. **Example (German)**: If you extract "Wirtschaft", the output should be {"word":"Wirtschaft","definition":"economy; commerce", "article":"die"}.
5. **Filtering**: EXCLUDE all metadata, common filler words, and any random-looking character sequences.${exclusionClause}

OUTPUT FORMAT:
Return ONLY a valid, minified JSON array. Do not include any other text, markdown, or explanations.
Example: [{"word":"Beispiel","definition":"example; instance", "article":"das"},{"word":"comprehensive","definition":"complete; including all or nearly all elements or aspects of something."}]

DOCUMENT TEXT TO ANALYZE:
${snippet}`
}

function buildTranslationPrompt(words: string[], context: string): string {
  const list = words.join(', ')
  const snippet = context.length > 3000 ? context.slice(0, 3000) + '...' : context
  return `Provide a concise English definition (or translation if the source word is not English) for each of the following words, using the provided context to resolve ambiguity. Words: ${list}. Context: ${snippet}. Return ONLY a minified JSON array in the format {"word":"...","definition":"..."}.`
}

async function callClaude(prompt: string, apiKey: string, maxTokens = 1500): Promise<{ text: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.1,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Claude API error ${res.status}: ${errorBody}`)
  }
  const data = await res.json()
  return { text: data.content?.[0]?.text ?? '' }
}

/* -------------------------------------------------------------------------- */
/*                          LOCAL (NON-LLM) EXTRACTION                         */
/* -------------------------------------------------------------------------- */

function extractWordsSimple(content: string): ExtractedWord[] {
  const raw = Array.from(
    new Set(
      content
        .toLowerCase()
        .replace(/[^a-zA-Z\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 6 && w.length <= 20)
    )
  ).slice(0, 10)

  return raw.map((word) => ({ word, definition: '' }))
}

/* -------------------------------------------------------------------------- */
/*                            TEXT PRE-PROCESSING                              */
/* -------------------------------------------------------------------------- */

function extractTextFromCSV(csv: string): string {
  return csv
    .split('\n')
    .flatMap((l) => l.split(','))
    .map((c) => c.replace(/['"]/g, '').trim())
    .join(' ')
}

/* -------------------------------------------------------------------------- */
/*                             HELPER FUNCTIONS                                */
/* -------------------------------------------------------------------------- */

function validateExtractedWord(content: string) {
  const lower = content.toLowerCase()
  const banned = new Set([
    'xpacket',
    'xmpmeta',
    'description',
    'format',
    'creator',
    'syntax',
    'elements',
    'application',
    'thing',
    'things',
    'object',
    'objects',
    'metadata',
    'producer',
    'version',
    'brandl',
    'mpcehihzreszntczkc', // from screenshot
  ])
  return (item: ExtractedWord) => {
    if (!item || typeof item.word !== 'string' || typeof item.definition !== 'string') {
      return false
    }
    const w = item.word.trim().toLowerCase()
    const d = item.definition.trim()

    if (w.length < 2 || w.length > 50) return false
    if (d.length < 3 || d.length > 250) return false
    if (banned.has(w)) return false
    // check for at least one vowel to filter out random consonants
    if (!/[aeiouyäöüáéíóú]/i.test(w)) return false
    return lower.includes(w)
  }
}

function looseExtract(text: string, original: string): ExtractedWord[] {
  const result: ExtractedWord[] = []
  for (const line of text.split('\n')) {
    const m = line.match(/[-*]?\s*"?(\w{4,})"?\s*[:\-]\s*(.+)/)
    if (m) {
      const word = m[1]
      const def = m[2]
      if (original.toLowerCase().includes(word.toLowerCase()))
        result.push({ word, definition: def })
    }
  }
  return result.slice(0, 15)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/* -------------------------------------------------------------------------- */
/*                              DATABASE HELPERS                               */
/* -------------------------------------------------------------------------- */

async function saveWordsToDatabase(
  supabase: any,
  words: ExtractedWord[],
  userId: string,
  folderIds: string[]
) {
  const now = new Date()
  const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()

  const insertPayload = words.map((w) => ({
    user_id: userId,
    word: w.word.trim(),
    definition: w.definition.trim(),
    article: w.article ?? null,
    created_at: now.toISOString(),
    last_reviewed: null,
    review_count: 0,
    correct_count: 0,
    difficulty: 'new',
    next_review: nextReview,
  }))

  const { data, error } = await supabase.from('words').insert(insertPayload).select()
  if (error) throw error

  if (folderIds.length && data?.length) {
    const relations = data.flatMap((w: any) =>
      folderIds.map((f) => ({
        word_id: w.id,
        folder_id: f,
        created_at: now.toISOString(),
      }))
    )
    await supabase.from('word_folders').insert(relations)
  }

  return data ?? []
}