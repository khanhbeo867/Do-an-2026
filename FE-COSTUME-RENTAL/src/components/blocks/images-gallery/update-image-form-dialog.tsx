import { useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import { useUpdateImageMutation } from '@/apis/image/hooks/use-image-request'
import { updateImageSchema } from '@/apis/image/schemas/update-image.schema'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { useForm, useStore } from '@tanstack/react-form'
import React, { useMemo } from 'react'
import { toast } from 'sonner'
import { usePubSubSubscription } from '.'

const UpdateImageFormDialog: React.FC = () => {
  const { mutateAsync: updateAsync, isPending } = useUpdateImageMutation()
  const { data: categories } = useGetCategoriesQuery()

  const form = useForm({
    defaultValues: updateImageSchema.safeParse(undefined).data,
    onSubmit: async ({ value, formApi }) => {
      try {
        await updateAsync({ id: value.id, file_name: value.file_name })
        formApi.reset()
        toast.success('Image updated successfully')
      } catch (error) {
        toast.error((error as Error).message)
      }
    },
    validators: { onSubmit: updateImageSchema as any },
  })

  usePubSubSubscription('image:update', (data) => {
    form.reset(data, { keepDefaultValues: true })
  })

  const currentImageId = useStore(form.store, (state) => state.values.id)

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    form.handleSubmit()
  }

  const categoryOptions = useMemo(
    () =>
      !Array.isArray(categories)
        ? []
        : categories?.map((category) => ({
            label: category?.name,
            value: category?.id,
          })),
    [categories]
  )

  return (
    <Dialog
      open={!!currentImageId || isPending}
      onOpenChange={(open) => {
        if (!open) form.reset()
      }}
    >
      <DialogContent className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldLegend>Cập nhật hình ảnh</FieldLegend>
            <FieldDescription>
              Cập nhật tên hình ảnh của bạn, giúp bạn tổ chức hình ảnh tốt hơn. Lưu ý rằng điều này sẽ không thay đổi
              URL của hình ảnh.
            </FieldDescription>
            <FieldGroup>
              <form.Field name="file_name">
                {(field) => (
                  <InputFieldControl
                    field={field}
                    label="Tên hình ảnh"
                    placeholder="Nhập tên hình ảnh"
                    description="Tên hình ảnh phải là duy nhất và chỉ có thể chứa chữ cái, số, dấu gạch ngang và dấu gạch dưới."
                  />
                )}
              </form.Field>
              <form.Field name="category">
                {(field) => (
                  <SelectFieldControl
                    field={field}
                    label="Danh mục"
                    items={categoryOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Chọn danh mục"
                    description="Vui lòng chọn danh mục cho hình ảnh của bạn."
                  />
                )}
              </form.Field>
              <Field orientation="horizontal" className="justify-end">
                <DialogClose render={<Button variant="secondary">Hủy</Button>} />
                <Button type="submit" disabled={isPending}>
                  Lưu thay đổi
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateImageFormDialog
