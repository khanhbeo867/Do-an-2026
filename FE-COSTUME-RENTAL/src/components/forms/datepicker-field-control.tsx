import { cn } from '@/lib/utils'
import type { AnyFieldApi } from '@tanstack/react-form'
import { format, isValid } from 'date-fns'
import { ChevronDownIcon } from 'lucide-react'
import { Fragment } from 'react'
import { isDateRange } from 'react-day-picker'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

type TDatePickerFieldControlProps = Pick<React.ComponentProps<typeof Field>, 'orientation'> &
  Omit<React.ComponentProps<'input'>, 'type' | 'className'> & {
    field: AnyFieldApi
    label?: string
    description?: string
    classNames?: Partial<{
      field: string
      calendar: string
      trigger: string
    }>
    mode?: 'single' | 'range'
  }

export const DatePickerFieldControl: React.FC<TDatePickerFieldControlProps> = ({
  field,
  label,
  description,
  orientation,
  classNames,
  mode = 'single',
}) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field className={cn(classNames?.field)} orientation={orientation}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant={'outline'}
              data-empty={!field.state.value}
              className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
            >
              {mode === 'range' && isDateRange(field.state.value) ? (
                <Fragment>
                  {format(field.state.value.from!, 'LLL dd, y')} {' - '}
                  {format(field.state.value.to!, 'LLL dd, y')}
                </Fragment>
              ) : isValid(new Date(field.state.value)) ? (
                <Fragment>{format(field.state.value, 'PPP')}</Fragment>
              ) : (
                <span className="text-muted-foreground">Chọn ngày</span>
              )}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.state.value}
            onSelect={(value) => field.handleChange(value)}
            defaultMonth={field.state.value || new Date()}
          />
        </PopoverContent>
      </Popover>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}
