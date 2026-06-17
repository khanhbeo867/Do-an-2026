import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import tw from '@/lib/tw'
import { cn } from '@/lib/utils'
import { uniqueId } from 'lodash-es'
import React, { useId, useMemo, useRef, useState } from 'react'
import { Icon } from '../ui/icon'
import { Spinner } from '../ui/spinner'
import { Typography } from '../ui/typography'
import { DebouncedInput } from './debounced-input'

type AutoCompleteProps<D extends object> = {
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  shouldFilter?: boolean
  datalist: Array<D>
  labelField: keyof D
  valueField: keyof D
  template?: React.FC<
    { value: D } & React.ComponentProps<
      'div' extends keyof HTMLElementTagNameMap ? keyof HTMLElementTagNameMap : React.ElementType
    >
  >
  onInput?: (value: string) => any
  onSelect?: (value: string) => unknown
} & React.ComponentProps<'input'>

function AutoComplete<D extends object>(props: AutoCompleteProps<D>) {
  const [open, setOpen] = useState(false)

  const {
    name,
    placeholder,
    datalist,
    loading,
    labelField,
    valueField,
    shouldFilter = true,
    className,
    value: currentValue,
    onInput,
    onSelect,
    ref: forwardedRef,
    ...inputProps
  } = props
  const id = useId()
  const internalRef = useRef<HTMLInputElement>(null)
  const resolvedRef = (forwardedRef || internalRef) as React.RefObject<HTMLInputElement>

  const filteredDatalist = useMemo(() => {
    if (!shouldFilter) return datalist ?? []

    const filterFn = (item: D) => {
      const value = item[valueField]
      if (value === null || value === undefined) return false
      const currVal = currentValue ?? ''
      return String(value).toLowerCase().includes(String(currVal).toLowerCase())
    }

    return Array.isArray(datalist) ? datalist.filter(filterFn) : []
  }, [datalist, shouldFilter, currentValue])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') e.preventDefault()
    else if (e.key === 'Escape') setOpen(false)
    else {
      setOpen(true)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger type="button" className="relative w-full" onClick={(e) => e.preventDefault()}>
        <DebouncedInput
          id={id}
          ref={resolvedRef}
          name={name}
          value={currentValue}
          autoComplete="off"
          placeholder={placeholder}
          className={cn(
            'peer focus-within:border-primary! aria-invalid:border-destructive aria-invalid:focus-within:border-destructive rounded-md py-1 pr-9 pl-3 text-sm shadow-sm transition-colors duration-200',
            className
          )}
          style={{
            border: '1px solid hsl(var(--border))',
          }}
          data-icon={(props as any)['data-icon']}
          onKeyDown={handleKeyDown}
          onClick={() => setOpen(true)}
          onChange={(value) => {
            if (typeof onInput === 'function') onInput(value)
          }}
          {...inputProps}
        />

        <Icon
          name="ChevronsUpDown"
          className="absolute top-1/2 right-3 ml-auto h-4 w-4 -translate-y-1/2 rotate-90 opacity-50 peer-data-[icon=false]:hidden"
        />
      </PopoverTrigger>
      <PopoverContent className="max-h-52 overflow-auto p-1">
        {loading ? (
          <div className="flex items-center justify-center p-10 text-center">
            <Spinner />
          </div>
        ) : filteredDatalist?.length > 0 ? (
          filteredDatalist?.map((item) => {
            return (
              <AutoCompleteItem
                key={uniqueId()}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation()
                  setOpen(false)
                  if (typeof onSelect === 'function') onSelect(String(item[valueField]))
                }}
              >
                <Typography variant="small" className="line-clamp-1 flex-1">
                  {String(item[labelField])}
                </Typography>
                <Icon
                  name="Check"
                  className={cn(
                    'ml-auto transition-opacity duration-200',
                    currentValue === item[valueField] ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </AutoCompleteItem>
            )
          })
        ) : (
          <Typography variant="small" color="muted" className="block h-full p-10 text-center">
            Không có dữ liệu
          </Typography>
        )}
      </PopoverContent>
    </Popover>
  )
}

const AutoCompleteItem = tw.div`flex cursor-pointer items-center rounded-md p-2 h-8 hover:bg-secondary hover:text-secondary-foreground`

export default AutoComplete
