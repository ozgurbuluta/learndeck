import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  audioBase64: string
  mimeType?: string
  locale?: string
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    ;(globalThis as any).__last ||= 0
    const now = Date.now()
    if (now - (globalThis as any).__last < 150) {
      await new Promise((r) => setTimeout(r, 150))
    }
    ;(globalThis as any).__last = Date.now()
    if (!OPENAI_API_KEY) return new Response('Missing OPENAI_API_KEY', { status: 500, headers: corsHeaders })

    const { audioBase64, mimeType = 'audio/m4a', locale = 'en' } = (await req.json()) as RequestBody
    if (!audioBase64) return new Response('Missing audio', { status: 400, headers: corsHeaders })

    const bytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))

    const form = new FormData()
    const file = new Blob([bytes], { type: mimeType })
    form.append('file', file, 'audio.m4a')
    form.append('model', 'whisper-1')
    form.append('language', locale.split('-')[0])

    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: form as any,
    })

    if (!resp.ok) {
      const err = await resp.text()
      console.error('OpenAI STT error:', err)
      return new Response('Upstream STT error', { status: 502, headers: corsHeaders })
    }

    const json = await resp.json()
    return new Response(JSON.stringify({ text: json.text || '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error('voice-stt error', e)
    return new Response('Server error', { status: 500, headers: corsHeaders })
  }
})


