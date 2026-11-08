import { Stats } from '../types'

interface Props {
  stats: Stats
  energy: number
}

function StatsHeader({ stats, energy }: Props) {
  const statConfig = [
    { key: 'love_integrity', label: '❤️', color: 'bg-pink-500', value: stats.love_integrity },
    { key: 'temptation', label: '🔥', color: 'bg-orange-500', value: stats.temptation },
    { key: 'career_status', label: '💼', color: 'bg-blue-500', value: stats.career_status }
  ]

  return (
    <header className="bg-tower-mid border-b border-tower-light p-3">
      <div className="flex items-center gap-4">
        {/* Stats */}
        <div className="flex-1 grid grid-cols-3 gap-2">
          {statConfig.map((stat) => (
            <div key={stat.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>{stat.label}</span>
                <span className="text-gray-400">{stat.value}</span>
              </div>
              <div className="stat-bar">
                <div
                  className={`stat-bar-fill ${stat.color}`}
                  style={{ width: `${stat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Energy */}
        <div className="flex items-center gap-1 px-3 py-1 bg-tower-dark rounded-full">
          <span className="text-yellow-400">⚡</span>
          <span className="text-sm font-medium">{energy}</span>
        </div>
      </div>
    </header>
  )
}

export default StatsHeader
