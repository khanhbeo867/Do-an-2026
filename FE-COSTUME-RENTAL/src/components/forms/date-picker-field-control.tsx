import { cn } from '@/lib/utils'
import type { AnyFieldApi } from '@tanstack/react-form'
import { format, isValid } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

type DatePickerFieldControlProps = Pick<React.ComponentProps<typeof Field>, 'orientation'> & {
  field: AnyFieldApi
  label?: string
  description?: string
  min?: string
  classNames?: Partial<{
    field: string
    trigger: string
  }>
}

const DatePickerFieldControl: React.FC<DatePickerFieldControlProps> = ({
  field,
  label,
  description,
  min,
  orientation,
  classNames,
}) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const currentValue = typeof field.state.value === 'string' ? field.state.value : ''
  const selectedDate = currentValue ? new Date(currentValue) : undefined
  const minDate = min ? new Date(min + 'T00:00:00') : undefined

  return (
    <Field className={cn(classNames?.field)} orientation={orientation}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              id={field.name}
              aria-invalid={isInvalid}
              className={cn('w-full justify-start font-normal', classNames?.trigger)}
            >
              <CalendarIcon className="mr-2 size-4" />
              {currentValue && isValid(selectedDate)
                ? format(selectedDate!, 'dd/MM/yyyy', { locale: vi })
                : 'Chọn ngày'}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate && isValid(selectedDate) ? selectedDate : undefined}
            onSelect={(date) => {
              if (!date) return
              field.handleChange(format(date, 'yyyy-MM-dd'))
            }}
            disabled={(date) => {
              if (!minDate) return false
              return date < minDate
            }}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default DatePickerFieldControl
