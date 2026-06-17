import useQueryParams from '@/hooks/use-query-params'

import tw from '@/lib/tw'
import type { LucideProps } from 'lucide-react'
import { EllipsisIcon } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'

type PaginationProps = Omit<Pagination<unknown>, 'data'> & {
  range?: number
  onPrefetch?: (page: number) => void | Promise<void>
  maxContinuousPrefetch?: number // Maximum number of pages to prefetch continuously
  continuousInterval?: number // Interval for continuous prefetching in ms
}

/**
 * Calculates the range of page numbers to display in the pagination component.
 * It centers around the current page and includes a specified number of pages before and after it.
 * Ensures that the range does not exceed the total number of pages and adjusts to always show a consistent number of pages when possible.
 * @param currentPage - The current active page number.
 * @param totalPages - The total number of pages available.
 * @param range - The number of pages to show before and after the current page.
 * @return An array of page numbers to display in the pagination.
 */
export const calculatePaginationRange = (
  currentPage: number,
  totalPages: number,
  range: number | undefined
): number[] => {
  range = range ?? 2
  let start = Math.max(1, currentPage - range)
  let end = Math.min(totalPages, currentPage + range)

  if (end - start < range * 2) {
    if (start === 1) {
      end = Math.min(totalPages, start + range * 2)
    } else {
      start = Math.max(1, end - range * 2)
    }
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i).filter(
    (page) => page !== 1 && page !== totalPages
  )
}

/**
 * @description Pagination component for handling page navigation with smart prefetching. Supports prefetching adjacent pages on hover and continuous prefetching while hovering over navigation buttons.
 * @author quanghiep03198
 *	@param {PaginationProps} Props
 *
 * Props:
 * - page: current page number
 * - totalPages: total number of pages
 * - hasNextPage: if there is a next page
 * - hasPrevPage: if there is a previous page
 * - nextPage: number of the next page
 * - prevPage: number of the previous page
 * - range: number of pages to show around the current page
 * - onPrefetch: callback to prefetch a page
 * - maxContinuousPrefetch: max pages to prefetch continuously on hover
 * - continuousInterval: interval for continuous prefetching in ms
 */
