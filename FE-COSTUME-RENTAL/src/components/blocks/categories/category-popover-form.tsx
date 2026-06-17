import {
  GET_COSTUME_CATEGORY_QUERY_KEY,
  useCreateOrUpdateCategoryMutation,
} from '@/apis/category/hooks/use-category-request'
import { createCategorySchema } from '@/apis/category/schemas/create-category.schema'
import type { ICategory } from '@/apis/category/types'
import { CommonActions, ItemType } from '@/common/constants/enums'
import { standardizeName } from '@/common/helpers/standardize-name'
import InputFieldControl from '@/components/forms/input-field-control'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { toast } from 'sonner'
import { getCategoryTypeName } from './utils'

const CategoryPopoverForm: React.FC<{
  type: ItemType
  action: CommonActions.CREATE | CommonActions.UPDATE
  defaultValues?: ICategory
  render: React.ComponentProps<typeof PopoverTrigger>['render']
}> = ({ type, action, defaultValues = { name: '', type: type }, render }) => {
  const [open, setOpen] = useState<boolean>(false)
  const { mutateAsync, isPending } = useCreateOrUpdateCategoryMutation(action, GET_COSTUME_CATEGORY_QUERY_KEY)

  const defaultFormValues = action === CommonActions.UPDATE && defaultValues ? defaultValues : { name: '', type }

  const form = useForm({
    defaultValues: defaultFormValues,
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync({ ...value, name: standardizeName(value.name) })
        toast.success('Thêm danh mục thành công')
        setOpen(false)
        formApi.reset()
      } catch (error) {
        toast.error('Đã có lỗi xảy ra! Vui lòng thử lại sau')
      }
    },
    validators: { onSubmit: createCategorySchema },
  })

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={render} />
      <PopoverContent className="w-fit" align="end">
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldLegend>Tạo mới danh mục {getCategoryTypeName(type)}</FieldLegend>
            <FieldDescription>
              Nhập các thông tin vào biểu phía dưới để thêm mới 1 danh mục {getCategoryTypeName(type)}
            </FieldDescription>
            <FieldGroup>
              <form.Field name="name">
                {(field) => {
                  return (
                    <InputFieldControl
                      field={field}
                      label="Tên danh mục"
                      placeholder="Tên danh mục không quá 6 ký tự."
                      description="Tên danh mục nên ngắn gọn rõ nghĩa và dễ nhớ"
                    />
                  )
                }}
              </form.Field>
              <Field orientation="horizontal" className="flex-row-reverse">
                <Button type="button" variant="secondary" disabled={isPending}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="group/submit-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Spinner className="hidden group-disabled/submit-btn:inline-block" />
                  Xác nhận
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export default CategoryPopoverForm
