import { type AnyFieldApi, type Updater } from '@tanstack/react-form'
import { TagsInput } from '../shared/tags-input'
import { Field, FieldError, FieldLabel } from '../ui/field'

type TagInputFieldControlProps = {
  field: AnyFieldApi
  label?: string
  placeholder?: string
  classNames?: Partial<{
    field: string
    input: string
  }>
  orientation?: React.ComponentProps<typeof Field>['orientation']
}

export function TagsInputFieldControl({
  field,
  label,
  placeholder,
  classNames,
  orientation,
}: TagInputFieldControlProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field className={classNames?.field} orientation={orientation}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <TagsInput
        id={field.name}
        value={field.state.value}
        onValueChange={field.handleChange as (updater: Updater<string[]>) => void}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        className={classNames?.input}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
