import { useCallback, useState } from 'react'

/** Simple boolean toggle for modals, panels, etc. */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle, setValue]
}
