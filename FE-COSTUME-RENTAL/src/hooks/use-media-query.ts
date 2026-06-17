import { useHydrated } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

/**
 * Custom React hook to determine if a given CSS media query matches the current viewport.
 *
 * @param mediaQuery - A string representing the CSS media query to evaluate (e.g., '(max-width: 600px)').
 * @returns {boolean} - Returns true if the media query matches, otherwise false.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 600px)');
 */
export default function useMediaQuery(mediaQuery: string) {
  const hyderated = useHydrated()
  const [isMatch, setIsMatch] = useState(() => {
    if (!hyderated) return false
    return window.matchMedia(mediaQuery).matches
  })

  useEffect(() => {
    if (!hyderated) return

    const mediaQueryList = window.matchMedia(mediaQuery)
    const checkIsMatchMediaQuery = () => {
      window.requestAnimationFrame(() => setIsMatch(mediaQueryList.matches))
    }
    checkIsMatchMediaQuery()
    window.addEventListener('resize', checkIsMatchMediaQuery)

    return () => {
      window.removeEventListener('resize', checkIsMatchMediaQuery)
    }
  }, [mediaQuery])

  return isMatch
}
