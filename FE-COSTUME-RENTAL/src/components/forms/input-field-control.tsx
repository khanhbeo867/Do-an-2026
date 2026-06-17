import { cn } from '@/lib/utils'
import type { AnyFieldApi } from '@tanstack/react-form'
import React, { useState } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field'
import { Icon } from '../ui/icon'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../ui/input-group'

type InputFieldControlProps = Pick<React.ComponentProps<typeof Field>, 'orientation'> &
  Omit<React.ComponentProps<'input'>, 'type' | 'className'> & {
    field: AnyFieldApi
    label?: string
    classNames?: Partial<{
      field: string
      input: string
    }>
    description?: string
    type?: Extract<
      React.HTMLInputTypeAttribute,
      'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'time' | 'date'
    >
  }

const InputFieldControl: React.FC<InputFieldControlProps> = ({
  field,
  label,
  description,
  type = 'text',
  orientation,
  classNames,
  ...props
}) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const [inputType, setInputType] = useState<InputFieldControlProps['type']>(type)

  return (
    <Field className={cn(classNames?.field)} orientation={orientation}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <InputGroup>
        <InputGroupInput
          {...props}
          type={inputType}
          id={field.name}
          aria-invalid={isInvalid}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => {
            if (inputType === 'number') field.handleChange(+e.target.value)
            else field.handleChange(e.target.value)
          }}
          className={cn('autofill:bg-input/50!', classNames?.input)}
        />
        {type === 'password' && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={() => setInputType((prev) => (prev === 'password' ? 'text' : 'password'))}>
              <Icon name={inputType === 'password' ? 'Eye' : 'EyeOff'} />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default InputFieldControl
