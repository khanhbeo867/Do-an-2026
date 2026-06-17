// @ts-nocheck

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import tw from '@/lib/tw'
import React, { Fragment, useId, useState } from 'react'

import { Tooltip } from '@/components/shared/tooltip'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { useForm } from '@tanstack/react-form'
import { object, string } from 'zod'
import { useEditorContext } from '../../context/editor-context'

const uploadSchema = object({
  url: string().nonempty().url('Invalid image URL').optional(),
})

const ImageDropdown: React.FC = () => {
  const { editor } = useEditorContext()
  const dialogTriggerId = useId()

  const form = useForm({
    defaultValues: { url: '' },
    onSubmit: ({ value }) => {
      editor.commands.setImage({ src: value.url, alt: 'Image' })
      form.reset()
      setDialogOpen(false)
    },
    validators: { onSubmit: uploadSchema as any },
  })
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  return (
    <Fragment>
      <DropdownMenu>
        <Tooltip
          message="Chèn ảnh"
          triggerProps={{
            render: (
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="aspect-square h-8 w-8">
                    <Icon name="ImagePlus" />
                  </Button>
                }
              />
            ),
          }}
        />
        <DropdownMenuContent align="end" className="w-fit">
          <DropdownMenuItem
            role="button"
            nativeButton={false}
            render={
              <Label
                htmlFor="image-upload"
                className="flex items-center gap-x-2 font-normal"
                onClick={() => {
                  editor?.chain().focus().insertImagePlaceholder().run()
                }}
              >
                <Icon name="Upload" /> Chọn ảnh từ thiết bị
              </Label>
            }
          />
          <DropdownMenuItem
            className="gap-x-2"
            render={
              <label htmlFor={dialogTriggerId}>
                <Icon name="Link2" /> Chèn ảnh từ URL
              </label>
            }
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger id={dialogTriggerId} className="hidden" />
        <DialogContent className="items-stretch">
          <DialogHeader className="text-left">Chèn hình ảnh</DialogHeader>
          <FormDialog
            onSubmit={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <Button type="submit" onClick={(e) => e.stopPropagation()}>
              Áp dụng
            </Button>
          </FormDialog>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}

const FormDialog = tw.form`flex flex-col items-stretch gap-y-6 w-full`

export default ImageDropdown
