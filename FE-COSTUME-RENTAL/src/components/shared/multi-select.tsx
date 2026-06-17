import useScrollToFn from '@/hooks/use-scroll-fn'
import useVirtualScrollPadding from '@/hooks/use-virtual-scroll-padding'
import { cn } from '@/lib/utils'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useClickAway, useDeepCompareEffect } from 'ahooks'
import { CommandLoading } from 'cmdk'
import { XCircle } from 'lucide-react'
import React, { Fragment, useCallback, useRef, useState } from 'react'
import { Badge } from '../ui/badge'
import { buttonVariants } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'
import { Icon } from '../ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'
import { Spinner } from '../ui/spinner'
import { Typography } from '../ui/typography'
import ScrollShadow from './scroll-shadow'

type SelectItem = { disabled?: boolean; [key: string]: any }

/**
 * Props for MultiSelect component
 */
export type MultiSelectProps<T extends SelectItem> = React.ButtonHTMLAttributes<HTMLButtonElement> &
  Pick<React.ComponentProps<typeof CommandInput>, 'onInput'> & {
    ref?: React.RefObject<HTMLButtonElement>

    value?: Array<T[keyof T]>

    /**
     * Determines whether command should filter the datalist automatically or manually.
     */
    shouldFilter?: boolean

    /**
     * If true, allows selecting all options at once.
     */
    canSelectAll?: boolean

    /**
     * An array of option objects to be displayed in the multi-select component.
     */
    datalist: Array<T>

    /**
     * The field in the option object that represents the label of the option.
     */
    labelField: keyof T

    /**
     * The field in the option object that represents the value of the option.
     */
    valueField: keyof T

    search?: string

    /**
     * Callback function triggered when the selected values change.
     * Receives an array of the new selected values.
     */
    onValueChange: (value: Array<T[MultiSelectProps<T>['valueField']]>) => void

    /**
     * Callback function triggered when the selected values change.
     * Receives an array of the new selected values.
     */
    onInput?: (value: string) => unknown

    /**
     * Callback function triggered when the component is reset.
     */
    onReset?: () => void

    /** The default selected values when the component mounts. */
    defaultValue?: Array<T[keyof T]>

    /**
     * Placeholder text to be displayed when no values are selected.
     * Optional, defaults to "Select options".
     */
    placeholder?: string

    /**
     * Maximum number of items to display. Extra selected items will be summarized.
     * Optional, defaults to 3.
     */
    maxCount?: number

    /**
     * The modality of the popover. When set to true, interaction with outside elements
     * will be disabled and only popover content will be visible to screen readers.
     * Optional, defaults to false.
     */
    modalPopover?: boolean

    /**
     * If true, renders the multi-select component as a child of another component.
     * Optional, defaults to false.
     */
    asChild?: boolean

    /**
     * Additional class names to apply custom styles to the multi-select component.
     * Optional, can be used to add custom styles.
     */
    classNames?: {
      popoverTrigger?: string
      popoverContent?: string
      selectedItem?: string
    }

    /**
     * Additional class names to apply custom styles to the multi-select component.
     * Optional, can be used to add custom styles.
     */
    loading?: boolean
  }

const ESTIMATE_SIZE = 32
const PRERENDER_COUNT = 5

const normalizeString = (value: string) => value.trim().toLowerCase()

