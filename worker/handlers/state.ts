import { Env, getUserStore, getDefaultUserState, sceneRegistry } from '../index'
import { jsonResponse, errorResponse, extractDevUserId, validateInitData } from '../utils'

export async function handleState(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const initData = url.searchParams.get('init_data')

  if (!initData) {
    return errorResponse('Missing init_data parameter', 400, 'invalid_init_data')
  }

  // Validate signature in production, skip in dev
  let userId: string
  if (env.ENVIRONMENT === 'production' && env.BOT_TOKEN) {
    const validation = await validateInitData(initData, env.BOT_TOKEN)
    if (!validation.valid || !validation.userId) {
      return errorResponse('Telegram signature mismatch', 401, 'invalid_init_data')
    }
    userId = validation.userId
  } else {
    userId = extractDevUserId(initData)
  }

  // Get or create user state
  const store = getUserStore()
  let userState = store.get(userId)
  
  if (!userState) {
    userState = getDefaultUserState(userId)
    store.set(userId, userState)
  }

  // Get current scene
  const scene = sceneRegistry[userState.current_scene_id]
  if (!scene) {
    return errorResponse(
      `Scene not found: ${userState.current_scene_id}`,
      500,
      'scene_not_found'
    )
  }

  return jsonResponse({
    state_version: userState.state_version,
    user_state: {
      telegram_id: userState.telegram_id,
      current_scene_id: userState.current_scene_id,
      stats: userState.stats,
      flags: userState.flags,
      packs_owned: userState.packs_owned,
      items_owned: userState.items_owned,
      energy: userState.energy,
      last_active_at: userState.last_active_at
    },
    scene
  })
}
