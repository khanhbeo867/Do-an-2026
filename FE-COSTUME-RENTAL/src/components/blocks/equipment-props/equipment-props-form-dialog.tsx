import { GET_PROPS_CATEGORY_QUERY_KEY, useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import type { ICategory } from '@/apis/category/types'
import { type TCreateCostumeValues } from '@/apis/costume/schemas/create-costume.schema'
import type { ICostume } from '@/apis/costume/types'
import { useCreateOrUpdatePropsMutation } from '@/apis/equipment-props/hooks/use-equipment-props-request'
import {
  createEquipmentPropsSchema,
  type TCreateEquipmentPropsSchema,
  type TCreateEquipmentPropsValues,
} from '@/apis/equipment-props/schemas/create-equipment-props.schema'
import {
  updateEquipmentPropsSchema,
  type TUpdateEquipmentPropsSchema,
} from '@/apis/equipment-props/schemas/update-equipment-props.schema'
import type { IImage } from '@/apis/image/types'
import { DEFAULT_PROPS_DESCRIPTION } from '@/assets/data/props-description'
import { CommonActions, ItemType } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { standardizeName } from '@/common/helpers/standardize-name'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl, { type SelectFieldControlProps } from '@/components/forms/select-field-control'
import Image from '@/components/shared/image'
import { TagsInput } from '@/components/shared/tags-input'
import { Editor } from '@/components/shared/text-editor'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { typographyVariants } from '@/components/ui/typography'
import { usePageEventContext } from '@/contexts/event-context'
import { useForm, useStore, type Updater } from '@tanstack/react-form'
import { CircleFadingPlusIcon, ImageIcon, ImagePlusIcon, XIcon } from 'lucide-react'
import React, { useEffect, useId, useRef, useState } from 'react'
import CategoryPopoverForm from '../categories/category-popover-form'
import ImagesGallary, { IMAGE_SELECTION_SUBMIT_BTN_ID } from '../images-gallery/images-gallery-select'

const DEFAULT_FORM_VALUES = {
  name: '',
  category: undefined,
  description: undefined,
  rental_price_per_day: undefined,
  unit: '',
  images: [],
  hashtags: [],
}

type TDialogAction = CommonActions.CREATE | CommonActions.UPDATE | 'none'

const CostumeFormDialog: React.FC = () => {
  const { event$ } = usePageEventContext()
  const [open, setOpen] = useState<boolean>(false)
  const [action, setAction] = useState<TDialogAction>('none')
  const { data: categories } = useGetCategoriesQuery(GET_PROPS_CATEGORY_QUERY_KEY)
  const mutation = useCreateOrUpdatePropsMutation(action)
  const formSchemaRef = useRef<TCreateEquipmentPropsSchema | TUpdateEquipmentPropsSchema | undefined>(undefined)
  const editorRef = useRef<{
    getHTML: () => string
    isEmpty: () => boolean
  }>(null)

  const form = useForm({
    defaultValues: DEFAULT_FORM_VALUES as unknown as TCreateEquipmentPropsValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        ...value,
        description: editorRef.current?.getHTML(),
      })
      setAction('none')
      setOpen(false)
    },
    validators: { onSubmit: formSchemaRef.current as any },
  })

  const submitButtonId = useId()

  event$.useSubscription(
    (e: { action: CommonActions.CREATE; payload: never } | { action: CommonActions.UPDATE; payload: ICostume }) => {
      if (e.action !== CommonActions.CREATE && e.action !== CommonActions.UPDATE) {
        form.reset()
        setAction('none')
        setOpen(false)
        return
      }
      setOpen(true)
      if (e.action === CommonActions.CREATE) {
        setAction(CommonActions.CREATE)
        formSchemaRef.current = createEquipmentPropsSchema
        form.reset()
      } else {
        setAction(CommonActions.UPDATE)
        formSchemaRef.current = updateEquipmentPropsSchema
        form.reset(e.payload as any, { keepDefaultValues: true })
      }
    }
  )

  const selectedImages = useStore(form.store, (state) => state.values.images)

  useEffect(() => {
    form.setFieldValue('description', editorRef.current?.getHTML() ?? '')
  }, [editorRef.current?.getHTML()])

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    form.handleSubmit()
  }

  const FormField = form.Field

  return (
    <>
      {/* Form Dialog */}
      <Dialog open={open && action !== 'none'} onOpenChange={setOpen}>
        <DialogContent className="rounded-none h-screen overflow-auto w-screen bg-muted">
          <DialogHeader className="flex-row sticky top-0 backdrop-blur-md px-6 pt-6">
            <DialogTitle className={typographyVariants({ variant: 'h2' })}>
              {action === CommonActions.CREATE ? 'Tạo mới đạo cụ' : 'Cập nhật đạo cụ'}
            </DialogTitle>
            <div className="ml-auto flex items-center gap-x-2">
              <DialogClose
                render={
                  <Button type="button" variant="secondary">
                    Đóng
                  </Button>
                }
              />
              <label htmlFor={submitButtonId} className={buttonVariants()}>
                Lưu lại
              </label>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-6 gap-6 px-6 pb-6 max-w-7xl mx-auto">
            {/* Base Info */}
            <Card className="col-span-full lg:col-span-2">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Thông tin đạo cụ</FieldLegend>
                  <FieldGroup>
                    <FormField
                      name="name"
                      listeners={{
                        onChange: ({ value }: { value: string }) => form.setFieldValue('name', standardizeName(value)),
                        onChangeDebounceMs: 200,
                      }}
                    >
                      {(field) => {
                        return (
                          <InputFieldControl
                            field={field}
                            label="Tên đạo cụ"
                            placeholder='Ví dụ: "Đạo cụ biểu diễn"'
                            classNames={{ field: 'col-span-2' }}
                          />
                        )
                      }}
                    </FormField>
                    <FormField name="hashtags">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field className="col-span-2">
                            <FieldLabel htmlFor={field.name}>Hashtags</FieldLabel>
                            <TagsInput
                              value={field.state.value}
                              onValueChange={field.handleChange as (updater: Updater<string[]>) => void}
                              onBlur={field.handleBlur}
                              placeholder="#Daocubiedien"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        )
                      }}
                    </FormField>
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Category */}
            <Card className="col-span-full lg:col-span-4">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Danh mục</FieldLegend>
                  <FieldGroup>
                    <FormField name="category">
                      {(field) => {
                        return (
                          <SelectFieldControl
                            field={field}
                            placeholder="Chọn một danh mục"
                            items={categories as unknown as SelectFieldControlProps<ICategory>['items']}
                            labelField="name"
                            valueField="id"
                            classNames={{ field: 'col-span-2' }}
                          />
                        )
                      }}
                    </FormField>
                    <CategoryPopoverForm
                      action={CommonActions.CREATE}
                      type={ItemType.EQUIPMENT_PROPS}
                      render={
                        <Button>
                          <CircleFadingPlusIcon /> Thêm danh mục
                        </Button>
                      }
                    />
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="col-span-full lg:col-span-2">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Giá thuê</FieldLegend>
                  <FieldGroup>
                    <FormField name="price">
                      {(field) => {
                        return (
                          <InputFieldControl
                            field={field}
                            label="Giá thực tế (VNĐ)"
                            type="number"
                            placeholder={formatCurrency(50_000)}
                            classNames={{ field: 'col-span-3' }}
                          />
                        )
                      }}
                    </FormField>
                    <FormField name="rental_price_per_day">
                      {(field) => {
                        return (
                          <InputFieldControl
                            field={field}
                            label="Giá thuê theo ngày (VNĐ)"
                            type="number"
                            placeholder={formatCurrency(100_000)}
                            classNames={{ field: 'col-span-3' }}
                          />
                        )
                      }}
                    </FormField>
                    <FormField name="unit">
                      {(field) => {
                        return (
                          <InputFieldControl
                            field={field}
                            label="Đơn vị"
                            placeholder='Ví dụ: "Bộ", "Cái", "Chiếc"'
                            classNames={{ field: 'col-span-3' }}
                          />
                        )
                      }}
                    </FormField>
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="col-span-full lg:col-span-4">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Hình ảnh</FieldLegend>
                  <FieldGroup>
                    <FormField name="images">
                      {(field) => (
                        <Field>
                          {!Array.isArray(field.state.value) || !field.state.value.length ? (
                            <Empty className="border">
                              <EmptyMedia variant="icon">
                                <ImageIcon />
                              </EmptyMedia>
                              <EmptyHeader>
                                <EmptyTitle>Chưa có hình ảnh nào được chọn</EmptyTitle>
                                <EmptyDescription>Hãy chọn ít nhất 1 hình ảnh cho trang phục</EmptyDescription>
                              </EmptyHeader>
                              <EmptyContent>
                                <label
                                  className={buttonVariants({ size: 'sm' })}
                                  htmlFor="image-gallery-dialog-trigger"
                                >
                                  <ImagePlusIcon />
                                  Thêm hình ảnh
                                </label>
                              </EmptyContent>
                            </Empty>
                          ) : (
                            <div className="grid grid-flow-col auto-cols-[160px] gap-4 overflow-x-auto pb-2">
                              <label
                                className="w-full aspect-square size-40! flex flex-col text-sm justify-center items-center gap-2 rounded-lg bg-accent text-accent-foreground"
                                role="button"
                                htmlFor="image-gallery-dialog-trigger"
                              >
                                <ImagePlusIcon />
                                Thêm hình ảnh
                              </label>
                              {field.state.value.map((image) => (
                                <div key={image.id} className="relative size-40">
                                  <Button
                                    variant="secondary"
                                    size="icon-xs"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                      const afterDelete = field.state.value!.filter(
                                        (img) => img.id !== image.id
                                      ) as unknown as TCreateCostumeValues['images']
                                      field.handleChange(afterDelete)
                                    }}
                                  >
                                    <XIcon />
                                  </Button>
                                  <Image
                                    key={image.id}
                                    src={rewriteImageUrl(image.dest)}
                                    alt={image.file_name}
                                    className="w-full object-cover rounded-lg "
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </Field>
                      )}
                    </FormField>
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="col-span-full">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Mô tả</FieldLegend>
                  <Field className="col-span-12">
                    <FieldLabel>Mô tả</FieldLabel>
                    <Editor
                      ref={editorRef}
                      defaultValue={form.getFieldValue('description') ?? DEFAULT_PROPS_DESCRIPTION}
                    />
                    {!editorRef.current?.isEmpty() === false && (
                      <FieldError errors={form.getFieldMeta('description')?.errors} />
                    )}
                  </Field>
                </FieldSet>
              </CardContent>
            </Card>
            <Button type="submit" className="hidden" id={submitButtonId}>
              Xác nhận
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Images Gallery Dialog */}
      <Dialog>
        <DialogTrigger id="image-gallery-dialog-trigger" />
        <DialogContent className="max-w-7xl h-">
          <DialogHeader>
            <DialogTitle>Danh mục hình ảnh</DialogTitle>
            <DialogDescription>
              Hãy chọn các hình ảnh liên quan áp dụng cho đạo cụ hoặc tải lên nếu muốn
            </DialogDescription>
          </DialogHeader>
          <div className="h-[60vh] overflow-auto">
            <ImagesGallary
              type={ItemType.EQUIPMENT_PROPS}
              onSelect={(images) => {
                form.setFieldValue('images', images as any)
              }}
              selected={(selectedImages ?? []) as unknown as IImage[]}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary">Hủy</Button>} />
            <DialogClose
              nativeButton={false}
              role="button"
              render={
                <label className={buttonVariants()} htmlFor={IMAGE_SELECTION_SUBMIT_BTN_ID}>
                  Sử dụng các ảnh đã chọn
                </label>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CostumeFormDialog
