import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SelectIconProps, SelectTriggerProps } from '@base-ui/react'

export type DropdownSelectProps<T extends Record<string, any>> = {
  openState?: boolean
  onValueChange?: (value: string) => any | AnonymousFunction
  placeholder?: string
  selectProps?: Partial<SelectIconProps>
  selectTriggerProps?: Partial<SelectTriggerProps>
  selectContentProps?: React.ComponentProps<typeof SelectContent>
  datalist: Array<T>
  labelField: keyof T & string
  valueField: keyof T & string
}

export const DropdownSelect = <T extends Record<string, any>>({
  datalist: data,
  labelField,
  valueField,
  placeholder = 'Select',
  selectProps,
  selectTriggerProps,
  selectContentProps,
}: DropdownSelectProps<T>) => {
  return (
    <Select {...selectProps}>
      <SelectTrigger {...selectTriggerProps}>
        {selectTriggerProps?.children}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent {...selectContentProps}>
        <SelectGroup>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((option, index) => (
              <SelectItem key={index} value={String(option[valueField])}>
                {String(option[labelField])}
              </SelectItem>
            ))
          ) : (
            <SelectItem
              value={null}
              disabled
              className="flex items-center justify-center text-center text-xs font-medium"
            >
              No option
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
