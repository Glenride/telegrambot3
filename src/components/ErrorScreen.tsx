interface Props {
  message: string
  onRetry: () => void
}

function ErrorScreen({ message, onRetry }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tower-dark p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-4xl">⚠️</div>
        <p className="text-gray-300">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-neon-blue text-tower-dark font-medium rounded-lg hover:bg-neon-blue/80 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export default ErrorScreen
