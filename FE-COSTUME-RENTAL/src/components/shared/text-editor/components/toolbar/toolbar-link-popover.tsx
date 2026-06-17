import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Typography } from '@/components/ui/typography'
import { useForm } from '@tanstack/react-form'
import React, { useState } from 'react'
import { object, string, type infer as Infer } from 'zod'
import { useEditorContext } from '../../context/editor-context'

const urlSchema = object({ url: string().url({ message: 'ns_common:editor.validations.invalid_url' }).optional() })

type UrlFormValue = Infer<typeof urlSchema>

export const LinkPopover: React.FC = () => {
  const { editor } = useEditorContext()

  const [open, setOpen] = useState<boolean>(false)

  const form = useForm({
    onSubmit: ({ value }: { value: UrlFormValue }) => handleInsertLink(value),
    validators: { onSubmit: urlSchema },
  })

  const handleInsertLink = ({ url }: UrlFormValue) => {
    if (!url) return
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    form.reset()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip
        message="Đường dẫn"
        triggerProps={{
          render: (
            <PopoverTrigger
              render={
                <Button variant="ghost" size="icon" className="aspect-square h-8 w-8">
                  <Icon name="Link" />
                </Button>
              }
            />
          ),
        }}
      />
      <PopoverContent className="w-96" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Typography className="font-medium leading-none">Chèn liên kết</Typography>
            <Typography className="text-sm text-muted-foreground">
              Chèn 1 đường liên kết vào văn bản đã chọn. Bạn cũng có thể liên kết đến địa chỉ email hoặc số điện thoại.
            </Typography>
          </div>

          <form
            className="flex items-end gap-x-2"
            onSubmit={(e) => {
              e.stopPropagation()
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Field name="url">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field className="col-span-5">
                    <FieldLabel htmlFor={field.name}>Liên kết</FieldLabel>
                    <Input
                      name={field.name}
                      id={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      placeholder="https://picsum.photos/"
                      type="url"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>
            <Button variant="default">Áp dụng</Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}
