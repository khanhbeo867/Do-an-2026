import useCopyToClipboard from '@/hooks/use-copy-to-clipboard'

import { Tooltip } from '@/components/shared/tooltip'
import { Button, buttonVariants } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useForm } from '@tanstack/react-form'
import type { Editor } from '@tiptap/react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { object, string, type infer as Infer } from 'zod'

type FormValue = Infer<typeof LinkSchema>

const LinkSchema = object({
  href: string().url().optional(),
})

const BubbleMenu: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [copyToClipboard] = useCopyToClipboard()
  const form = useForm({
    validators: {},
    onSubmit: ({ value }) => handleEditLink(value),
    defaultValues: { href: editor.getAttributes('link').href },
  })
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)

  useEffect(() => {
    form.reset({ href: editor.getAttributes('link').href })
  }, [editor])

  const handleEditLink = ({ href }: FormValue) => {
    if (href) editor.commands.setLink({ href: href })
    setPopoverOpen(!popoverOpen)
  }

  const handleCopyLinkToClipboard = () => {
    const value = form.getFieldValue('href')
    if (value) {
      copyToClipboard(value)
      toast.info('Đã sao chép vào bộ nhớ tạm')
    }
  }

  return (
    <TiptapBubbleMenu
      editor={editor}
      className="flex w-[256px] flex-col gap-2 rounded-md border bg-background py-2 shadow-2xl"
      style={{ zIndex: 10, transitionDuration: '200ms' }}
      shouldShow={(props) => props.editor.isActive('link')}
    >
      <div className="flex items-center gap-x-2 px-2">
        <Icon name="Globe" className="basis-8 text-muted-foreground" />
        <a
          href={editor.getAttributes('link').href}
          target="_blank"
          className="line-clamp-1 flex-1 text-xs"
          rel="noreferrer"
        >
          {editor.getAttributes('link').href}
        </a>
      </div>
      <Separator />
      <div className="flex items-center gap-x-px px-2">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Tooltip
            message="Cập nhật"
            triggerProps={{
              render: (
                <PopoverTrigger className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}>
                  <Icon name="Pencil" />
                </PopoverTrigger>
              ),
            }}
          />
          <PopoverContent align="start" side="bottom" sideOffset={18} alignOffset={0} className="z-20 w-full max-w-sm">
            <form
              onSubmit={(e) => {
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="flex items-center gap-x-2"
            >
              <form.Field name="href">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <Input
                        name={field.name}
                        aria-invalid={isInvalid}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.currentTarget.value)}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
              {/* <InputFieldControl name='href' type='url' className='h-8' /> */}
              <Button type="submit" size="sm">
                Áp dụng
              </Button>
            </form>
          </PopoverContent>
        </Popover>

        <Tooltip
          message="Copy"
          triggerProps={{
            render: (
              <Button
                type="button"
                className="aspect-square h-8 w-8"
                variant="ghost"
                size="icon"
                onClick={handleCopyLinkToClipboard}
              >
                <Icon name="Copy" />
              </Button>
            ),
          }}
        />
        <Tooltip
          message="Unlink"
          triggerProps={{
            render: (
              <Button
                type="button"
                className="aspect-square h-8 w-8"
                variant="ghost"
                size="icon"
                onClick={() => editor.commands.unsetLink()}
              >
                <Icon name="Unlink" />
              </Button>
            ),
          }}
        />
      </div>
    </TiptapBubbleMenu>
  )
}

export default BubbleMenu
