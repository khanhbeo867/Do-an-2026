import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldLabel } from '@/components/ui/field'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import React from 'react'
import { number, object, string, type infer as Infer } from 'zod'
import { useEditorContext } from '../../context/editor-context'

const tablePresetSchema = object({
  rows: number({ message: 'ns_common:editor.validations.' })
    .or(string({ message: 'Vui lòng nhập số hàng' }))
    .transform((value) => +value)
    .refine((value) => value >= 1, { message: 'Số hàng phải lớn hơn hoặc bằng 1' }),
  cols: number({ message: 'Vui lòng nhập số hàng' })
    .or(string({ message: 'Vui lòng nhập số cột' }))
    .transform((value) => +value)
    .refine((value) => value >= 1, { message: 'Số cột phải lớn hơn hoặc bằng 1' }),
})

type FormValue = Infer<typeof tablePresetSchema>

const TableDropdownMenu: React.FC = () => {
  const { editor } = useEditorContext()
  const form = useForm({
    validators: { onSubmit: tablePresetSchema as any },
    onSubmit: ({ value }) => handleInsertTable(value),
    defaultValues: { rows: 2, cols: 2 },
  })

  function handleInsertTable({ rows, cols }: FormValue) {
    editor.chain().focus().insertTable({ cols: +cols, rows: +rows }).run()
  }

  return (
    <DropdownMenu>
      <Tooltip
        message="Chèn bảng"
        triggerProps={{
          render: (
            <DropdownMenuTrigger
              render={
                <Button size="icon" className="h-8 w-8" variant="ghost" type="button">
                  <Icon name="Table" />
                </Button>
              }
            />
          ),
        }}
      />
      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tùy chọn bảng</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Chèn bảng</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="p-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="text-base font-medium leading-none">Tùy chọn bảng</h4>
                    <p className="text-sm text-muted-foreground">Chọn số số cột và hàng để tạo bảng</p>
                  </div>

                  <form
                    className="flex flex-col items-stretch gap-y-6"
                    onSubmit={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      form.handleSubmit()
                    }}
                  >
                    <form.Field name="rows">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field>
                            <FieldLabel>Số hàng</FieldLabel>
                            <Input
                              name={field.name}
                              id={field.name}
                              type="number"
                              value={field.state.value}
                              aria-invalid={isInvalid}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(+e.currentTarget.value)}
                            />
                          </Field>
                        )
                      }}
                    </form.Field>
                    <form.Field name="cols">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field>
                            <FieldLabel>Số cột</FieldLabel>
                            <Input
                              name={field.name}
                              id={field.name}
                              type="number"
                              value={field.state.value}
                              aria-invalid={isInvalid}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(+e.currentTarget.value)}
                            />
                          </Field>
                        )
                      }}
                    </form.Field>

                    <Button type="submit" size="sm" className="gap-x-2">
                      <Icon name="CirclePlus" /> Tạo bảng
                    </Button>
                  </form>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-x-2" onClick={() => editor.chain().focus().addRowBefore().run()}>
            <Icon name="Plus" />
            Chèn hàng bên dưới
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-x-2" onClick={() => editor.chain().focus().addRowBefore().run()}>
            <Icon name="Plus" />
            Chèn hàng bên trên
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-x-2" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <Icon name="Plus" />
            Chèn cột bên trái
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-x-2" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <Icon name="Plus" />
            Chèn cột bên phải
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-x-2" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Icon name="Trash2" />
            Xóa hàng
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-x-2" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Icon name="Trash2" />
            Xóa cột
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-x-2" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Icon name="Trash2" />
            Xóa bảng
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TableDropdownMenu
