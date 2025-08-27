// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @deno-types="https://esm.sh/@supabase/supabase-js@2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { decode as base64Decode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'
// @deno-types="https://esm.sh/pdfjs-dist@4.6.82/build/pdf.mjs"
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@4.6.82/build/pdf.mjs'
import type { ExtractedWord } from '../_shared/types.ts'

declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface RequestBody {
  content: string // Raw text or Base-64 (for PDF) or CSV string
  fileType: string // MIME type coming from the client
  userId: string
  folderIds: string[]
  existingWords?: string[]
  previewMode?: boolean // If true, only extract words without saving to database
  customPrompt?: string // Custom user prompt for extraction
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
    const { content, fileType, userId, folderIds, existingWords, previewMode, customPrompt }: RequestBody = await req.json()

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

    let words = await extractWordsCustom(normalised, existingWords, customPrompt)

    if (!words.length) {
      return json(
        {
          success: false,
          error: 'No vocabulary found matching your criteria',
        },
        400
      )
    }

    /* --------------- STEP 3 – ENSURE EVERY WORD HAS DEFINITION --------------- */

    words = await ensureDefinitions(words, normalised)

    /* -------------------------- STEP 4 – PERSIST DATA ------------------------- */

    // If in preview mode, return words without saving to database
    if (previewMode) {
      return json({ success: true, savedCount: 0, words, isPreview: true })
    }

    // Otherwise, save to database as before
    const saved = await saveWordsToDatabase(getSupabase(), words, userId, folderIds)

    return json({ success: true, savedCount: saved.length, words })
  } catch (err) {
    console.error('process-document-custom error:', {
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
  if (fileType.includes('json')) return content // JSON content for confirmed words
  if (fileType.includes('pdf')) return await extractTextFromPDFBase64(content)
  // For PDF and TXT, content is already plain text from the client
  return content
}

async function extractWordsCustom(content: string, existingWords?: string[], customPrompt?: string): Promise<ExtractedWord[]> {
  // If content is already JSON (confirmed words), parse and return
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed) && parsed.every(item => item.word && item.definition)) {
      return parsed as ExtractedWord[]
    }
  } catch {
    // Not JSON, continue with normal extraction
  }

  const apiKey = Deno.env.get('CLAUDE_API_KEY')
  if (!apiKey) throw new Error('CLAUDE_API_KEY is not set.')

  try {
    return await extractWithClaudeCustom(content, apiKey, existingWords, customPrompt)
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

async function extractWithClaudeCustom(
  content: string,
  apiKey: string,
  existingWords?: string[],
  customPrompt?: string
): Promise<ExtractedWord[]> {
  const prompt = buildCustomExtractionPrompt(content, existingWords, customPrompt)
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

function buildCustomExtractionPrompt(content: string, existingWords: string[] = [], customPrompt?: string): string {
  const snippet = content.length > 16000 ? content.slice(0, 16000) + '...' : content
  const exclusionClause =
    existingWords.length > 0
      ? `\n6. **Exclusion**: DO NOT extract any of the following words which have already been processed: ${existingWords.join(
          ', '
        )}.`
      : ''

  // Build intelligent custom extraction criteria with examples and clarifications
  const customCriteria = customPrompt 
    ? `\n\n**CUSTOM EXTRACTION CRITERIA**:
The user has specified: "${customPrompt}"

IMPORTANT - INTERPRET THE USER'S REQUEST INTELLIGENTLY:
- If they say "prepositions" → extract prepositions like "durch", "mit", "über"
- If they say "words with prepositions" → extract compound words or phrases that CONTAIN prepositions, like "durchführen", "mitarbeiten", "übersetzen"
- If they say "verbs" → extract action words like "arbeiten", "sprechen", "verstehen"
- If they say "verbs with prepositions" → extract phrasal/prepositional verbs like "sich freuen auf", "denken an", "warten auf"
- If they say "nouns" → extract naming words like "Haus", "Arbeit", "Freund"
- If they say "adjectives" → extract descriptive words like "schön", "interessant", "wichtig"
- If they say "technical terms" → extract specialized vocabulary from the field/domain
- If they say "business vocabulary" → extract professional/commercial terms
- If they say "academic words" → extract scholarly/formal vocabulary
- If they say "German compound words" → extract words like "Arbeitsplatz", "Geschäftsführer", "Wissenschaft"

ANALYZE THE USER'S INTENT:
- Consider the grammatical category they want
- Consider if they want single words vs. phrases vs. compounds
- Consider the semantic domain (technical, academic, casual, etc.)
- Prioritize words that truly match their learning objectives

Focus on extracting vocabulary that matches the user's ACTUAL learning intent, not just literal keyword matching.`
    : ''

  return `You are an expert linguist and vocabulary assistant specializing in intelligent content analysis and targeted vocabulary extraction.

DOCUMENT ANALYSIS:
The user has uploaded a document. Your first task is to analyze the following text to identify the primary language and subject matter.

VOCABULARY EXTRACTION (CRITICAL INSTRUCTIONS):
1. From the text, extract up to 20 useful, non-trivial vocabulary words. These words MUST be physically present in the text.
2. For EACH word you extract, you MUST provide a concise, accurate ENGLISH definition or translation.
3. For German nouns, handle articles carefully:
   - If the word already includes the article (like "der Aufenthalt", "die Aufforderung"), extract it AS-IS and do NOT add a separate "article" field
   - If the word is just the noun without article (like "Wirtschaft"), you MAY include the article in a separate "article" field
   - **Example 1**: If you extract "der Aufenthalt", output: {"word":"der Aufenthalt","definition":"stay; residence; sojourn"}
   - **Example 2**: If you extract "Wirtschaft", output: {"word":"Wirtschaft","definition":"economy; commerce", "article":"die"}
4. **Filtering**: EXCLUDE all metadata, common filler words, random character sequences, and overly basic words (like "der", "die", "das" unless specifically requested).${exclusionClause}${customCriteria}

QUALITY CRITERIA:
- Prioritize vocabulary that would be valuable for language learning
- Focus on words that are substantive and meaningful
- Ensure definitions are clear and contextually appropriate
- For multi-word expressions, extract them as complete units when grammatically coherent

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

// Remove helper and use base64Decode inline to avoid any scoping issues

async function extractTextFromPDFBase64(base64: string): Promise<string> {
  try {
    const cleaned = base64.startsWith('data:')
      ? base64.substring(base64.indexOf(',') + 1)
      : base64

    const bytes = base64Decode(cleaned)

    // CRITICAL: Set GlobalWorkerOptions.workerSrc BEFORE calling getDocument
    // This must be done at the global level, not just in options
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.6.82/build/pdf.worker.mjs'

    const loadingTask = (pdfjsLib as any).getDocument({
      data: bytes,
      disableWorker: true,
    })

    const pdf = await loadingTask.promise
    let text = ''
    const maxPages = Math.min(pdf.numPages, 10) // Process max 10 pages

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => (item && item.str ? item.str : ''))
        .join(' ')
      text += pageText + '\n'
    }
    return text
  } catch (err) {
    console.error('Failed to extract PDF text:', err)
    throw new Error(
      `PDF processing failed: ${
        err?.message || 'Unknown error'
      }. Please try a different PDF or convert it to text format.`
    )
  }
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