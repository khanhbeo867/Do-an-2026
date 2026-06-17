import tw from '@/lib/tw'
import { cn } from '@/lib/utils'

import { useCallback, useState } from 'react'
import { Badge } from '../ui/badge'
import { Icon } from '../ui/icon'
import { Input } from '../ui/input'
import { Typography } from '../ui/typography'

/**
 * used for identifying the split char and use will pasting
 */
const SPLITTER_REGEX = /[\n#?=&\t,./-]+/

/**
 * used for formatting the pasted element for the correct value format to be added
 */
const FORMATTING_REGEX = /^[^a-zA-Z0-9]*$/g

export interface TagsInputProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string[]
  onValueChange: (value: string[]) => any
  placeholder?: string
  maxItems?: number
  minItems?: number
}

export const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  placeholder,
  onValueChange,
  maxItems = Infinity,
  minItems = 0,
  className,
  dir,
  ...props
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [inputValue, setInputValue] = useState<string>('')
  const [isValueSelected, setIsValueSelected] = useState<boolean>(false)
  const [selectedValue, setSelectedValue] = useState<string>('')

  const onValueChangeHandler = useCallback(
    (val: string) => {
      if (value?.length < maxItems) onValueChange(Array.from(new Set([...value, val])))
    },
    [value]
  )

  const removeValue = useCallback(
    (val: string) => {
      if (value.includes(val) && value?.length > minItems) {
        onValueChange(value.filter((item) => item !== val))
      }
    },
    [value]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const tags = e.clipboardData.getData('text').split(SPLITTER_REGEX)
      const newValue = [...value]
      tags.forEach((item) => {
        const parsedItem = item.replaceAll(FORMATTING_REGEX, '').trim()
        if (parsedItem?.length > 0 && !newValue.includes(parsedItem) && newValue?.length < maxItems) {
          newValue.push(parsedItem)
        }
      })
      onValueChange(newValue)
      setInputValue('')
    },
    [value]
  )

  const handleSelect = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      const target = e.currentTarget
      const selection = target.value.substring(target.selectionStart ?? 0, target.selectionEnd ?? 0)

      setSelectedValue(selection)
      setIsValueSelected(selection === inputValue)
    },
    [inputValue]
  )

  // ? suggest : a refactor rather then using a useEffect
  const shouldDisableItem = value?.length - 1 < minItems
  const shouldDisableInput = value?.length + 1 > maxItems

  const navigateLeft = useCallback(
    (target: HTMLInputElement) => {
      if (value.length === 0) return
      if (dir === 'rtl') {
        if (activeIndex !== -1) setActiveIndex((prev) => (prev + 1 > value.length - 1 ? -1 : prev + 1))
      } else {
        if (target.selectionStart === 0) setActiveIndex((prev) => (prev - 1 < 0 ? value.length - 1 : prev - 1))
      }
    },
    [dir, value, activeIndex]
  )

  const navigateRight = useCallback(
    (target: HTMLInputElement) => {
      if (value.length === 0) return
      if (dir === 'rtl') {
        if (target.selectionStart === 0) setActiveIndex((prev) => (prev - 1 < 0 ? value.length - 1 : prev - 1))
      } else {
        if (activeIndex !== -1) setActiveIndex((prev) => (prev + 1 > value.length - 1 ? -1 : prev + 1))
      }
    },
    [dir, value, activeIndex]
  )

  const handleDeleteKey = useCallback(
    (target: HTMLInputElement) => {
      if (value.length === 0) return
      if (activeIndex !== -1 && activeIndex < value.length) {
        removeValue(value[activeIndex])
        setActiveIndex((prev) => (prev - 1 <= 0 ? (value.length - 1 === 0 ? -1 : 0) : prev - 1))
        return
      }
      if (target.selectionStart === 0 && (selectedValue === inputValue || isValueSelected)) {
        removeValue(value[value.length - 1])
      }
    },
    [value, activeIndex, selectedValue, inputValue, isValueSelected, removeValue]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const target = e.currentTarget
    switch (e.key) {
      case 'ArrowLeft':
        navigateLeft(target)
        break
      case 'ArrowRight':
        navigateRight(target)
        break
      case 'Backspace':
      case 'Delete':
        handleDeleteKey(target)
        break
      case 'Escape':
        setActiveIndex(activeIndex === -1 ? value.length - 1 : -1)
        break
      case 'Enter':
        if (inputValue.trim() !== '') {
          e.preventDefault()
          onValueChangeHandler(inputValue)
          setInputValue('')
        }
        break
    }
  }

  const mousePreventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value)
  }, [])

  return (
    <div
      className={cn(
        className,
        'flex w-full flex-wrap items-center gap-1 overflow-hidden rounded-md border bg-background p-1 shadow-xs duration-200 aria-invalid:border-destructive aria-invalid:focus-within:border-destructive',
        activeIndex === -1 && 'focus-within:border-ring'
      )}
      {...(props as React.ComponentProps<'div'>)}
    >
      {Array.isArray(value) && (
        <div className="flex items-center gap-1">
          {value.map((item, index) => (
            <Badge
              key={item}
              tabIndex={activeIndex !== -1 ? 0 : activeIndex}
              variant="secondary"
              aria-disabled={shouldDisableItem}
              data-active={activeIndex === index}
              aria-current={inputValue === item}
              className={cn(
                'relative flex items-center gap-2 truncate rounded px-1',
                'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-[current=true]:animate-[pulse_1s_ease_forwards]',
                'data-[active=true]:ring-2 data-[active=true]:ring-primary'
              )}
            >
              <Typography variant="small" className="align-middle leading-none">
                {item}
              </Typography>
              <RemoveButton
                type="button"
                aria-label={`Remove ${item} option`}
                aria-roledescription="button to remove option"
                disabled={shouldDisableItem}
                onMouseDown={mousePreventDefault}
                onClick={() => removeValue(item)}
              >
                <Typography as="span" className="sr-only">
                  Remove {item} option
                </Typography>
                <Icon name="X" size={14} />
              </RemoveButton>
            </Badge>
          ))}
        </div>
      )}
      <Input
        tabIndex={0}
        aria-label="Tags input"
        disabled={shouldDisableInput}
        placeholder={placeholder}
        value={inputValue}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onSelect={handleSelect}
        onChange={activeIndex === -1 ? handleChange : undefined}
        onFocus={() => setActiveIndex(-1)}
        className={cn(
          'h-max min-w-fit flex-1 border-none px-1 shadow-none outline-0 placeholder:text-muted-foreground focus-visible:border-0 focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0',
          activeIndex !== -1 && 'caret-transparent'
        )}
      />
    </div>
  )
}

const RemoveButton = tw.button`disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors duration-200 aria-disabled:text-muted-foreground`

TagsInput.displayName = 'TagsInput'
