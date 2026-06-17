import { useEffect, useLayoutEffect } from 'react'

export function useEffectOnce(callback: React.EffectCallback) {
  useEffect(callback, [])
}

export function useLayoutEffectOnce(callback: React.EffectCallback) {
  useLayoutEffect(callback, [])
}
