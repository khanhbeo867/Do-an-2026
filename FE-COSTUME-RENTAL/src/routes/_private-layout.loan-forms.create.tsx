
import {
  getCostumeInventoryQueryOptions,
  getPropsInventoryQueryOptions,
  useGetCostumeInventoryQuery,
  useGetPropsInventoryQuery,
} from '@/apis/inventory/hooks/use-inventory-request'
import { useCheckoutLoanFormMutation, useCreateLoanFormMutation } from '@/apis/loan-form/hooks/use-loan-form-request'
import { createLoanFormSchema } from '@/apis/loan-form/schemas/create-loan-form.schema'
import { ItemType } from '@/common/constants/enums'
import { LoanFormCreateBorrowerStep } from '@/components/blocks/loan-forms/loan-form-create-borrower-step'
import { LoanFormCreateCheckoutSummary } from '@/components/blocks/loan-forms/loan-form-create-checkout-summary'
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
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/shared/stepper'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { addDays, format } from 'date-fns'
import { ArrowLeftIcon, CheckIcon, InfoIcon, NotepadTextIcon, ShoppingBagIcon } from 'lucide-react'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const steps = [
  {
    title: 'Thông tin phiếu',
    icon: <NotepadTextIcon className="size-4" />,
  },
  {
    title: 'Chi tiết phiếu thuê/mua',
    icon: <ShoppingBagIcon className="size-4" />,
  },
  {
    title: 'Hoàn thành',
    icon: <CheckIcon className="size-4" />,
  },
]

