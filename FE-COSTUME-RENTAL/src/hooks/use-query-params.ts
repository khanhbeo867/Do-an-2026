import type { UseNavigateResult } from '@tanstack/react-router'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { omit } from 'lodash-es'
import { useCallback, useLayoutEffect } from 'react'

type NavigateFnOptions = Parameter<UseNavigateResult<string>>

/**
 * Custom React hook to manage URL query parameters.
 * This hook provides an easy way to read, set, and remove query parameters from the URL.
 * It leverages the `useSearch` and `useNavigate` hooks from `@tanstack/react-router`.
 * @param {T} [defaultParams] - An optional object containing default query parameters to initialize the URL with.
 * @returns {Object} An object containing:
 * - `searchParams`: The current query parameters as an object of type T.
 * - `setParams`: A function to set or update query parameters.
 * - `removeParam`: A function to remove a specific query parameter by key.
 * @example
 * const { searchParams, setParams, removeParam } = useQueryParams<{ page: string; filter: string }>({ page: '1' });
 * setParams({ filter: 'active' }); // Updates URL to include ?page=1&filter=active
 * removeParam('page'); // Updates URL to include ?filter=active
 * console.log(searchParams); // { filter: 'active' }
 * Note: This hook assumes that the component using it is wrapped within a `Router` context provided by `@tanstack/react-router`.
 */
export default function useQueryParams<T = ReturnType<typeof useSearch>>(defaultParams?: T) {
  const navigate = useNavigate()

  const search = useSearch({
    strict: false,
    select: (search) => search,
  })
  /**
   * Set search params from URL
   * @param { Record<string, any> } params
   * @returns {Promise<void>}
   */
  const setParams = useCallback(
    (params: T, options: { overrideExisting: boolean } = { overrideExisting: false }) => {
      navigate({
        search: (prev) => ({
          ...(!options.overrideExisting && prev),
          ...params,
        }),
      } as NavigateFnOptions)
    },
    [search]
  )

  /**
   * Remove search params from URL
   * @param { string } key
   * @returns {Promise<void>}
   */
  const removeParam = useCallback((key: string) => {
    navigate({ search: (prev) => omit(prev, [key]) } as NavigateFnOptions)
  }, [])

  useLayoutEffect(() => {
    if (defaultParams)
      navigate({
        search: (prev) => {
          return { ...defaultParams, ...prev }
        },
      } as NavigateFnOptions)
  }, [])

  return {
    searchParams: search as T,
    setParams,
    removeParam,
  }
}
