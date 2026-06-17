import { Position, WorkStatus } from '@/apis/employee/constants'
import { getEmployeeQueryOptions } from '@/apis/employee/hooks/use-employee-request'
import type { IEmployee } from '@/apis/employee/types'
import {
  getCostumeInventoryQueryOptions,
  getPropsInventoryQueryOptions,
  useGetCostumeInventoryQuery,
  useGetPropsInventoryQuery,
} from '@/apis/inventory/hooks/use-inventory-request'
import {
  getLoanFormDetailQueryOptions,
  useAddLoanItemsMutation,
  useCancelLoanFormMutation,
  useUpdateLoanFormMutation,
} from '@/apis/loan-form/hooks/use-loan-form-request'
import { updateLoanFormSchema } from '@/apis/loan-form/schemas/update-loan-form.schema'
import { ItemType } from '@/common/constants/enums'
import { formatCurrency } from '@/common/helpers/format-intl'
import { LoanFormCreateItemsBuilder } from '@/components/blocks/loan-forms/loan-form-create-items-builder'
import {
  createEmptyLoanItemOption,
  createLoanItemRow,
  loanItemTypeOptions,
  type TLoanItemOption,
  type TLoanItemOptionGroup,
} from '@/components/blocks/loan-forms/loan-form-create.constants'
import DatePickerFieldControl from '@/components/forms/date-picker-field-control'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { addDays, format } from 'date-fns'
import { ArrowLeftIcon, InfoIcon } from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_private-layout/loan-forms/update/$id')({
  head: () => ({
    meta: [
      { title: 'Cập nhật phiếu thuê hoặc mua' },
      {
        name: 'description',
        content: 'Chỉnh sửa thông tin phiếu thuê/mua, cập nhật khách hàng, hạn trả và danh sách sản phẩm.',
      },
    ],
  }),
  params: {
    parse: (params) => ({ id: Number(params.id) }),
    stringify: (params) => ({ id: String(params.id) }),
  },
  loader: async ({ context, params }) => {
    const [loanForm, internalBorrowers] = await Promise.all([
      context.queryClient.ensureQueryData(getLoanFormDetailQueryOptions(params.id)),
      context.queryClient.ensureQueryData(
        getEmployeeQueryOptions({
          'position:in': `${Position.TALENT},${Position.TECHNICAL_CREW}`,
          'is_active:eq': true,
          'work_status:ne': WorkStatus.EXITED,
        })
      ),
      context.queryClient.ensureQueryData(getCostumeInventoryQueryOptions()),
      context.queryClient.ensureQueryData(getPropsInventoryQueryOptions()),
    ])

    return { loanForm, internalBorrowers }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { loanForm, internalBorrowers: prefetchedInternalBorrowers } = Route.useLoaderData()
  const [loanFormState, setLoanFormState] = useState(loanForm)
  type UpdateFieldName =
    | 'method'
    | 'employee'
    | 'borrower_name'
    | 'borrower_phone'
    | 'borrower_role'
    | 'borrower_citizen_id_number'
    | 'due_date'
    | 'deposit_amount'

  const { mutateAsync: updateLoanAsync, isPending } = useUpdateLoanFormMutation()
  const { mutateAsync: cancelLoanAsync, isPending: isCanceling } = useCancelLoanFormMutation()
  const { mutateAsync: addLoanItemsAsync, isPending: isAddingItems } = useAddLoanItemsMutation()
  const { data: costumeInventory } = useGetCostumeInventoryQuery()
  const { data: propsInventory } = useGetPropsInventoryQuery()

  const roleOptions = useMemo(
    () => [
      { label: 'Khách lẻ', value: 'EXTERNAL' },
      { label: 'Nội bộ', value: 'INTERNAL' },
    ],
    []
  )

  const methodOptions = useMemo(
    () => [
      { label: 'Mua sản phẩm', value: 'BUY' },
      { label: 'Thuê lẻ', value: 'RENT' },
    ],
    []
  )
  const minDueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const [openCancelDialog, setOpenCancelDialog] = useState(false)

  const roleValue = roleOptions.find((opt) => opt.value === loanForm.borrower_role) ?? roleOptions[0]
  const methodValue =
    methodOptions.find((opt) => opt.value === (loanForm.method === 'RENT' ? 'RENT' : loanForm.method)) ??
    methodOptions[0]
  const matchedEmployee = (prefetchedInternalBorrowers ?? []).find(
    (employee) =>
      employee.full_name === loanForm.borrower_name &&
      employee.phone === loanForm.borrower_phone &&
      (employee.citizen_id_number ?? '') === (loanForm.borrower_citizen_id_number ?? '')
  )
  const [selectedMethod, setSelectedMethod] = useState<'BUY' | 'RENT'>(methodValue.value as 'BUY' | 'RENT')
  const canAddItems = loanFormState.status === 'DEPOSIT_PENDING'

  const costumeSkuOptions = useMemo<TLoanItemOptionGroup[]>(() => {
    return (costumeInventory ?? [])
      .map((inventory) => ({
        label: inventory.name,
        items: inventory.details
          .filter((detail) => detail.status === 'AVAILABLE')
          .map(
            (detail): TLoanItemOption => ({
              sku: detail.sku,
              item_id: inventory.id,
              item_type: ItemType.COSTUME,
              name: inventory.name,
              price: Number(inventory.price ?? 0),
              rental_price_per_day: Number(inventory.rental_price_per_day ?? 0),
            })
          ),
      }))
      .filter((group) => group.items.length > 0)
  }, [costumeInventory])

  const propsSkuOptions = useMemo<TLoanItemOptionGroup[]>(() => {
    return (propsInventory ?? [])
      .map((inventory) => ({
        label: inventory.name,
        items: inventory.details
          .filter((detail) => detail.status === 'AVAILABLE')
          .map(
            (detail): TLoanItemOption => ({
              sku: detail.sku,
              item_id: inventory.id,
              item_type: ItemType.EQUIPMENT_PROPS,
              name: inventory.name,
              price: Number(inventory.price ?? 0),
              rental_price_per_day: Number(inventory.rental_price_per_day ?? 0),
            })
          ),
      }))
      .filter((group) => group.items.length > 0)
  }, [propsInventory])

  const canCancelLoan = loanFormState.status === 'DEPOSIT_PENDING'

  const form = useForm({
    defaultValues: {
      id: loanForm.id,
      employee: matchedEmployee ?? ({} as Partial<IEmployee>),
      borrower_name: loanForm.borrower_name,
      borrower_phone: loanForm.borrower_phone,
      borrower_citizen_id_number: loanForm.borrower_citizen_id_number ?? '',
      borrower_role: roleValue,
      method: methodValue,
      due_date: loanForm.due_date ? format(new Date(loanForm.due_date), 'yyyy-MM-dd') : minDueDate,
      deposit_amount: Number(loanForm.deposit_amount ?? 0),
    },
    validators: {
      onSubmit: updateLoanFormSchema as any,
    },
    onSubmit: async ({ value }) => {
      await updateLoanAsync(value)
      toast.success('Cập nhật phiếu thuê/mua thành công')
      navigate({ to: '/loan-forms' })
    },
  })

  useEffect(() => {
    if (selectedMethod === 'RENT') {
      form.setFieldValue('deposit_amount', Number(loanFormState?.total_item_price_amount ?? 0))
    }
  }, [loanFormState?.total_item_price_amount, selectedMethod])

  const addItemsForm = useForm({
    defaultValues: {
      loan_items: [createLoanItemRow()],
    },
    onSubmit: async ({ value }) => {
      const skus = Array.from(
        new Set(value.loan_items.map((loanItem) => String(loanItem.item.sku ?? '').trim()).filter(Boolean))
      )

      if (!skus.length) {
        toast.error('Vui lòng chọn ít nhất 1 SKU để thêm vào phiếu')
        return
      }

      const updatedLoanForm = await addLoanItemsAsync({ id: loanFormState.id, skus })
      setLoanFormState(updatedLoanForm)
      toast.success('Đã thêm sản phẩm vào phiếu')
    },
  })

  const getRequiredFields = (): UpdateFieldName[] => {
    if (selectedMethod === 'BUY') {
      return [
        'method',
        'borrower_name',
        'borrower_phone',
        'borrower_role',
      ]
    }

    return [
      'method',
      'borrower_name',
      'borrower_phone',
      'borrower_role',
      'due_date',
      'deposit_amount',
    ]
  }

  const validateBeforeSubmit = async () => {
    const requiredFields = getRequiredFields()

    await Promise.all(requiredFields.map((field) => form.validateField(field, 'submit')))

    const hasError = requiredFields.some((field) => {
      const errorMap = form.getFieldMeta(field)?.errorMap
      return Boolean(errorMap?.onChange || errorMap?.onBlur || errorMap?.onSubmit || errorMap?.onMount)
    })

    return !hasError
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const canSubmit = await validateBeforeSubmit()

    if (!canSubmit) {
      toast.error('Vui lòng kiểm tra lại các trường bắt buộc')
      return
    }

    await form.handleSubmit()
  }

  const handleCancelLoan = async () => {
    try {
      await cancelLoanAsync({ id: loanFormState.id })
      toast.success('Đã hủy phiếu thuê/mua')
      setOpenCancelDialog(false)
      navigate({ to: '/loan-forms' })
    } catch {
      toast.error('Không thể hủy phiếu. Vui lòng kiểm tra điều kiện hủy.')
    }
  }

  return (
    <>
      <form
        className="max-w-4xl mx-auto flex-1 flex flex-col h-full"
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Cập nhật phiếu thuê/mua {loanFormState.code}</CardTitle>
            <CardDescription>Chỉnh sửa thông tin người thuê/mua và thông tin giao dịch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 h-full overflow-y-auto py-1">
            <FieldGroup>
              <FieldGroup className="grid grid-cols-6 gap-x-3 gap-y-6">
                <form.Field
                  name="method"
                  listeners={{
                    onChange: ({ value }: { value: { label: string; value: 'BUY' | 'RENT' } }) => {
                      setSelectedMethod(value.value)

                      if (value.value === 'BUY') {
                        form.setFieldValue('borrower_role', roleOptions[0])
                        form.setFieldValue('deposit_amount', 0)
                      } else {
                        form.setFieldValue('borrower_role', roleOptions[0])
                        form.setFieldValue('employee', {})
                        form.setFieldValue('borrower_name', '')
                        form.setFieldValue('borrower_phone', '')
                        form.setFieldValue('borrower_citizen_id_number', '')
                      }
                    },
                  }}
                >
                  {(field) => (
                    <SelectFieldControl
                      field={field}
                      label="Loại phiếu"
                      items={methodOptions}
                      labelField="label"
                      valueField="value"
                      classNames={{ field: 'col-span-full' }}
                      disabled
                    />
                  )}
                </form.Field>



                <form.Field name="borrower_name">
                  {(field) => (
                    <InputFieldControl
                      field={field}
                      label={selectedMethod === 'BUY' ? 'Tên người mua' : 'Người thuê'}
                      placeholder={
                        selectedMethod === 'BUY' ? 'Nhập họ tên người mua' : 'Nhập họ tên khách hàng'
                      }
                      classNames={{ field: 'col-span-2' }}
                      readOnly={false}
                    />
                  )}
                </form.Field>
                <form.Field name="borrower_phone">
                  {(field) => (
                    <InputFieldControl
                      field={field}
                      label="Số điện thoại"
                      placeholder="Nhập số điện thoại"
                      readOnly={false}
                      classNames={{ field: 'col-span-2' }}
                    />
                  )}
                </form.Field>
                <form.Field name="borrower_citizen_id_number">
                  {(field) => (
                    <InputFieldControl
                      field={field}
                      label="CCCD"
                      placeholder="Nhập CCCD"
                      readOnly={false}
                      classNames={{ field: 'col-span-2' }}
                    />
                  )}
                </form.Field>

                {selectedMethod !== 'BUY' && (
                  <form.Field name="due_date">
                    {(field) => (
                      <DatePickerFieldControl
                        field={field}
                        label="Ngày hẹn trả"
                        min={minDueDate}
                        description="Ngày hẹn trả phải từ ngày mai trở đi."
                        classNames={{ field: 'col-span-3' }}
                      />
                    )}
                  </form.Field>
                )}

                {selectedMethod === 'RENT' ? (
                  <form.Field name="deposit_amount">
                    {(field) => (
                      <InputFieldControl
                        field={field}
                        type="number"
                        label="Tiền đặt cọc"
                        placeholder="0"
                        classNames={{ field: 'col-span-3' }}
                      />
                    )}
                  </form.Field>
                ) : (
                  <Alert className="col-span-full">
                    <InfoIcon />
                    <AlertTitle>Lưu ý</AlertTitle>
                    <AlertDescription>Phiếu mua sản phẩm không yêu cầu nhập tiền đặt cọc.</AlertDescription>
                  </Alert>
                )}
              </FieldGroup>
              <FieldGroup>
                <Card>
                  <CardContent className="flex-row flex gap-4">
                    <FieldSet className="basis-1/2">
                      <FieldLegend>Chi tiết sản phẩm trong phiếu</FieldLegend>
                      {canAddItems ? (
                        <form
                          className="space-y-3 mb-4"
                          onSubmit={(event) => {
                            event.preventDefault()
                            void addItemsForm.handleSubmit()
                          }}
                        >
                          <addItemsForm.Field name="loan_items">
                            {(loanItemsField) => (
                              <LoanFormCreateItemsBuilder
                                form={addItemsForm}
                                loanItemsField={loanItemsField}
                                costumeSkuOptions={costumeSkuOptions}
                                propsSkuOptions={propsSkuOptions}
                                loanItemTypeOptions={loanItemTypeOptions}
                                createLoanItemRow={createLoanItemRow}
                                createEmptyLoanItemOption={createEmptyLoanItemOption}
                              />
                            )}
                          </addItemsForm.Field>
                          <Button type="submit" disabled={isAddingItems}>
                            {isAddingItems ? <Spinner /> : null}
                            Thêm sản phẩm vào phiếu
                          </Button>
                        </form>
                      ) : null}
                      <ItemGroup>
                        {(loanFormState?.items ?? []).map((item) => (
                          <Item key={item.id} size="sm" variant="outline">
                            <ItemContent>
                              <ItemTitle>{item.sku}</ItemTitle>
                              <ItemDescription>
                                {item.loan_item_name} {' | '} {formatCurrency(item.item_price ?? 0)}
                              </ItemDescription>
                            </ItemContent>
                            {selectedMethod !== 'BUY' && (
                              <ItemContent>
                                <ItemActions>
                                  <ItemTitle>{formatCurrency(Number(item.rental_price_per_day ?? 0))} / ngày</ItemTitle>
                                </ItemActions>
                              </ItemContent>
                            )}
                          </Item>
                        ))}
                      </ItemGroup>
                    </FieldSet>
                    <Separator orientation="vertical" />
                    <FieldSet>
                      <FieldLegend>{selectedMethod === 'BUY' ? 'Tổng hợp đơn mua' : 'Tổng hợp phiếu thuê'}</FieldLegend>
                      <ItemGroup className="*[data-slot=item]:p-0">
                        {selectedMethod !== 'BUY' && (
                          <>
                            <Item size="xs">
                              <ItemContent>
                                <ItemDescription>Tổng số ngày thuê</ItemDescription>
                                <ItemTitle>{loanFormState?.rental_days ?? 0} ngày</ItemTitle>
                              </ItemContent>
                            </Item>
                            <Item size="xs">
                              <ItemContent>
                                <ItemDescription>Tổng tiền thuê</ItemDescription>
                                <ItemTitle>{formatCurrency(Number(loanFormState?.total_rental_amount ?? 0))}</ItemTitle>
                              </ItemContent>
                            </Item>
                            <Item size="xs">
                              <ItemContent>
                                <ItemDescription>Tổng tiền khách cần cọc</ItemDescription>
                                <ItemTitle>
                                  {formatCurrency(Number(loanFormState?.total_item_price_amount ?? 0))}
                                </ItemTitle>
                              </ItemContent>
                            </Item>
                          </>
                        )}
                        {selectedMethod === 'BUY' && (
                          <Item size="xs">
                            <ItemContent>
                              <ItemDescription>Tổng tiền mua sản phẩm</ItemDescription>
                              <ItemTitle className="text-xl text-primary font-bold">
                                {formatCurrency(Number(loanFormState?.total_item_price_amount ?? 0))}
                              </ItemTitle>
                            </ItemContent>
                          </Item>
                        )}
                      </ItemGroup>
                    </FieldSet>
                  </CardContent>
                </Card>
              </FieldGroup>
            </FieldGroup>
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: '/loan-forms' })}>
              <ArrowLeftIcon /> Quay lại
            </Button>
            <Field orientation={'horizontal'} className="ml-auto justify-end">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setOpenCancelDialog(true)}
                disabled={!canCancelLoan}
              >
                Hủy phiếu
              </Button>
              <Button type="submit" disabled={isPending}>
                Lưu thay đổi
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </form>

      <AlertDialog open={openCancelDialog || isCanceling} onOpenChange={setOpenCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy phiếu thuê/mua?</AlertDialogTitle>
            <AlertDialogDescription>
              Khi hủy phiếu, trạng thái phiếu sẽ chuyển sang "Đã hủy" và toàn bộ sản phẩm trong phiếu sẽ được đưa về
              trạng thái AVAILABLE.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction disabled={isCanceling} onClick={handleCancelLoan}>
              {isCanceling ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