export function MultiSelect<D extends SelectItem>({
  datalist,
  labelField,
  valueField,
  canSelectAll = true,
  shouldFilter = true,
  onValueChange,
  onInput,
  search,
  loading,
  value = [],
  defaultValue = [],
  placeholder = 'Select options',
  maxCount = 3,
  modalPopover = true,
  classNames,
  ref,
  ...props
}: MultiSelectProps<D>) {
  const [selectedValues, setSelectedValues] = useState<Array<D[keyof D]>>(defaultValue)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverContentRef = useRef<HTMLDivElement>(null)
  const popoverTriggerRef = ref ?? triggerRef

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (event.key === 'Enter') {
      setIsPopoverOpen(true)
    } else if (event.key === 'Backspace' && !event.currentTarget.value) {
      const newSelectedValues = [...selectedValues]
      newSelectedValues.pop()
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues as Array<D[keyof D]>)
    }
  }

  const toggleOption = (option: D[keyof D]) => {
    const newSelectedValues = selectedValues.includes(option as D[keyof D])
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option]
    setSelectedValues(newSelectedValues as Array<D[keyof D]>)
    onValueChange(newSelectedValues as Array<D[keyof D]>)
  }

  const handleClear = () => {
    setSelectedValues([])
    onValueChange([])
  }

  const clearExtraOptions = () => {
    const newSelectedValues = selectedValues.slice(0, maxCount)
    setSelectedValues(newSelectedValues)
    onValueChange(newSelectedValues as Array<D[keyof D]>)
  }

  const toggleAll = () => {
    if (
      Array.isArray(datalist) &&
      Array.isArray(selectedValues) &&
      datalist?.length > 0 &&
      selectedValues?.length === datalist?.length
    ) {
      handleClear()
    } else {
      const allValues = datalist.map((option) => String(option?.[valueField]))
      setSelectedValues(allValues as Array<D[keyof D]>)
      onValueChange(allValues as Array<D[keyof D]>)
    }
  }

  // TODO: Implement virtual scroll for better performance with large list
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)
  const refCallback = useCallback((node: HTMLDivElement) => {
    if (node) {
      setScrollElement(node)
    }
  }, [])

  const scrollToFn = useScrollToFn({ current: scrollElement })
  const getScrollElement = useCallback(() => scrollElement, [scrollElement])
  const estimateSize = useCallback(() => ESTIMATE_SIZE, [])

  const virtualizer = useVirtualizer({
    count: datalist?.length,
    overscan: PRERENDER_COUNT,
    useAnimationFrameWithResizeObserver: true,
    estimateSize,
    getScrollElement,
    scrollToFn,
  })

  const virtualItems = virtualizer.getVirtualItems()

  const { before, after } = useVirtualScrollPadding(virtualizer)

  useDeepCompareEffect(() => {
    if (Array.isArray(value)) setSelectedValues(value)
  }, [value])

  useClickAway(() => setIsPopoverOpen(false), [popoverTriggerRef, popoverContentRef])

  return (
    <Popover modal={modalPopover} open={isPopoverOpen}>
      <PopoverTrigger
        {...props}
        ref={popoverTriggerRef}
        onWheel={(e) => e.stopPropagation()}
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'bg-background scrollbar-none! aria-invalid:border-destructive! grid w-full grid-cols-[1fr_auto] items-center overflow-hidden px-3 py-0 hover:bg-inherit [&_svg]:pointer-events-auto',
          classNames?.popoverTrigger
        )}
      >
        {Array.isArray(datalist) && Array.isArray(selectedValues) && selectedValues?.length > 0 ? (
          <>
            <ScrollShadow
              orientation="horizontal"
              className="scrollbar-none! flex items-center gap-x-1 overflow-x-auto overflow-y-hidden"
            >
              {Array.isArray(selectedValues) &&
                selectedValues.slice(0, maxCount).map((value) => {
                  const option = datalist.find((item) => item?.[valueField] === value)
                  return (
                    <Badge key={String(value)} variant="secondary" className={classNames?.selectedItem}>
                      <Typography
                        variant="small"
                        className="max-w-16 truncate text-xs"
                        title={String(option?.[labelField])}
                      >
                        {String(option?.[labelField])}
                      </Typography>
                      <Icon name="CircleX" />
                    </Badge>
                  )
                })}
              {Array.isArray(selectedValues) && selectedValues?.length > maxCount && (
                <HoverCard>
                  <HoverCardTrigger>
                    <Badge variant="secondary" className={'whitespace-nowrap'}>
                      {`+ ${selectedValues?.length - maxCount} more`}
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation()
                          clearExtraOptions()
                        }}
                      />
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="flex max-h-56 max-w-sm flex-wrap items-center gap-x-1 gap-y-2 overflow-y-auto p-2">
                    {Array.isArray(selectedValues) &&
                      selectedValues.slice(maxCount).map((item) => (
                        <Badge key={String(item)} variant="secondary">
                          {String(item)}
                          <XCircle
                            className="ml-2 h-4 w-4 cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleOption(item)
                            }}
                          />
                        </Badge>
                      ))}
                  </HoverCardContent>
                </HoverCard>
              )}
            </ScrollShadow>
            <div className="bg-background flex items-center justify-end gap-x-2">
              <Icon
                name={'CircleX'}
                className="text-muted-foreground size-3.5 cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation()
                  handleClear()
                }}
              />
              <Separator orientation="vertical" className="flex h-full min-h-4" />
              <Icon name="ChevronsUpDown" className="text-muted-foreground size-4 rotate-90 cursor-pointer" />
            </div>
          </>
        ) : (
          <>
            <Typography variant="small" className="text-muted-foreground block text-left text-sm font-normal">
              {placeholder}
            </Typography>
            <Icon name="ChevronsUpDown" className="text-muted-foreground ml-auto size-4 rotate-90 cursor-pointer" />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent
        ref={popoverContentRef}
        className={cn('w-(--radix-popover-trigger-width) p-0', classNames?.popoverContent)}
        align="start"
      >
        <Command
          shouldFilter={shouldFilter}
          filter={(value, search, keywords) => {
            const normalizedSearchTerm = normalizeString(search)
            const normalizedValue = normalizeString(value)
            return normalizedValue.includes(normalizedSearchTerm) ||
              keywords?.some((kw) => normalizeString(kw).includes(normalizedSearchTerm)) ||
              keywords?.some((kw) => kw === 'all')
              ? 1
              : 0
          }}
        >
          <CommandInput
            value={search ?? searchTerm}
            placeholder="Nhập để tìm kiếm..."
            onKeyDown={handleInputKeyDown}
            onInput={(e) => {
              e.stopPropagation()
              setSearchTerm(e.currentTarget.value)
              if (typeof onInput === 'function') onInput(String(e.currentTarget.value))
            }}
          />
          <CommandList ref={refCallback}>
            {loading ? (
              <CommandLoading className="flex items-center justify-center p-6">
                <Spinner />
              </CommandLoading>
            ) : (
              <Fragment>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {canSelectAll && (
                    <CommandItem
                      key="all"
                      disabled={datalist?.length === 0}
                      keywords={['all']}
                      onSelect={toggleAll}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                          selectedValues?.length === datalist?.length && datalist?.length > 0
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <Icon name="Check" className="size-3!" />
                      </div>
                      <Typography variant="small">(Chọn tất cả)</Typography>
                    </CommandItem>
                  )}
                  {before > 0 && <CommandItem disabled style={{ width: '100%', height: before }} />}
                  {virtualItems.map((item) => {
                    const option = datalist[item.index]
                    const isSelected = selectedValues.includes(option?.[valueField])
                    return (
                      <CommandItem
                        key={item.key}
                        data-index={item.index}
                        value={String(option[valueField])}
                        keywords={[String(option[labelField])]}
                        disabled={option.disabled}
                        onSelect={() => toggleOption(option[valueField])}
                      >
                        <Checkbox checked={isSelected} />
                        <Typography variant="small">{String(option?.[labelField])}</Typography>
                      </CommandItem>
                    )
                  })}
                  {after > 0 && <CommandItem disabled style={{ width: '100%', height: after }} />}
                </CommandGroup>
              </Fragment>
            )}
          </CommandList>
          <CommandSeparator />
          <CommandGroup>
            <div className="flex items-center justify-between gap-x-1">
              {Array.isArray(selectedValues) && selectedValues?.length > 0 && (
                <Fragment>
                  <CommandItem
                    onClick={(e) => e.stopPropagation()}
                    onSelect={handleClear}
                    className="flex-1 cursor-pointer justify-center"
                  >
                    Đặt lại
                  </CommandItem>
                  <Separator orientation="vertical" className="flex h-full min-h-6" />
                </Fragment>
              )}
              <CommandItem
                onSelect={() => setIsPopoverOpen(false)}
                className="max-w-full flex-1 cursor-pointer justify-center"
              >
                Đóng
              </CommandItem>
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={cn(
        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border transition-all duration-100',
        checked ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
      )}
    >
      <Icon name="Check" className="size-3!" />
    </div>
  )
}

MultiSelect.displayName = 'MultiSelect'