export const Route = createFileRoute('/_private-layout/loan-forms/create')({
  head: () => ({
    meta: [
      { title: 'Tạo phiếu thuê hoặc mua' },
      {
        name: 'description',
        content: 'Tạo mới phiếu thuê/mua, chọn sản phẩm, khách hàng và thiết lập thông tin đặt cọc.',
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getCostumeInventoryQueryOptions()),
      context.queryClient.ensureQueryData(getPropsInventoryQueryOptions()),
    ])
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(1)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false)
  const [submittedMethod, setSubmittedMethod] = useState<'BUY' | 'RENT' | null>(null)
  type StepFieldName =
    | 'method'
    | 'borrower_name'
    | 'borrower_phone'
    | 'borrower_role'
    | 'borrower_citizen_id_number'
    | 'employee'
    | 'due_date'
    | 'loan_items'
    | 'deposit_amount'

  const { mutateAsync: createLoanFormAsync, isPending: isCreating } = useCreateLoanFormMutation()
  const { mutateAsync: checkoutLoanFormAsync, isPending: isCheckingOut } = useCheckoutLoanFormMutation()

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
  const [selectedMethod, setSelectedMethod] = useState<'BUY' | 'RENT'>('BUY')
  const [isDepositConfirmed, setIsDepositConfirmed] = useState(false)
  const minDueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd')

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
              price: inventory.price ?? 0,
              rental_price_per_day: inventory.rental_price_per_day ?? 0,
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

  const form = useForm({
    defaultValues: {
      employee: {} as any,
      borrower_name: '',
      borrower_phone: '',
      borrower_citizen_id_number: '',
      borrower_role: roleOptions[0],
      method: methodOptions[0],
      due_date: minDueDate,
      deposit_amount: 0,
      loan_items: [createLoanItemRow()],
    },
    validators: {
      onSubmit: createLoanFormSchema as any,
    },
    onSubmit: async ({ value }) => {
      const submitValue = { ...value }
      if (submitValue.method.value === 'BUY') {
        submitValue.due_date = null as any
      }
      const created = await createLoanFormAsync(submitValue)
      const methodValue = value.method.value === 'BUY' ? 'BUY' : 'RENT'

      if (value.method.value === 'BUY') {
        await checkoutLoanFormAsync({ id: created.id })
        toast.success('Mua sản phẩm thành công')
      } else {
        if (Number(value.deposit_amount ?? 0) > 0) {
          toast.success('Tạo phiếu thuê thành công, phiếu đã chuyển sang trạng thái đang thuê')
        } else {
          toast.success('Tạo phiếu thuê thành công, đang chờ thanh toán cọc')
        }
      }

      setSubmittedMethod(methodValue)
      setIsSubmitSuccess(true)
      setActiveStep(3)
    },
  })

  const loanItems = useStore(form.store, (state) => state.values.loan_items)

  const totalItemPriceAmount = useMemo(() => {
    return loanItems.reduce((total, loanItem) => {
      return total + Number(loanItem.item?.price ?? 0)
    }, 0)
  }, [loanItems])

  const hasSelectedLoanItem = useMemo(() => {
    return loanItems.some((loanItem) => Boolean(String(loanItem.item?.sku ?? '').trim()))
  }, [loanItems])

  useEffect(() => {
    if (selectedMethod !== 'RENT') {
      if (isDepositConfirmed) setIsDepositConfirmed(false)
      if (Number(form.state.values.deposit_amount ?? 0) !== 0) {
        form.setFieldValue('deposit_amount', 0)
      }
      return
    }

    const nextDeposit = isDepositConfirmed ? totalItemPriceAmount : 0
    if (Number(form.state.values.deposit_amount ?? 0) !== nextDeposit) {
      form.setFieldValue('deposit_amount', nextDeposit)
    }
  }, [form, isDepositConfirmed, selectedMethod, totalItemPriceAmount, form.state.values.deposit_amount])

  const getRequiredFieldsByStep = (step: number): StepFieldName[] => {
    if (step === 1) {
      const requiredFields: StepFieldName[] = [
        'method',
        'borrower_name',
        'borrower_phone',
        'borrower_role',
        'borrower_citizen_id_number',
      ]

      return requiredFields
    }

    if (step === 2) {
      const requiredFields: StepFieldName[] = ['due_date', 'loan_items']

      if (selectedMethod === 'RENT') {
        requiredFields.push('deposit_amount')
      }

      return requiredFields
    }

    return []
  }

  const validateCurrentStep = async (step: number) => {
    const requiredFields = getRequiredFieldsByStep(step)

    await Promise.all(requiredFields.map((fieldName) => form.validateField(fieldName, 'submit')))

    const hasError = requiredFields.some((fieldName) => {
      const fieldMeta = form.getFieldMeta(fieldName)
      return (fieldMeta?.errors?.length ?? 0) > 0
    })

    if (hasError) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc trước khi tiếp tục')
      return false
    }

    return true
  }

  const handleStepChange = async (nextStep: number) => {
    if (nextStep <= activeStep) {
      setActiveStep(nextStep)
      return
    }

    const canProceed = await validateCurrentStep(activeStep)
    if (canProceed) {
      setActiveStep(nextStep)
    }
  }

  const handleCancelConfirm = async () => {
    setOpenCancelDialog(false)
    navigate({ to: '/loan-forms' })
  }

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (activeStep !== 3) {
      return
    }

    void form.handleSubmit()
  }

  return (
    <Fragment>
      <form onSubmit={handleSubmit} className="h-full max-w-3xl mx-auto">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Tạo phiếu thuê/mua mới</CardTitle>
            <CardDescription>
              Điền thông tin phiếu thuê/mua, thêm sản phẩm vào giỏ hàng và xác nhận tạo phiếu ở bước cuối.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 h-full overflow-hidden">
            <Stepper
              value={activeStep}
              onValueChange={(step) => {
                void handleStepChange(step)
              }}
              className="flex flex-col gap-6 max-h-full overflow-hidden"
              indicators={{
                completed: <CheckIcon className="size-4" />,
                loading: <Spinner />,
              }}
            >
              <StepperNav className="w-full justify-center">
                {steps.map((step, index) => (
                  <StepperItem key={index} step={index + 1} className="relative flex-1 items-start">
                    <StepperTrigger className="flex grow flex-col items-start justify-center gap-2.5" asChild>
                      <StepperIndicator className="data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=completed]:bg-success size-8 border-2 data-[state=completed]:text-white data-[state=inactive]:bg-transparent">
                        {step.icon}
                      </StepperIndicator>
                      <div className="flex flex-col items-start gap-1">
                        <div className="text-muted-foreground text-[10px] font-semibold uppercase">
                          Bước {index + 1}
                        </div>
                        <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start text-base font-semibold">
                          {step.title}
                        </StepperTitle>
                        <div>
                          <Badge className="hidden group-data-[state=active]/step:inline-flex">Chờ xác nhận</Badge>
                          <Badge className="hidden group-data-[state=completed]/step:inline-flex group-data-[state=completed]/step:bg-success">
                            Đã hoàn thành
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-muted-foreground hidden group-data-[state=inactive]/step:inline-flex"
                          >
                            Đang chờ
                          </Badge>
                        </div>
                      </div>
                    </StepperTrigger>
                    {steps.length > index + 1 && (
                      <StepperSeparator className="group-data-[state=completed]/step:bg-success absolute inset-x-0 inset-s-9 top-4 m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
                    )}
                  </StepperItem>
                ))}
              </StepperNav>
              <StepperPanel className="h-full flex-1 overflow-y-scroll [scrollbar-gutter:stable] pr-1">
                <StepperContent value={1} className="space-y-4 h-full">
                  <LoanFormCreateBorrowerStep
                    form={form}
                    selectedMethod={selectedMethod}
                    setSelectedMethod={setSelectedMethod}
                    roleOptions={roleOptions}
                    methodOptions={methodOptions}
                  />
                </StepperContent>
                <StepperContent value={2} className="space-y-4">
                  {selectedMethod !== 'BUY' && (
                    <form.Field name="due_date">
                      {(field) => (
                        <DatePickerFieldControl
                          field={field}
                          label="Ngày hẹn trả"
                          min={minDueDate}
                          description="Ngày hẹn trả phải từ ngày mai trở đi."
                        />
                      )}
                    </form.Field>
                  )}
                  <form.Field name="loan_items">
                    {(loanItemsField) => (
                      <LoanFormCreateItemsBuilder
                        form={form}
                        loanItemsField={loanItemsField}
                        costumeSkuOptions={costumeSkuOptions}
                        propsSkuOptions={propsSkuOptions}
                        loanItemTypeOptions={loanItemTypeOptions}
                        createLoanItemRow={createLoanItemRow}
                        createEmptyLoanItemOption={createEmptyLoanItemOption}
                      />
                    )}
                  </form.Field>
                  {selectedMethod === 'RENT' ? (
                    <FieldGroup className="rounded-md border p-3">
                      <form.Field name="deposit_amount">
                        {(field) => (
                          <InputFieldControl
                            field={field}
                            type="number"
                            label="Tiền đặt cọc"
                            placeholder="0"
                            readOnly
                            description={`Tổng cọc đề xuất theo giá sản phẩm: ${Number(totalItemPriceAmount ?? 0).toLocaleString('vi-VN')} VND`}
                          />
                        )}
                      </form.Field>
                      <Field orientation="horizontal">
                        <Checkbox
                          id="deposit-confirmed"
                          checked={isDepositConfirmed}
                          disabled={!hasSelectedLoanItem}
                          onCheckedChange={(checked) => setIsDepositConfirmed(Boolean(checked))}
                        />
                        <Label htmlFor="deposit-confirmed">Đã nhận đủ tiền cọc</Label>
                      </Field>
                    </FieldGroup>
                  ) : (
                    <Alert>
                      <InfoIcon />
                      <AlertTitle>Lưu ý</AlertTitle>
                      <AlertDescription>Phiếu mua sản phẩm không yêu cầu nhập tiền đặt cọc.</AlertDescription>
                    </Alert>
                  )}
                </StepperContent>
                <StepperContent value={3} className="space-y-4">
                  {isSubmitSuccess ? (
                    <Alert>
                      <CheckIcon />
                      <AlertTitle>
                        {submittedMethod === 'RENT' ? 'Tạo phiếu thuê thành công' : 'Mua sản phẩm thành công'}
                      </AlertTitle>
                      <AlertDescription>
                        Phiếu đã được tạo thành công. Bạn có thể quay về danh sách phiếu để tiếp tục theo dõi.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <LoanFormCreateCheckoutSummary
                      methodValue={form.state.values.method.value}
                      methodLabel={form.state.values.method.label}
                      borrowerName={form.state.values.borrower_name}
                      borrowerPhone={form.state.values.borrower_phone}
                      borrowerCitizenId={form.state.values.borrower_citizen_id_number}
                      dueDate={form.state.values.due_date}
                      depositAmount={Number(form.state.values.deposit_amount ?? 0)}
                      loanItems={form.state.values.loan_items}
                    />
                  )}
                </StepperContent>
              </StepperPanel>
            </Stepper>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-end gap-2">
            {isSubmitSuccess ? (
              <Button type="button" className="ml-auto" onClick={() => navigate({ to: '/loan-forms' })}>
                Quay về danh sách phiếu thuê/mua
              </Button>
            ) : null}
            {!isSubmitSuccess && activeStep > 1 ? (
              <Button type="button" variant="ghost" onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}>
                <ArrowLeftIcon /> Quay lại
              </Button>
            ) : null}
            {!isSubmitSuccess ? (
              <Button type="button" variant="outline" className="ml-auto" onClick={() => setOpenCancelDialog(true)}>
                Hủy
              </Button>
            ) : null}
            {!isSubmitSuccess && activeStep < 3 ? (
              <Button
                type="button"
                onClick={async () => {
                  await handleStepChange(activeStep + 1)
                }}
              >
                Tiếp tục
              </Button>
            ) : null}
            {!isSubmitSuccess && activeStep >= 3 ? (
              <Button type="submit" disabled={isCreating || isCheckingOut}>
                {isCreating || isCheckingOut ? <Spinner /> : null}
                Xác nhận tạo phiếu
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </form>
      <AlertDialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn muốn hủy tạo phiếu thuê/mua?</AlertDialogTitle>
            <AlertDialogDescription>
              Dữ liệu đang nhập sẽ không được lưu. Bạn có chắc chắn muốn thoát khỏi màn hình tạo phiếu không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm}>Đồng ý</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  )
}
