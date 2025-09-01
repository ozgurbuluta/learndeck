import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  text: string
  voice?: string
  language?: string
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  console.log('--- voice-tts function invoked ---');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Basic token bucket per edge instance
    ;(globalThis as any).__last ||= 0
    const now = Date.now()
    if (now - (globalThis as any).__last < 150) {
      await new Promise((r) => setTimeout(r, 150))
    }
    ;(globalThis as any).__last = Date.now()

    const hasApiKey = !!OPENAI_API_KEY;
    console.log(`Is OPENAI_API_KEY set? ${hasApiKey}`);
    if (!hasApiKey) {
      console.error('CRITICAL: OPENAI_API_KEY is not available in the function environment.');
      return new Response('Missing OPENAI_API_KEY', { status: 500, headers: corsHeaders })
    }

    const { text, voice = 'alloy', language = 'de-DE' } = (await req.json()) as RequestBody
    console.log('Received request body:', JSON.stringify({ text, voice, language }));

    if (!text || typeof text !== 'string') {
      console.error('Invalid text received.');
      return new Response('Invalid text', { status: 400, headers: corsHeaders })
    }

    // OpenAI TTS API
    const resp = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice,
        input: text,
        format: 'mp3',
        language,
      }),
    })

    console.log(`OpenAI response status: ${resp.status}`);

    if (!resp.ok) {
      const err = await resp.text()
      console.error('OpenAI TTS error:', err)
      return new Response('Upstream TTS error', { status: 502, headers: corsHeaders })
    }

    const arrayBuffer = await resp.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    
    // Simple base64 encoding
    let base64 = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (let i = 0; i < bytes.length; i += 3) {
      const a = bytes[i];
      const b = bytes[i + 1] || 0;
      const c = bytes[i + 2] || 0;
      const bitmap = (a << 16) | (b << 8) | c;
      base64 += chars.charAt((bitmap >> 18) & 63) +
                chars.charAt((bitmap >> 12) & 63) +
                chars.charAt((bitmap >> 6) & 63) +
                chars.charAt(bitmap & 63);
    }
    // Add padding
    const pad = bytes.length % 3;
    if (pad) {
      base64 = base64.slice(0, -pad) + '=='.slice(0, pad);
    }

    console.log('Successfully generated audio. Sending base64 response.');
    return new Response(JSON.stringify({ base64, mime: 'audio/mpeg' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error('voice-tts error', e)
    return new Response('Server error', { status: 500, headers: corsHeaders })
  }
})


