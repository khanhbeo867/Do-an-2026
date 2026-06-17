import type { Virtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

export default function useVirtualScrollPadding<
  ContainerElement extends HTMLElement,
  VirtualItemElement extends HTMLElement,
>(virtualizer: Virtualizer<ContainerElement, VirtualItemElement>) {
  const virtualItems = virtualizer.getVirtualItems()

  const offsetRef = useRef<Record<'before' | 'after', number>>({
    before: 0,
    after: 0,
  })

  if (virtualItems?.length > 0)
    offsetRef.current = {
      before: Math.max(0, virtualItems[0].start - virtualizer.options.scrollMargin),
      after: Math.max(0, virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end),
    }
  else {
    offsetRef.current = { before: 0, after: 0 }
  }

  return offsetRef.current
}
