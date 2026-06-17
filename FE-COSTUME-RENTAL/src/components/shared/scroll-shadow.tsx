import { useLayoutEffectOnce } from '@/hooks/use-effect-once'
import { cn } from '@/lib/utils'
import { useRafState, useScroll } from 'ahooks'
import { debounce } from 'lodash-es'
import React, { useCallback, useMemo, useRef } from 'react'

export interface ScrollShadowProps extends React.PropsWithChildren, React.ComponentProps<'div'> {
  orientation?: 'vertical' | 'horizontal'
  ref?: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement) => void)
}

const ScrollShadow: React.FC<ScrollShadowProps> = ({
  className,
  orientation = 'vertical',
  children,
  ref,
  ...props
}) => {
  const localRef = useRef<HTMLDivElement>(null)

  const [isScrollable, setIsScrollable] = useRafState<boolean>(true)
  const containerScroll = useScroll(localRef)

  const scrollStates = useMemo(() => {
    const scrollHeight = localRef.current?.scrollHeight ?? 0
    const scrollWidth = localRef.current?.scrollWidth ?? 0
    const scrollTop = containerScroll?.top ?? 0
    const scrollLeft = containerScroll?.left ?? 0
    const scrollClientHeight = localRef.current?.clientHeight ?? 0
    const scrollClientWidth = localRef.current?.clientWidth ?? 0

    const isScrolledToTop = scrollTop === 0
    const isScrolledToBottom = scrollHeight - scrollTop - scrollClientHeight < 1
    const isScrollToStart = scrollLeft === 0
    const isScrollToEnd = scrollWidth - scrollLeft - scrollClientWidth < 1
    const isAwayFromEdge = (!isScrolledToTop && !isScrolledToBottom) || (!isScrollToStart && !isScrollToEnd)

    return {
      isScrolledToTop,
      isScrolledToBottom,
      isScrollToStart,
      isScrollToEnd,
      isAwayFromEdge,
    }
  }, [containerScroll, localRef])

  const handleCheckIsScrollable = useCallback(
    debounce(() => {
      const element: HTMLDivElement = localRef.current
      if (element) {
        const _isScrollable =
          orientation === 'vertical'
            ? element.scrollHeight > element.clientHeight
            : element.scrollWidth > element.clientWidth
        setIsScrollable(_isScrollable)
      }
    }, 1000 / 60),
    [localRef]
  )

  useLayoutEffectOnce(() => {
    const element = localRef.current

    handleCheckIsScrollable()

    const mutationObserver = new MutationObserver(handleCheckIsScrollable)
    const resizeObserver = new ResizeObserver(handleCheckIsScrollable)

    if (element) {
      mutationObserver.observe(element, { childList: true, subtree: true })
      resizeObserver.observe(element)
    }

    return () => {
      mutationObserver.disconnect()
      resizeObserver.disconnect()
    }
  })

  return (
    <div
      {...props}
      ref={(e) => {
        localRef.current = e
        if (typeof ref === 'function') {
          ref(e)
        } else if (ref && 'current' in ref) {
          ref.current = e
        }
      }}
      data-top-scroll={isScrollable && scrollStates.isScrolledToTop}
      data-bottom-scroll={isScrollable && scrollStates.isScrolledToBottom}
      data-away-edge={isScrollable && scrollStates.isAwayFromEdge}
      data-left-scroll={isScrollable && scrollStates.isScrollToStart}
      data-right-scroll={isScrollable && scrollStates.isScrollToEnd}
      className={cn(
        className,
        // prettier-ignore
        orientation==='vertical' && `
					overflow-y-auto
					data-[away-edge=true]:mask-[linear-gradient(to_bottom,transparent,hsl(var(--background))_10%,hsl(var(--background))_90%,transparent)]
					data-[top-scroll=true]:mask-[linear-gradient(to_bottom,hsl(var(--background))_10%,hsl(var(--background))_90%,transparent)]
					data-[bottom-scroll=true]:mask-[linear-gradient(to_bottom,transparent,hsl(var(--background))_10%,hsl(var(--background))_100%)]
				`,
        // prettier-ignore
        orientation==='horizontal' && `
					overflow-x-auto
					data-[away-edge=true]:mask-[linear-gradient(to_right,transparent,hsl(var(--background))_10%,hsl(var(--background))_90%,transparent)]
					data-[left-scroll=true]:mask-[linear-gradient(to_right,hsl(var(--background))_10%,hsl(var(--background))_90%,transparent)]
					data-[right-scroll=true]:mask-[linear-gradient(to_right,transparent,hsl(var(--background))_10%,hsl(var(--background))_100%)]
				`
      )}
      style={{
        scrollbarGutter: 'stable',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: '100% 100%',
      }}
    >
      {children}
    </div>
  )
}

ScrollShadow.displayName = 'ScrollShadow'

export default ScrollShadow
