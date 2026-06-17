import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Input } from '../ui/input'

export type DebouncedInputProps = {
  onChange: (value: any) => void
  debounce?: number
} & Omit<React.ComponentProps<'input'>, 'onChange'>

export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value,
  onChange,
  debounce = 200,
  className,
  ...props
}) => {
  const [_value, setValue] = useState(value)

  useEffect(() => {
    setValue(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(_value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [_value])

  return (
    <Input
      {...props}
      value={_value}
      onChange={(e) => setValue(e.target.value)}
      className={cn(
        'border-none text-xs shadow-none ring-0 ring-offset-transparent duration-0 outline-none placeholder:text-xs! focus-visible:ring-0',
        className
      )}
    />
  )
}
