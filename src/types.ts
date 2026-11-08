export interface Stats {
  love_integrity: number
  temptation: number
  career_status: number
}

export interface GameState {
  telegram_id: string
  current_scene_id: string
  stats: Stats
  flags: string[]
  packs_owned: string[]
  items_owned: string[]
  energy: number
  last_active_at: string
}

export interface Choice {
  id: string
  label: string
  effects?: Partial<Stats> & Record<string, number>
  set_flags?: string[]
  clear_flags?: string[]
  requires_pack?: string
  requires_item?: string
  energy_cost?: number
  next_scene_id: string
}

export interface Scene {
  id: string
  character: 'calvin' | 'jackson' | 'cole' | 'collision' | 'neutral'
  chapter: number | string
  text: string[]
  choices: Choice[]
  conditions?: {
    all_flags_true?: string[]
    any_flags_true?: string[]
    min_stats?: Partial<Stats>
  }
  premium_paywall?: {
    required_item: string
    description: string
  }
}

export interface StateResponse {
  state_version: number
  user_state: GameState
  scene: Scene
}

export interface ChoiceResponse extends StateResponse {
  consumed_energy: number
  events: Array<{
    type: string
    stat?: string
    delta?: number
    flag?: string
  }>
}

export interface ApiError {
  error: string
  message: string
  required_entitlement?: string
}
