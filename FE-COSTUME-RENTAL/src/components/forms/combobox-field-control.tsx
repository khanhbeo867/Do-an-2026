import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import type { ComboboxRoot, ComboboxRootProps } from '@base-ui/react'
import type { Group } from '@base-ui/react/internals/resolveValueLabel'
import type { AnyFieldApi } from '@tanstack/react-form'
import { hasIn, isNil } from 'lodash-es'
import React from 'react'

type ComboboxFieldControlProps<T = Record<string, unknown>> = Pick<React.ComponentProps<typeof Field>, 'orientation'> &
  Partial<ComboboxRoot.Props<T, boolean>> & {
    field: AnyFieldApi
    placeholder?: string
    description?: string
    label?: string
    labelField: keyof T
    valueField: keyof T
    items: ComboboxRootProps<T>['items']
    classNames?: Partial<{
      field: string
      input: string
    }>
    renderItem?: (item: T) => React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
  }

export function ComboboxFieldControl<T>({
  field,
  items,
  label,
  description,
  labelField,
  valueField,
  placeholder,
  multiple,
  orientation = 'vertical',
  classNames,
  renderItem,
  ...props
}: ComboboxFieldControlProps<T>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field data-invalid={isInvalid} orientation={orientation} className={classNames?.field}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Combobox
        {...props}
        name={field.name}
        items={items}
        multiple={multiple}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        itemToStringLabel={(item) =>
          hasIn(item, labelField) && !isNil(item[labelField]) ? String(item[labelField]) : ''
        }
        itemToStringValue={(item) =>
          hasIn(item, valueField) && !isNil(item[valueField]) ? String(item[valueField]) : ''
        }
        isItemEqualToValue={(itemValue, value) => itemValue[valueField] === value[valueField]}
      >
        <ComboboxInput placeholder={placeholder ?? 'Nhập để tìm kiếm'} className={classNames?.input} showClear={true} />
        <ComboboxContent>
          <ComboboxEmpty>Không có kết quả phù hợp</ComboboxEmpty>
          <ComboboxList>
            {(option, index) => {
              if (Array.isArray((option as Group<T>).items))
                return (
                  <ComboboxGroup key={`${field.name}-group-${index}`} items={option.items}>
                    {option.label && <ComboboxLabel>{option.label}</ComboboxLabel>}
                    <ComboboxCollection key={option.label}>
                      {(opt) => (
                        <ComboboxItem
                          key={opt[valueField]}
                          value={opt}
                          {...(typeof renderItem === 'function'
                            ? { render: renderItem(opt) }
                            : { children: opt[labelField] as React.ReactNode })}
                        />
                      )}
                    </ComboboxCollection>
                  </ComboboxGroup>
                )
              else
                return (
                  <ComboboxItem
                    key={`${field.name}-item-${index}`}
                    value={option}
                    {...(typeof renderItem === 'function'
                      ? { render: renderItem(option) }
                      : { children: option[labelField] as React.ReactNode })}
                  />
                )
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
