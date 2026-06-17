import { useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import { useUploadImagesMutation } from '@/apis/image/hooks/use-image-request'
import { uploadImagesSchema, type TUploadImagesValues } from '@/apis/image/schemas/upload-images.schema'
import ImageFieldControl from '@/components/forms/image-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useForm } from '@tanstack/react-form'
import React, { useMemo } from 'react'
import { toast } from 'sonner'

type UploadImageFormProps =
  | { modal?: false; onModalChange?: never }
  | { modal: true; onModalChange: React.Dispatch<React.SetStateAction<boolean>> }

const UploadImageForm: React.FC<UploadImageFormProps> = (props) => {
  const { data: categories } = useGetCategoriesQuery()
  const { mutateAsync: uploadAsync, isPending } = useUploadImagesMutation()

  const handleUpload = async (data: TUploadImagesValues) => {
    try {
      await uploadAsync(data)

      form.reset()
      toast.success('Tải lên hình ảnh thành công', { id: 'upload-images' })
      if (typeof props.onModalChange === 'function') props.onModalChange(false)
    } catch (e) {
      console.error('Error uploading images:', e)
      toast.error('Lỗi tải lên hình ảnh', { id: 'upload-images' })
    }
  }

  const form = useForm({
    defaultValues: {
      files: [] as File[],
      category: null,
    } as unknown as TUploadImagesValues,
    validators: {
      onSubmit: uploadImagesSchema as any,
    },
    onSubmit: ({ value }) => handleUpload(value),
  })

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  const categoryOptions = useMemo(() => {
    if (!Array.isArray(categories)) return []
    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }))
  }, [categories])

  return (
    <form onSubmit={handleSubmit}>
      <FieldSet>
        <FieldLegend>Tải lên hình ảnh</FieldLegend>
        <FieldDescription>Chọn hình ảnh để tải lên cho danh mục</FieldDescription>
        <FieldGroup className="max-h-[70vh] overflow-auto">
          <form.Field name="category">
            {(field) => (
              <SelectFieldControl
                field={field}
                items={categoryOptions}
                labelField="label"
                valueField="value"
                placeholder="Chọn danh mục"
              />
            )}
          </form.Field>
          <form.Field name="files">
            {(field) => {
              return <ImageFieldControl field={field} multiple={true} orientation={undefined} />
            }}
          </form.Field>
        </FieldGroup>
        <Field orientation="horizontal" className="justify-end">
          {props.modal && (
            <Button
              variant="secondary"
              onClick={() => {
                form.reset()
                if (typeof props.onModalChange === 'function') props.onModalChange(false)
              }}
            >
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner />} Tải lên
          </Button>
        </Field>
      </FieldSet>
    </form>
  )
}

export default UploadImageForm
