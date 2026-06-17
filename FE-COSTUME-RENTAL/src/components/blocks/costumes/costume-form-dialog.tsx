import { GET_COSTUME_CATEGORY_QUERY_KEY, useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import { COSTUME_UNIT, CostumeGender, CostumeSize, SIZE_RUN } from '@/apis/costume/constants'
import { useCreateOrUpdateCostumeMutation } from '@/apis/costume/hooks/use-costume-request'
import {
  createCostumeSchema,
  type TCreateCostumeSchema,
  type TCreateCostumeValues,
} from '@/apis/costume/schemas/create-costume.schema'
import { updateCostumeSchema, type TUpdateCostumeSchema } from '@/apis/costume/schemas/update-costume.schema'
import type { ICostume } from '@/apis/costume/types'
import type { IImage } from '@/apis/image/types'
import { DEFAULT_COSTUME_DESCRIPTION } from '@/assets/data/costume-description'
import { COLOR_PALETTE } from '@/common/constants/const'
import { CommonActions, ItemType } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { standardizeName } from '@/common/helpers/standardize-name'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { TagsInputFieldControl } from '@/components/forms/tags-input-field-control'
import Image from '@/components/shared/image'
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { typographyVariants } from '@/components/ui/typography'
import { usePageEventContext } from '@/contexts/event-context'
import { useForm, useStore } from '@tanstack/react-form'
import { CircleFadingPlusIcon, ImageIcon, ImagePlusIcon, XIcon } from 'lucide-react'
import React, { useEffect, useId, useRef, useState } from 'react'
import CategoryPopoverForm from '../categories/category-popover-form'
import ImagesGallary, { IMAGE_SELECTION_SUBMIT_BTN_ID } from '../images-gallery/images-gallery-select'
import CostumeColorPlate from './costume-color-plate'

const DEFAULT_FORM_VALUES = {
  name: '',
  category_id: undefined,
  color: COLOR_PALETTE[0],
  sizes: [] as { label: CostumeSize; value: CostumeSize; sortOrder: number }[],
  description: DEFAULT_COSTUME_DESCRIPTION,
  gender: CostumeGender.FEMALE,
  rental_price_per_day: undefined,
  unit: undefined,
  images: [],
  hashtags: [],
}

type TDialogAction = CommonActions.CREATE | CommonActions.UPDATE | 'none'

const CostumeFormDialog: React.FC = () => {
  const { event$ } = usePageEventContext()
  const [open, setOpen] = useState<boolean>(false)
  const [shouldShowImageActions, setShouldShowImageActions] = useState<boolean>(true)
  const [action, setAction] = useState<TDialogAction>('none')
  const { data: categories } = useGetCategoriesQuery(GET_COSTUME_CATEGORY_QUERY_KEY)
  const mutation = useCreateOrUpdateCostumeMutation(action)
  const formSchemaRef = useRef<TCreateCostumeSchema | TUpdateCostumeSchema | undefined>(undefined)
  const submitButtonId = useId()
  const editorRef = useRef<{
    getHTML: () => string
    isEmpty: () => boolean
  }>(null)

  const form = useForm({
    defaultValues: DEFAULT_FORM_VALUES as unknown as TCreateCostumeValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        ...value,
        name: standardizeName(value.name),
        description: editorRef.current?.getHTML(),
      })
      setAction('none')
      setOpen(false)
    },
    validators: { onSubmit: formSchemaRef.current as any },
  })

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
        formSchemaRef.current = createCostumeSchema
        form.reset()
      } else {
        setAction(CommonActions.UPDATE)
        formSchemaRef.current = updateCostumeSchema

        const mappedSizes = e.payload.sizes.map((size) => {
          return {
            label: size,
            value: size,
            sortOrder: SIZE_RUN.findIndex((size) => size.value === String(size)) + 1,
          }
        }) as TCreateCostumeValues['sizes']

        form.reset(
          {
            ...(e.payload as unknown as TCreateCostumeValues),
            sizes: mappedSizes,
            description: e.payload.description,
            unit: COSTUME_UNIT.find((unit) => unit.value === e.payload.unit)!,
          },
          { keepDefaultValues: true }
        )
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
        <DialogContent className="rounded-none h-screen overflow-auto w-screen bg-muted p-0" showCloseButton={false}>
          <DialogHeader className="flex-row sticky top-0 backdrop-blur-md px-6 pt-6">
            <DialogTitle className={typographyVariants({ variant: 'h2' })}>
              {action === CommonActions.CREATE ? 'Tạo mới trang phục' : 'Cập nhật trang phục'}
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-6 auto-rows-auto gap-6 px-6 pb-6 max-w-7xl mx-auto">
            {/* Basic information */}
            <Card className="col-span-full lg:col-span-4">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Thông tin chung</FieldLegend>
                  <FieldGroup>
                    <FormField name="name">
                      {(field) => {
                        return (
                          <InputFieldControl
                            field={field}
                            label="Tên trang phục"
                            placeholder='Ví dụ: "Áo dài truyền thống"'
                            classNames={{ field: 'col-span-2' }}
                          />
                        )
                      }}
                    </FormField>

                    <FormField name="hashtags">
                      {(field) => {
                        return (
                          <TagsInputFieldControl
                            field={field}
                            label="Hashtags"
                            placeholder="#aoDaiVietNam"
                            classNames={{ field: 'col-span-2' }}
                          />
                        )
                      }}
                    </FormField>
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Category */}
            <Card className="col-span-full lg:col-span-2">
              <CardContent className="flex flex-col items-stretch space-y-6">
                <FieldSet>
                  <FieldLegend>Danh mục</FieldLegend>
                  <FormField name="category">
                    {(field) => {
                      return (
                        <SelectFieldControl
                          field={field}
                          items={categories}
                          labelField="name"
                          valueField="id"
                          placeholder="Chọn bộ sưu tập"
                          classNames={{ field: 'col-span-2' }}
                        />
                      )
                    }}
                  </FormField>
                </FieldSet>
                <CategoryPopoverForm
                  type={ItemType.COSTUME}
                  action={CommonActions.CREATE}
                  render={
                    <Button>
                      <CircleFadingPlusIcon /> Thêm danh mục
                    </Button>
                  }
                />
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card className="col-span-full lg:col-span-4">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Đặc tính</FieldLegend>
                  <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField name="sizes">
                      {(field) => (
                        <SelectFieldControl
                          field={field}
                          items={SIZE_RUN}
                          label="Size"
                          labelField="label"
                          valueField="value"
                          multiple
                          placeholder="Chọn size"
                        />
                      )}
                    </FormField>
                    <FormField name="color">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field>
                            <FieldLabel htmlFor={field.name} className="w-fit inline-block">
                              Màu sắc chủ đạo
                            </FieldLabel>
                            <FieldContent>
                              <CostumeColorPlate value={field.state.value} onValueChange={field.handleChange} />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </FieldContent>
                          </Field>
                        )
                      }}
                    </FormField>
                  </FieldGroup>
                  <FormField name="gender">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <FieldGroup className="col-span-6">
                          <FieldLabel>Giới tính</FieldLabel>
                          <RadioGroup
                            defaultValue={CostumeGender.FEMALE}
                            value={field.state.value}
                            className="w-fit"
                            onValueChange={field.handleChange}
                          >
                            <Field orientation="horizontal">
                              <RadioGroupItem value={CostumeGender.MALE} id={CostumeGender.MALE} />
                              <FieldContent>
                                <FieldLabel htmlFor={CostumeGender.MALE}>Nam</FieldLabel>
                                <FieldDescription>Trang phục danh riêng cho Nam</FieldDescription>
                              </FieldContent>
                            </Field>
                            <Field orientation="horizontal">
                              <RadioGroupItem value={CostumeGender.FEMALE} id={CostumeGender.FEMALE} />
                              <FieldContent>
                                <FieldLabel htmlFor={CostumeGender.FEMALE}>Nữ</FieldLabel>
                                <FieldDescription>Trang phục dành riêng cho Nữ</FieldDescription>
                              </FieldContent>
                            </Field>
                            <Field orientation="horizontal">
                              <RadioGroupItem value={CostumeGender.UNISEX} id={CostumeGender.UNISEX} />
                              <FieldContent>
                                <FieldLabel htmlFor={CostumeGender.UNISEX}>Unisex</FieldLabel>
                                <FieldDescription>Trang phục dành cho cả Nam & Nữ</FieldDescription>
                              </FieldContent>
                            </Field>
                          </RadioGroup>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </FieldGroup>
                      )
                    }}
                  </FormField>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="col-span-full lg:col-span-2">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Giá</FieldLegend>
                  <FormField name="price">
                    {(field) => {
                      return (
                        <InputFieldControl
                          field={field}
                          label="Giá thực tế (VNĐ)"
                          type="number"
                          placeholder={formatCurrency(500_000)}
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
                        <SelectFieldControl
                          field={field}
                          items={COSTUME_UNIT}
                          label="Đơn vị"
                          labelField="label"
                          valueField="value"
                          placeholder="Chọn đơn vị"
                          classNames={{ field: 'col-span-3' }}
                        />
                      )
                    }}
                  </FormField>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Image */}
            <Card className="col-span-full">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Hình ảnh</FieldLegend>
                  <FormField name="images">
                    {(field) => {
                      return (
                        <Field className="col-span-6">
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
                                <div key={image.id} className="relative size-40 overflow-hidden rounded-lg">
                                  <Button
                                    variant="secondary"
                                    size="icon-xs"
                                    className="absolute top-2 right-2 z-20"
                                    onClick={() => {
                                      const fieldValue = field.state.value as unknown as TCreateCostumeValues['images']
                                      const afterDelete = fieldValue.filter(
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
                                    className="max-w-full aspect-square object-cover rounded-lg hover:scale-105 transition-transform duration-150 ease-out"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </Field>
                      )
                    }}
                  </FormField>
                </FieldSet>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="col-span-full">
              <CardContent>
                <FieldSet>
                  <FieldLegend>Mô tả</FieldLegend>
                </FieldSet>
                <Field>
                  <Editor
                    ref={editorRef}
                    defaultValue={form.getFieldValue('description') ?? DEFAULT_COSTUME_DESCRIPTION}
                  />
                  {!editorRef.current?.isEmpty() === false && (
                    <FieldError errors={form.getFieldMeta('description')?.errors} />
                  )}
                </Field>
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
              Hãy chọn các hình ảnh liên quan áp dụng cho trang phục hoặc tải lên nếu muốn
            </DialogDescription>
          </DialogHeader>
          <div className="bg-card">
            <ImagesGallary
              type={ItemType.COSTUME}
              selected={(selectedImages ?? []) as unknown as IImage[]}
              onSelect={(images) => {
                form.setFieldValue('images', images as any)
              }}
              onTabChange={(currentTab) => {
                setShouldShowImageActions(currentTab === ItemType.COSTUME)
              }}
            />
          </div>
          {shouldShowImageActions && (
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
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CostumeFormDialog
