import { useEffect, useState } from 'react'
import { GameState, Scene } from './types'
import { fetchState, submitChoice } from './api'
import SceneView from './components/SceneView'
import StatsHeader from './components/StatsHeader'
import LoadingScreen from './components/LoadingScreen'
import ErrorScreen from './components/ErrorScreen'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        ready: () => void
        expand: () => void
        MainButton: {
          show: () => void
          hide: () => void
          setText: (text: string) => void
          onClick: (fn: () => void) => void
        }
      }
    }
  }
}

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stateVersion, setStateVersion] = useState(0)
  const [userState, setUserState] = useState<GameState | null>(null)
  const [scene, setScene] = useState<Scene | null>(null)

  const initData = window.Telegram?.WebApp?.initData || 'dev_mode'

  useEffect(() => {
    window.Telegram?.WebApp?.ready()
    window.Telegram?.WebApp?.expand()
    loadState()
  }, [])

  async function loadState() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchState(initData)
      setStateVersion(data.state_version)
      setUserState(data.user_state)
      setScene(data.scene)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game state')
    } finally {
      setLoading(false)
    }
  }

  async function handleChoice(choiceId: string) {
    if (!scene || !userState) return

    setLoading(true)
    setError(null)
    try {
      const data = await submitChoice(initData, scene.id, choiceId, stateVersion)
      setStateVersion(data.state_version)
      setUserState(data.user_state)
      setScene(data.scene)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'error' in err) {
        const apiErr = err as { error: string; message: string }
        if (apiErr.error === 'premium_required') {
          setError(`Premium content: ${apiErr.message}`)
        } else if (apiErr.error === 'state_mismatch') {
          await loadState()
        } else {
          setError(apiErr.message || 'Choice failed')
        }
      } else {
        setError(err instanceof Error ? err.message : 'Choice failed')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading && !userState) {
    return <LoadingScreen />
  }

  if (error && !userState) {
    return <ErrorScreen message={error} onRetry={loadState} />
  }

  if (!userState || !scene) {
    return <ErrorScreen message="No game state available" onRetry={loadState} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StatsHeader stats={userState.stats} energy={userState.energy} />
      
      <main className="flex-1 p-4">
        <SceneView
          scene={scene}
          userState={userState}
          onChoice={handleChoice}
          loading={loading}
        />
      </main>

      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-900/90 text-white p-3 rounded-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

export default App
