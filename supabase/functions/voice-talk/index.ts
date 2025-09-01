import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  mode: 'dialogue' | 'sentence'
  message?: string
  scenario?: string
  word?: string
  userWords?: string[]
  language?: string
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  console.log('--- voice-talk function invoked ---');

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const hasApiKey = !!OPENAI_API_KEY;
    console.log(`Is OPENAI_API_KEY set? ${hasApiKey}`);
    if (!hasApiKey) {
      console.error('CRITICAL: OPENAI_API_KEY is not available in the function environment.');
    }

    const body = (await req.json()) as RequestBody
    console.log('Received request body:', JSON.stringify(body));

    if (!OPENAI_API_KEY) {
      // Fallback answers when API key is missing
      console.log('Returning fallback response because API key is missing.');
      const fallback = body.mode === 'sentence'
        ? { text: `Eine Vorsorgeuntersuchung ist wichtig für die Gesundheit.`, highlightedWords: [] }
        : { text: 'Hallo! Wie kann ich dir helfen?', highlightedWords: [] }
      return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    const sys = `You are a friendly language practice partner.
Return concise replies (max 1-2 sentences). If mode=sentence, produce ONE natural sentence that includes the target word exactly once. If mode=dialogue, reply within the given scenario.
Occasionally include one of the user's library words. When you use a library word, wrap it with [[double brackets]] in the text so the client can highlight it.
Maintain the user's target language if provided, else use English.`

    const userWords = body.userWords?.slice(0, 100) || []
    const tags = userWords.length ? `Library words: ${userWords.join(', ')}` : ''

    const lang = body.language || 'German';

    const prompt = body.mode === 'sentence'
      ? `Language: ${lang}. Create one natural sentence using the word "${body.word}". ${tags}`
      : `Language: ${lang}. Scenario: ${body.scenario || 'casual chat'}. User said: "${body.message || ''}". ${tags}`
    
    console.log('Sending prompt to OpenAI:', prompt);

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
      }),
    })

    console.log(`OpenAI response status: ${resp.status}`);

    if (!resp.ok) {
      const err = await resp.text()
      console.error('OpenAI talk error:', err)
      return new Response('Upstream talk error', { status: 502, headers: corsHeaders })
    }

    const json = await resp.json()
    const text = json.choices?.[0]?.message?.content?.trim() || ''
    const highlightedWords = Array.from(text.matchAll(/\[\[([^\]]+)\]\]/g)).map(m => m[1])
    const cleanText = text.replace(/\[\[|\]\]/g, '')

    console.log('Successfully processed request. Sending response:', JSON.stringify({ text: cleanText, highlightedWords }));
    return new Response(JSON.stringify({ text: cleanText, highlightedWords }), {
      headers: { ... corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error('voice-talk error', e)
    return new Response('Server error', { status: 500, headers: corsHeaders })
  }
})


