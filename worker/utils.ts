export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

export function errorResponse(
  message: string,
  status: number,
  error?: string,
  extra?: Record<string, unknown>
): Response {
  return jsonResponse(
    {
      error: error || message.toLowerCase().replace(/\s+/g, '_'),
      message,
      ...extra
    },
    status
  )
}

// Telegram WebApp signature validation
export async function validateInitData(
  initData: string,
  botToken: string
): Promise<{ valid: boolean; userId?: string }> {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return { valid: false }

    params.delete('hash')
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Create HMAC-SHA256
    const encoder = new TextEncoder()
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const secretKeyData = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode(botToken)
    )

    const dataKey = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign(
      'HMAC',
      dataKey,
      encoder.encode(dataCheckString)
    )

    const calculatedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (calculatedHash !== hash) {
      return { valid: false }
    }

    // Extract user ID
    const userParam = params.get('user')
    if (userParam) {
      const user = JSON.parse(userParam)
      return { valid: true, userId: String(user.id) }
    }

    return { valid: false }
  } catch {
    return { valid: false }
  }
}

// Dev mode: extract user ID without validation
export function extractDevUserId(initData: string): string {
  if (initData === 'dev_mode') {
    return 'dev_user_123'
  }
  
  try {
    const params = new URLSearchParams(initData)
    const userParam = params.get('user')
    if (userParam) {
      const user = JSON.parse(userParam)
      return String(user.id)
    }
  } catch {
    // fallback
  }
  
  return 'dev_user_123'
}
