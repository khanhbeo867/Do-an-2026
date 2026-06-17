import { ItemType } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import { ComboboxFieldControl } from '@/components/forms/combobox-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { Button } from '@/components/ui/button'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import React from 'react'
import type {
  TLoanItemOption,
  TLoanItemOptionGroup,
  TLoanItemRow,
  TLoanItemTypeOption,
} from './loan-form-create.constants'

type LoanFormCreateItemsBuilderProps = {
  form: any
  loanItemsField: any
  costumeSkuOptions: TLoanItemOptionGroup[]
  propsSkuOptions: TLoanItemOptionGroup[]
  loanItemTypeOptions: TLoanItemTypeOption[]
  createLoanItemRow: (itemType?: TLoanItemTypeOption) => TLoanItemRow
  createEmptyLoanItemOption: (itemType?: 'COSTUME' | 'EQUIPMENT_PROPS') => TLoanItemOption
}

function LoanFormCreateItemsBuilderComponent({
  form,
  loanItemsField,
  costumeSkuOptions,
  propsSkuOptions,
  loanItemTypeOptions,
  createLoanItemRow,
  createEmptyLoanItemOption,
}: LoanFormCreateItemsBuilderProps) {
  return (
    <div className="space-y-3">
      {loanItemsField.state.value.map((loanItem: TLoanItemRow, index: number) => {
        const skuOptions = loanItem.item_type.value === ItemType.COSTUME ? costumeSkuOptions : propsSkuOptions

        return (
          <Item key={`loan-item-${index}`} variant="outline" className="p-4">
            <ItemContent className="w-full">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_minmax(0,1fr)_auto]">
                <form.Field
                  name={`loan_items[${index}].item_type` as never}
                  listeners={{
                    onChange: ({ value }: { value: TLoanItemTypeOption }) => {
                      form.setFieldValue(
                        `loan_items[${index}].item` as never,
                        createEmptyLoanItemOption(value.value) as never
                      )
                    },
                  }}
                >
                  {(field: any) => (
                    <SelectFieldControl
                      field={field}
                      label="Loại"
                      items={loanItemTypeOptions}
                      labelField="label"
                      valueField="value"
                    />
                  )}
                </form.Field>

                <form.Field name={`loan_items[${index}].item` as never}>
                  {(field: any) => (
                    <ComboboxFieldControl
                      field={field}
                      label="Sản phẩm"
                      items={skuOptions}
                      labelField="sku"
                      valueField="sku"
                      filter={(itemValue, query) => {
                        query = query.toLowerCase()
                        const sku = itemValue.sku.toLowerCase()
                        const productName = itemValue.name.toLowerCase()

                        return sku.includes(query) || productName.includes(query)
                      }}
                      renderItem={(item: TLoanItemOption) => (
                        <Item size="xs">
                          <ItemContent>
                            <ItemTitle>{item.sku}</ItemTitle>
                            <ItemDescription>
                              {formatCurrency(Number(item.rental_price_per_day ?? 0))} / ngày
                            </ItemDescription>
                          </ItemContent>
                        </Item>
                      )}
                    />
                  )}
                </form.Field>

                <div className="flex items-end justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const nextRows = loanItemsField.state.value.filter((_: TLoanItemRow, rowIndex: number) => {
                        return rowIndex !== index
                      })
                      loanItemsField.handleChange(nextRows)
                    }}
                  >
                    <Trash2Icon className="size-4" /> Xóa
                  </Button>
                </div>
              </div>
            </ItemContent>
          </Item>
        )
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          loanItemsField.handleChange([...loanItemsField.state.value, createLoanItemRow()])
        }}
      >
        <PlusIcon className="size-4" /> Thêm sản phẩm
      </Button>
    </div>
  )
}

export const LoanFormCreateItemsBuilder = React.memo(LoanFormCreateItemsBuilderComponent)
