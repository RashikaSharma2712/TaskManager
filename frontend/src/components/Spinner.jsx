export default function Spinner({ className = '' }) {
  return (
    <div
      className={`h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
