import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Message {
  type: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  userMessage: string
  conversationHistory?: Message[]
}

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY is not set.')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing API key.',
          response: 'Sorry, I am currently unavailable. Please try again later.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userMessage, conversationHistory = [] }: RequestBody = await req.json()

    const systemPrompt = `
      You are a data transformation service. Your ONLY function is to receive a user's request for vocabulary and return a single, valid JSON object. You must not output any text, conversation, or formatting that is not part of the JSON object.

      **JSON OUTPUT SPECIFICATION:**
      Your entire response MUST be a single JSON object with the following keys: "success", "response", and "words".

      1.  **"success"**: Must always be \`true\`.
      2.  **"response"**: A friendly, conversational message for the user. This field is mandatory.
      3.  **"words"**: An array of objects.
          *   If generating vocabulary, each object in the array MUST contain two keys: "word" (the foreign term) and "definition" (its English meaning). You are forbidden from using any other keys (like "sentence").
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
    `

    const messagesForClaude = [
      ...conversationHistory.map((msg) => ({ role: msg.type, content: msg.content })),
      { role: 'user', content: userMessage },
    ]

    const claudeRequestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messagesForClaude,
    }

    const claudeResponseRaw = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(claudeRequestBody),
    })

    if (!claudeResponseRaw.ok) {
      const errorBody = await claudeResponseRaw.text()
      console.error('Claude API error:', errorBody)
      throw new Error(`Claude API responded with status: ${claudeResponseRaw.status}`)
    }

    const claudeResponse = await claudeResponseRaw.json()
    let assistantResponseText = Array.isArray(claudeResponse.content) && claudeResponse.content.length > 0
      ? claudeResponse.content[0].text
      : ''

    // Claude sometimes wraps the JSON in a markdown block. Let's extract it.
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/
    const match = assistantResponseText.match(jsonRegex)
    if (match && match[1]) {
      assistantResponseText = match[1]
    }

    try {
      // The ideal path: the LLM returns valid JSON.
      const parsedResponse = JSON.parse(assistantResponseText)
      return new Response(JSON.stringify(parsedResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (e) {
      // Fallback path: the LLM returned conversational text that was not wrapped in the required JSON object.
      // We will wrap it ourselves to ensure the frontend receives a consistent response format.
      console.warn('Claude API response was not valid JSON, wrapping it and returning as plain text.')
      const fallbackResponse = {
        success: true,
        response: assistantResponseText,
      }
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
  } catch (error) {
    console.error('Unhandled error in function:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})