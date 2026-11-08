import { StateResponse, ChoiceResponse, ApiError } from './types'

const API_BASE = '/api'

export async function fetchState(initData: string): Promise<StateResponse> {
  const url = `${API_BASE}/state?init_data=${encodeURIComponent(initData)}`
  const res = await fetch(url)
  
  if (!res.ok) {
    const err: ApiError = await res.json()
    throw err
  }
  
  return res.json()
}

export async function submitChoice(
  initData: string,
  sceneId: string,
  choiceId: string,
  clientStateVersion: number
): Promise<ChoiceResponse> {
  const res = await fetch(`${API_BASE}/choice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      init_data: initData,
      scene_id: sceneId,
      choice_id: choiceId,
      client_state_version: clientStateVersion
    })
  })
  
  if (!res.ok) {
    const err: ApiError = await res.json()
    throw err
  }
  
  return res.json()
}
