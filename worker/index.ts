import { handleState } from './handlers/state'
import { handleChoice } from './handlers/choice'
import { corsHeaders, jsonResponse, errorResponse } from './utils'
import calvinCh1 from '../scenes/calvin_ch1.json'

export interface Env {
  ENVIRONMENT: string
  BOT_TOKEN?: string
  // DB: D1Database // Uncomment when D1 is set up
}

// In-memory store for dev (replace with D1 in production)
const devUserStore = new Map<string, UserState>()

export interface UserState {
  telegram_id: string
  current_scene_id: string
  stats: {
    love_integrity: number
    temptation: number
    career_status: number
  }
  flags: string[]
  packs_owned: string[]
  items_owned: string[]
  energy: number
  state_version: number
  last_active_at: string
}

// Scene registry - load all scene files
export const sceneRegistry: Record<string, Scene> = {
  ...(calvinCh1.scenes as unknown as Record<string, Scene>)
}

export interface Scene {
  id: string
  character: string
  chapter: number | string
  text: string[]
  choices: Choice[]
  conditions?: {
    all_flags_true?: string[]
    any_flags_true?: string[]
    min_stats?: Record<string, number>
  }
  premium_paywall?: {
    required_item: string
    description: string
  }
}

export interface Choice {
  id: string
  label: string
  effects?: Record<string, number>
  set_flags?: string[]
  clear_flags?: string[]
  requires_pack?: string
  requires_item?: string
  energy_cost?: number
  next_scene_id: string
}

export function getDefaultUserState(telegramId: string): UserState {
  return {
    telegram_id: telegramId,
    current_scene_id: 'intro_02_calvin_gala',
    stats: {
      love_integrity: 50,
      temptation: 30,
      career_status: 40
    },
    flags: [],
    packs_owned: [],
    items_owned: [],
    energy: 10,
    state_version: 1,
    last_active_at: new Date().toISOString()
  }
}

export function getUserStore() {
  return devUserStore
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Route requests
      if (url.pathname === '/api/state' && request.method === 'GET') {
        return handleState(request, env)
      }
      
      if (url.pathname === '/api/choice' && request.method === 'POST') {
        return handleChoice(request, env)
      }

      // Health check
      if (url.pathname === '/api/health') {
        return jsonResponse({ status: 'ok', environment: env.ENVIRONMENT })
      }

      return errorResponse('Not found', 404)
    } catch (err) {
      console.error('Worker error:', err)
      return errorResponse('Internal server error', 500)
    }
  }
}
