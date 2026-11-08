import { Env, getUserStore, getDefaultUserState, sceneRegistry, UserState, Choice } from '../index'
import { jsonResponse, errorResponse, extractDevUserId, validateInitData } from '../utils'

interface ChoiceRequest {
  init_data: string
  scene_id: string
  choice_id: string
  client_state_version: number
  idempotency_key?: string
}

interface GameEvent {
  type: string
  stat?: string
  delta?: number
  flag?: string
}

export async function handleChoice(request: Request, env: Env): Promise<Response> {
  let body: ChoiceRequest
  try {
    body = await request.json()
  } catch {
    return errorResponse('Invalid JSON body', 400, 'invalid_request')
  }

  const { init_data, scene_id, choice_id, client_state_version } = body

  if (!init_data || !scene_id || !choice_id) {
    return errorResponse('Missing required fields', 400, 'invalid_request')
  }

  // Validate signature in production
  let userId: string
  if (env.ENVIRONMENT === 'production' && env.BOT_TOKEN) {
    const validation = await validateInitData(init_data, env.BOT_TOKEN)
    if (!validation.valid || !validation.userId) {
      return errorResponse('Telegram signature mismatch', 401, 'invalid_init_data')
    }
    userId = validation.userId
  } else {
    userId = extractDevUserId(init_data)
  }

  // Get user state
  const store = getUserStore()
  let userState = store.get(userId)
  
  if (!userState) {
    userState = getDefaultUserState(userId)
    store.set(userId, userState)
  }

  // Version check for optimistic locking
  if (client_state_version !== undefined && client_state_version !== userState.state_version) {
    return errorResponse(
      'State version mismatch - please refresh',
      409,
      'state_mismatch'
    )
  }

  // Verify scene matches current state
  if (userState.current_scene_id !== scene_id) {
    return errorResponse(
      `Scene mismatch: expected ${userState.current_scene_id}, got ${scene_id}`,
      400,
      'scene_mismatch'
    )
  }

  // Get scene and choice
  const scene = sceneRegistry[scene_id]
  if (!scene) {
    return errorResponse(`Scene not found: ${scene_id}`, 400, 'scene_not_found')
  }

  const choice = scene.choices.find(c => c.id === choice_id)
  if (!choice) {
    return errorResponse(`Choice not found: ${choice_id}`, 400, 'choice_not_found')
  }

  // Check entitlements
  if (choice.requires_pack && !userState.packs_owned.includes(choice.requires_pack)) {
    return errorResponse(
      `${choice.requires_pack} pack required`,
      402,
      'premium_required',
      { required_entitlement: choice.requires_pack }
    )
  }

  if (choice.requires_item && !userState.items_owned.includes(choice.requires_item)) {
    return errorResponse(
      `${choice.requires_item} item required`,
      402,
      'premium_required',
      { required_entitlement: choice.requires_item }
    )
  }

  // Check energy
  const energyCost = choice.energy_cost ?? 1
  if (energyCost > 0 && userState.energy < energyCost) {
    return errorResponse('Not enough energy', 429, 'energy_depleted')
  }

  // Apply choice effects
  const events: GameEvent[] = []
  const newState = applyChoiceEffects(userState, choice, events)
  
  // Consume energy
  if (energyCost > 0) {
    newState.energy -= energyCost
  }

  // Update scene
  newState.current_scene_id = choice.next_scene_id
  newState.state_version += 1
  newState.last_active_at = new Date().toISOString()

  // Save state
  store.set(userId, newState)

  // Get next scene
  const nextScene = sceneRegistry[newState.current_scene_id]
  if (!nextScene) {
    return errorResponse(
      `Next scene not found: ${newState.current_scene_id}`,
      500,
      'scene_not_found'
    )
  }

  return jsonResponse({
    state_version: newState.state_version,
    consumed_energy: energyCost,
    events,
    user_state: {
      telegram_id: newState.telegram_id,
      current_scene_id: newState.current_scene_id,
      stats: newState.stats,
      flags: newState.flags,
      packs_owned: newState.packs_owned,
      items_owned: newState.items_owned,
      energy: newState.energy,
      last_active_at: newState.last_active_at
    },
    scene: nextScene
  })
}

function applyChoiceEffects(
  state: UserState,
  choice: Choice,
  events: GameEvent[]
): UserState {
  const newState = JSON.parse(JSON.stringify(state)) as UserState

  // Apply stat effects
  if (choice.effects) {
    for (const [stat, delta] of Object.entries(choice.effects)) {
      if (stat in newState.stats) {
        const statKey = stat as keyof typeof newState.stats
        const oldValue = newState.stats[statKey]
        newState.stats[statKey] = Math.max(0, Math.min(100, oldValue + delta))
        events.push({ type: 'stat_delta', stat, delta })
      }
    }
  }

  // Set flags
  if (choice.set_flags) {
    for (const flag of choice.set_flags) {
      if (!newState.flags.includes(flag)) {
        newState.flags.push(flag)
        events.push({ type: 'flag_set', flag })
      }
    }
  }

  // Clear flags
  if (choice.clear_flags) {
    for (const flag of choice.clear_flags) {
      const idx = newState.flags.indexOf(flag)
      if (idx !== -1) {
        newState.flags.splice(idx, 1)
        events.push({ type: 'flag_clear', flag })
      }
    }
  }

  return newState
}
