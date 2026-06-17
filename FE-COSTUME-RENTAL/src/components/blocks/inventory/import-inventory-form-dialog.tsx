import { useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import { CostumeSize } from '@/apis/costume/constants'
import { useImportInventoryMutation } from '@/apis/inventory/hooks/use-inventory-request'
import { importInventorySchema, type TImportInventoryValues } from '@/apis/inventory/schemas/import-inventory.schema'
import { useGetWarehouseQuery } from '@/apis/warehouse/hooks/use-warehouse-request'
import type { IWarehouse } from '@/apis/warehouse/types'
import { ItemType } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { ComboboxFieldControl } from '@/components/forms/combobox-field-control'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl, { type SelectFieldControlProps } from '@/components/forms/select-field-control'
import Image from '@/components/shared/image'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import type { DialogRootActions } from '@base-ui/react'
import { useForm } from '@tanstack/react-form'
import { CirclePlusIcon } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

const embedFieldMap = new Map<ItemType, 'costumes' | 'equipment_props'>([
  [ItemType.COSTUME, 'costumes'],
  [ItemType.EQUIPMENT_PROPS, 'equipment_props'],
])

const ImportInventoryFormDialog: React.FC<{ type: ItemType }> = ({ type }) => {
  const [sizes, setSizes] = useState<Array<{ label: string; value: CostumeSize }>>([])
  const dialogActionRef = useRef<DialogRootActions | null>(null)

  const { data: warehouses } = useGetWarehouseQuery()
  const { data } = useGetCategoriesQuery({
    'type:eq': type,
    _embed: embedFieldMap.get(type),
  })

  const { mutateAsync: importInventory } = useImportInventoryMutation(type)

  const warehouseOptions = useMemo(() => {
    if (!Array.isArray(warehouses)) return []
    return warehouses.filter((item) => item.type === type)
  }, [warehouses])

  const form = useForm({
    defaultValues: {
      ...(type === ItemType.COSTUME && { size: null as unknown as TImportInventoryValues['size'] }),
      item: null as unknown as TImportInventoryValues['item'],
      item_type: type,
      warehouse: warehouseOptions[0],
      quantity: 1,
    },
    onSubmit: async ({ value }) => {
      await importInventory(value as unknown as TImportInventoryValues).then(() => dialogActionRef.current?.close())
    },
    validators: { onSubmit: importInventorySchema as any },
  })

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    form.handleSubmit()
  }

  const productOptions = useMemo(() => {
    if (!Array.isArray(data)) return []
    const itemsField = embedFieldMap.get(type)
    return data.map((cate) => ({
      label: cate.name,
      items:
        itemsField && Array.isArray(cate[itemsField])
          ? cate[itemsField].map((item) => {
              return {
                id: item.id,
                name: item.name,
                rental_price_per_day: item.rental_price_per_day,
                image: rewriteImageUrl(item.images[0]?.dest),
                ...(item.sizes && { sizes: item.sizes.map((size) => ({ label: size, value: size })) }),
              }
            })
          : [],
    }))
  }, [])

  const FieldItem = form.Field

  return (
    <Dialog actionsRef={dialogActionRef}>
      <DialogTrigger className={buttonVariants()}>
        <CirclePlusIcon /> Nhập kho
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldLegend>Nhập kho</FieldLegend>
            <FieldDescription>
              Sử dụng form này để nhập kho cho sản phẩm. Bạn có thể chọn sản phẩm, tình trạng, kích thước và số lượng
              cần nhập.
            </FieldDescription>
            <FieldGroup>
              <FieldItem name="item">
                {(field) => (
                  <ComboboxFieldControl
                    label="Sản phẩm"
                    field={field}
                    items={productOptions}
                    labelField={'name'}
                    valueField={'id'}
                    renderItem={(product: {
                      id: number
                      name: string
                      rental_price_per_day: number
                      image: string
                      sizes?: Array<{ label: string; value: CostumeSize }>
                    }) => {
                      return (
                        <Item
                          size="xs"
                          onClick={() => {
                            if (Array.isArray(product.sizes)) setSizes(product.sizes)
                          }}
                        >
                          <ItemMedia>
                            <Image
                              src={product.image}
                              alt={product.name}
                              className="size-10 aspect-square rounded-md"
                            />
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle>{product.name}</ItemTitle>
                            <ItemDescription>{formatCurrency(product.rental_price_per_day)} / ngày</ItemDescription>
                          </ItemContent>
                        </Item>
                      )
                    }}
                  />
                )}
              </FieldItem>
              {type === ItemType.COSTUME && (
                <FieldItem name="size">
                  {(field) => (
                    <SelectFieldControl
                      label="Size"
                      field={field}
                      items={sizes}
                      placeholder="Nhập hoặc chọn 1 size"
                      disabled={sizes.length === 0}
                      labelField={'label'}
                      valueField={'value'}
                    />
                  )}
                </FieldItem>
              )}
              <FieldItem name="quantity">
                {(field) => (
                  <InputFieldControl
                    field={field}
                    label="Số lượng"
                    placeholder="Số lượng cần nhập"
                    type="number"
                    min={1}
                  />
                )}
              </FieldItem>
              <FieldItem name="warehouse">
                {(field) => (
                  <SelectFieldControl
                    field={field}
                    items={warehouseOptions as unknown as SelectFieldControlProps<IWarehouse>['items']}
                    label="Kho hàng"
                    labelField="name"
                    valueField="id"
                    placeholder="Chọn kho hàng nhận sản phẩm"
                  />
                )}
              </FieldItem>
              <Field orientation="horizontal" className="justify-end">
                <DialogClose
                  className={buttonVariants({ variant: 'secondary' })}
                  onClick={() => {
                    form.reset()
                    if (type === ItemType.COSTUME) setSizes([])
                  }}
                >
                  Hủy
                </DialogClose>
                <Button type="submit">Xác nhận</Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ImportInventoryFormDialog
