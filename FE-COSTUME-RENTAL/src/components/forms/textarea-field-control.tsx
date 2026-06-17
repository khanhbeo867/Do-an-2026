import { cn } from '@/lib/utils'
import type { AnyFieldApi } from '@tanstack/react-form'
import React from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field'
import { Textarea } from '../ui/textarea'

type TextareaFieldControlProps = Pick<React.ComponentProps<typeof Field>, 'orientation'> &
  Omit<React.ComponentProps<'textarea'>, 'className'> & {
    field: AnyFieldApi
    label?: string
    classNames?: Partial<{
      field: string
      textarea: string
    }>
    description?: string
  }

const TextareaFieldControl: React.FC<TextareaFieldControlProps> = ({
  field,
  label,
  description,
  orientation,
  classNames,
  ...props
}) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field className={cn(classNames?.field)} orientation={orientation}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Textarea
        {...props}
        id={field.name}
        aria-invalid={isInvalid}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        className={cn(classNames?.textarea)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default TextareaFieldControl