const Pagination: React.FC<PaginationProps> = ({
  page: currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  nextPage,
  range,
  onPrefetch: handlePrefetch,
  maxContinuousPrefetch = 5,
  continuousInterval = 200,
}) => {
  const { setParams } = useQueryParams<{ page: number }>()
  const paginationRange = calculatePaginationRange(currentPage, totalPages, range)

  // Refs for managing prefetch state
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const continuousIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const prefetchedPagesRef = useRef<Set<number>>(new Set())
  const [continuousPrefetchState, setContinuousPrefetchState] = useState<{
    isActive: boolean
    currentOffset: number
    direction: 'next' | 'prev' | null
  }>({
    isActive: false,
    currentOffset: 1,
    direction: null,
  })

  // Reset prefetch cache when currentPage changes
  useEffect(() => {
    prefetchedPagesRef.current.clear()
    setContinuousPrefetchState({
      isActive: false,
      currentOffset: 1,
      direction: null,
    })
  }, [currentPage])

  const debouncedPrefetch = useCallback(
    async (page: number, delay: number = 150) => {
      if (!handlePrefetch || prefetchedPagesRef.current.has(page) || page < 1 || page > totalPages) return

      // Clear existing timeout
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }

      // Set new timeout
      prefetchTimeoutRef.current = setTimeout(async () => {
        try {
          await Promise.resolve(handlePrefetch(page))
          prefetchedPagesRef.current.add(page)
        } catch (error) {
          console.warn('Prefetch failed for page', page, error)
        }
      }, delay)
    },
    [handlePrefetch, totalPages]
  )

  // Continuous prefetch function - keeps prefetching while hovering
  const startContinuousPrefetch = useCallback(
    (direction: 'next' | 'prev', targetPage: number) => {
      if (!handlePrefetch) return

      // Stop any existing continuous prefetch
      if (continuousIntervalRef.current) {
        clearInterval(continuousIntervalRef.current)
      }

      setContinuousPrefetchState({
        isActive: true,
        currentOffset: 1,
        direction,
      })

      // Start with immediate prefetch of target page
      debouncedPrefetch(targetPage, 50)

      // Set up continuous prefetching with progressive delay
      let currentOffset = 1
      let currentDelay = continuousInterval

      continuousIntervalRef.current = setInterval(() => {
        currentOffset += 1

        // Stop if we've reached the maximum or page bounds
        if (currentOffset > maxContinuousPrefetch) {
          clearInterval(continuousIntervalRef.current!)
          setContinuousPrefetchState((prev) => ({ ...prev, isActive: false }))
          return
        }

        const nextPageToPrefetch = direction === 'next' ? currentPage + currentOffset : currentPage - currentOffset

        // Check bounds
        if (nextPageToPrefetch < 1 || nextPageToPrefetch > totalPages) {
          clearInterval(continuousIntervalRef.current!)
          setContinuousPrefetchState((prev) => ({ ...prev, isActive: false }))
          return
        }

        // Prefetch the next page in sequence
        debouncedPrefetch(nextPageToPrefetch, 0) // No additional delay for continuous

        setContinuousPrefetchState((prev) => ({ ...prev, currentOffset }))

        // Progressively increase delay for later prefetches to reduce server load
        currentDelay = Math.min(currentDelay * 1.2, 2000)
      }, currentDelay)
    },
    [handlePrefetch, debouncedPrefetch, currentPage, totalPages, maxContinuousPrefetch, continuousInterval]
  )

  // Stop continuous prefetch
  const stopContinuousPrefetch = useCallback(() => {
    if (continuousIntervalRef.current) {
      clearInterval(continuousIntervalRef.current)
      continuousIntervalRef.current = null
    }
    setContinuousPrefetchState({
      isActive: false,
      currentOffset: 1,
      direction: null,
    })
  }, [])

  // Smart prefetch for adjacent pages when hovering navigation buttons
  const handleNavButtonHover = useCallback(
    (targetPage: number, direction: 'next' | 'prev') => {
      if (!handlePrefetch) return

      // Start continuous prefetching
      startContinuousPrefetch(direction, targetPage)
    },
    [handlePrefetch, startContinuousPrefetch]
  )

  // Clear timeout and intervals on unmount
  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }
      if (continuousIntervalRef.current) {
        clearInterval(continuousIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-full items-center justify-center gap-x-0.5">
      <Button
        disabled={!hasPrevPage}
        variant="ghost"
        size="sm"
        onClick={() => setParams({ page: currentPage - 1 })}
        onMouseEnter={() => hasPrevPage && handleNavButtonHover(currentPage - 1, 'prev')}
        onMouseLeave={stopContinuousPrefetch}
        className={
          continuousPrefetchState.isActive && continuousPrefetchState.direction === 'prev' && 'animate-pulse delay-100'
        }
      >
        <Icon name="ChevronLeft" />
        Trang sau
      </Button>
      <Button
        onClick={() => setParams({ page: 1 })}
        onMouseEnter={() => debouncedPrefetch(1)}
        variant={currentPage === 1 ? 'outline' : 'ghost'}
        className="size-8 text-sm"
        size="icon"
      >
        1
      </Button>
      {paginationRange[0] - 1 > 1 && <PaginationElipsis />}
      {paginationRange.map((pageIndex) => {
        return (
          <Button
            key={pageIndex}
            onClick={() => setParams({ page: pageIndex })}
            onMouseEnter={() => debouncedPrefetch(pageIndex)}
            variant={pageIndex === currentPage ? 'outline' : 'ghost'}
            className="size-8 text-sm"
            size="icon"
          >
            {pageIndex}
          </Button>
        )
      })}
      {paginationRange.at(-1) + 1 < totalPages && <PaginationElipsis />}
      {totalPages > 1 && (
        <Button
          onClick={() => setParams({ page: totalPages })}
          onMouseEnter={() => debouncedPrefetch(totalPages)}
          variant={currentPage === totalPages ? 'outline' : 'ghost'}
          className="size-8 text-sm"
          size="icon"
        >
          {totalPages}
        </Button>
      )}
      <Button
        variant="ghost"
        disabled={!hasNextPage}
        size="sm"
        onClick={() => setParams({ page: currentPage + 1 })}
        onMouseEnter={() => hasNextPage && handleNavButtonHover(nextPage, 'next')}
        onMouseLeave={stopContinuousPrefetch}
        className={
          continuousPrefetchState.isActive && continuousPrefetchState.direction === 'next' && 'animate-pulse delay-100'
        }
      >
        Trang tiếp
        <Icon name="ChevronRight" />
      </Button>
    </div>
  )
}

const PaginationElipsis = tw(EllipsisIcon)<
  Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
>`translate-y-1 size-3`

export default Pagination
