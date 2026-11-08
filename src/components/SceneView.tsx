import { Scene, GameState, Choice } from '../types'

interface Props {
  scene: Scene
  userState: GameState
  onChoice: (choiceId: string) => void
  loading: boolean
}

function SceneView({ scene, userState, onChoice, loading }: Props) {
  const characterColors: Record<string, string> = {
    calvin: 'text-neon-blue',
    jackson: 'text-neon-pink',
    cole: 'text-neon-purple',
    collision: 'text-yellow-400',
    neutral: 'text-gray-400'
  }

  function canAffordChoice(choice: Choice): boolean {
    const cost = choice.energy_cost ?? 1
    return userState.energy >= cost
  }

  function hasEntitlement(choice: Choice): boolean {
    if (choice.requires_pack && !userState.packs_owned.includes(choice.requires_pack)) {
      return false
    }
    if (choice.requires_item && !userState.items_owned.includes(choice.requires_item)) {
      return false
    }
    return true
  }

  function isPremium(choice: Choice): boolean {
    return !!(choice.requires_pack || choice.requires_item)
  }

  return (
    <div className="space-y-6">
      {/* Scene header */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider">
        <span className={characterColors[scene.character] || 'text-gray-400'}>
          {scene.character}
        </span>
        <span className="text-gray-600">•</span>
        <span className="text-gray-500">Chapter {scene.chapter}</span>
      </div>

      {/* Story text */}
      <div className="space-y-4">
        {scene.text.map((paragraph, i) => (
          <p key={i} className="text-gray-200 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Choices */}
      <div className="space-y-3 pt-4">
        {scene.choices.map((choice) => {
          const affordable = canAffordChoice(choice)
          const entitled = hasEntitlement(choice)
          const premium = isPremium(choice)
          const disabled = loading || !affordable || !entitled

          return (
            <button
              key={choice.id}
              onClick={() => onChoice(choice.id)}
              disabled={disabled}
              className={`choice-btn ${premium ? 'premium' : ''} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span>{choice.label}</span>
                {(choice.energy_cost ?? 1) > 0 && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    ⚡ {choice.energy_cost ?? 1}
                  </span>
                )}
              </div>
              
              {!entitled && (
                <div className="mt-2 text-xs text-neon-purple">
                  🔒 Requires {choice.requires_pack || choice.requires_item}
                </div>
              )}
              
              {!affordable && entitled && (
                <div className="mt-2 text-xs text-yellow-500">
                  Not enough energy
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SceneView
