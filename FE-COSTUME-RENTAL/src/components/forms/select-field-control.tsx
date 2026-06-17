import { cn } from '@/lib/utils'
import type { SelectRootProps } from '@base-ui/react'
import type { Group } from '@base-ui/react/internals/resolveValueLabel'
import type { AnyFieldApi } from '@tanstack/react-form'
import { sortBy } from 'lodash-es'
import React, { Fragment } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export type SelectFieldControlProps<T> = Pick<React.ComponentProps<typeof Field>, 'orientation'> & {
  field: AnyFieldApi
  items: ReadonlyArray<T & { sortOrder?: number }> | Array<{ label: React.ReactNode; items: ReadonlyArray<T> }>
  disabled?: boolean
  multiple?: boolean
  label?: string
  classNames?: Partial<{
    field: string
    select: string
  }>
  labelField: keyof T
  valueField: keyof T
  description?: string
  placeholder?: React.InputHTMLAttributes<HTMLInputElement>['placeholder']
  renderValue?: React.ComponentProps<typeof SelectValue>['render']
  renderItem?: (item: T) => React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
}

function SelectFieldControl<T>({
  items,
  multiple = false,
  field,
  label,
  description,
  orientation,
  placeholder,
  labelField,
  valueField,
  classNames,
  disabled,
  renderValue,
  renderItem,
}: SelectFieldControlProps<T>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field className={cn(classNames?.field)} orientation={orientation}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Select
        items={items as SelectRootProps<T>['items']}
        itemToStringLabel={(item) => item[labelField]}
        itemToStringValue={(item) => item[valueField]}
        isItemEqualToValue={(itemValue, value) => itemValue[valueField] === value[valueField]}
        disabled={disabled}
        value={
          Array.isArray(field.state.value) ? sortBy(field.state.value, (item) => item?.sortOrder) : field.state.value
        }
        onValueChange={field.handleChange}
        multiple={multiple}
      >
        <SelectTrigger className={cn('w-full', classNames?.select)}>
          <SelectValue render={renderValue} placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {Array.isArray(items) &&
            items.map((item, index) =>
              Array.isArray((item as Group<T>).items) ? (
                <Fragment key={`${field.name}-group-${index}`}>
                  <SelectGroup>
                    {item.label && <SelectLabel>{item.label}</SelectLabel>}
                    {(item as Group<T>).items.map((opt, optIdx) => (
                      <SelectItem
                        key={`${field.name}-group-${index}-${optIdx}`}
                        value={opt}
                        {...(typeof renderItem === 'function'
                          ? { render: renderItem(opt) }
                          : { children: opt[labelField] as React.ReactNode })}
                      />
                    ))}
                  </SelectGroup>
                  {index < items.length - 1 && <SelectSeparator />}
                </Fragment>
              ) : (
                <SelectItem
                  key={`${field.name}-item-${String(index)}`}
                  value={item as T}
                  {...(typeof renderItem === 'function'
                    ? { render: renderItem(item as T) }
                    : { children: (item as T)?.[labelField] as React.ReactNode })}
                />
              )
            )}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default SelectFieldControl
