import { getLoanFormsQueryOptions, useGetLoanFormsQuery } from '@/apis/loan-form/hooks/use-loan-form-request'
import {
  useCompleteReturnFormMutation,
  useCreateInvoiceFromReturnMutation,
  useCreatePenaltyFromReturnMutation,
  useCreateReturnFormMutation,
} from '@/apis/return-form/hooks/use-return-form-request'
import { createReturnFormSchema } from '@/apis/return-form/schemas/create-return-form.schema'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import TextareaFieldControl from '@/components/forms/textarea-field-control'
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
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { AlertTriangleIcon, ArrowLeftIcon, CreditCardIcon, HandCoinsIcon, QrCodeIcon, WalletIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_private-layout/return-forms/create')({
  head: () => ({
    meta: [
      { title: 'Tạo phiếu trả' },
      {
        name: 'description',
        content: 'Tạo phiếu trả sản phẩm, ghi nhận sự cố, phát sinh phạt và xác nhận thanh toán.',
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getLoanFormsQueryOptions())
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(1)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [borrowCompletionDone, setBorrowCompletionDone] = useState(false)
  const [submittedLoanMethod, setSubmittedLoanMethod] = useState<'BUY' | 'RENT' | null>(null)
  const { data: loanForms } = useGetLoanFormsQuery()

  const { mutateAsync: createReturnAsync, isPending: isCreatingReturn } = useCreateReturnFormMutation()
  const { mutateAsync: createPenaltyAsync, isPending: isCreatingPenalty } = useCreatePenaltyFromReturnMutation()
  const { mutateAsync: createInvoiceAsync, isPending: isCreatingInvoice } = useCreateInvoiceFromReturnMutation()
  const { mutateAsync: completeReturnAsync, isPending: isCompletingReturn } = useCompleteReturnFormMutation()

  const activeLoanForms = useMemo(() => {
    return (loanForms ?? []).filter(
      (loan) =>
        loan.method !== 'BUY' &&
        loan.status !== 'RETURNED' &&
        loan.status !== 'CANCELED' &&
        loan.status !== 'PAID' &&
        Boolean(loan.code)
    )
  }, [loanForms])

  const paymentMethodOptions = useMemo(
    () => [
      { label: 'Tiền mặt', value: 'CASH' as const },
      { label: 'Chuyển khoản', value: 'BANK_TRANSFER' as const },
    ],
    []
  )

  const loanOptions = useMemo(() => {
    return activeLoanForms.map((loan) => ({
      label: `${loan.code} - ${loan.borrower_name}`,
      value: loan.code,
    }))
  }, [activeLoanForms])

  const form = useForm({
    defaultValues: {
      loan_form: loanOptions[0] ?? { label: '', value: '' },
      returnee_name: '',
      returnee_phone: '',
      returnee_citizen_id_number: '',
      remark: '',
      incidents: [] as Array<{
        sku: string
        item_name: string
        item_price: number
        incident_status: 'NONE' | 'DAMAGED' | 'LOST'
        note: string
      }>,
      penalty_amount: 0,
      penalty_note: '',
      payment_method: paymentMethodOptions[1]?.value ?? 'BANK_TRANSFER',
      payment_amount: 0,
    },
    validators: {
      onSubmit: createReturnFormSchema as any,
    },
    onSubmit: async ({ value }) => {
      const created = await createReturnAsync(value)

      const selectedLoan = activeLoanForms.find((loan) => loan.code === value.loan_form.value)
      const isBorrowFlow = selectedLoan?.method === 'BUY'

      setSubmittedLoanMethod(selectedLoan?.method === 'BUY' ? 'BUY' : 'RENT')

      if (isBorrowFlow) {
        await completeReturnAsync({ id: created.id })
        setBorrowCompletionDone(true)
        setActiveStep(3)
        toast.success('Đã hoàn tất phiếu mua')
        return
      }

      const rentalAmount = Number(selectedLoan?.total_rental_amount ?? 0)
      const penaltyAmount = Number(value.penalty_amount ?? 0)
      const totalAmount = rentalAmount + penaltyAmount
      const refundAmount = Number(value.payment_amount ?? 0) - totalAmount

      const problematicIncidents = value.incidents.filter((incident) => incident.incident_status !== 'NONE')
      const shouldCreatePenalty =
        selectedLoan?.method === 'RENT' && penaltyAmount > 0

      let penaltyFormCode: string | null = null
      if (shouldCreatePenalty) {
        let reason = value.penalty_note?.trim()
        if (!reason) {
          reason = problematicIncidents
            .map((incident) => {
              const statusLabel = incident.incident_status === 'LOST' ? 'Mất' : 'Hỏng'
              return `${incident.sku} - ${statusLabel}${incident.note ? ` (${incident.note})` : ''}`
            })
            .join('; ') || 'Phạt trễ hạn trả đồ'
        }

        const penalty = await createPenaltyAsync({
          loan_form_code: created.loan_form_code,
          return_form_code: created.code,
          reason,
          amount: penaltyAmount,
        })

        penaltyFormCode = penalty.code
      }

      const composedNote = [value.remark?.trim(), value.penalty_note?.trim()].filter(Boolean).join(' | ') || null

      await createInvoiceAsync({
        loan_form_code: created.loan_form_code,
        return_form_code: created.code,
        penalty_form_code: penaltyFormCode,
        payer_name: value.returnee_name,
        payer_phone: value.returnee_phone,
        payer_citizen_id_number: value.returnee_citizen_id_number?.trim() || null,
        payment_method: value.payment_method,
        payment_amount: Number(value.payment_amount ?? 0),
        total_amount: totalAmount,
        rental_amount: rentalAmount,
        penalty_amount: penaltyAmount,
        refund_amount: refundAmount,
        paid_at: new Date().toISOString(),
        note: composedNote,
      })

      await completeReturnAsync({ id: created.id })

      toast.success('Tạo phiếu trả và xác nhận thanh toán thành công')
      navigate({ to: '/return-forms' })
    },
  })

  const selectedLoanCode = useStore(form.store, (state) => state.values.loan_form.value)
  const incidents = useStore(form.store, (state) => state.values.incidents)
  const penaltyAmount = useStore(form.store, (state) => Number(state.values.penalty_amount ?? 0))
  const paymentAmount = useStore(form.store, (state) => Number(state.values.payment_amount ?? 0))

  const selectedLoan = useMemo(() => {
    return activeLoanForms.find((loan) => loan.code === selectedLoanCode)
  }, [activeLoanForms, selectedLoanCode])

  const effectiveMethod = submittedLoanMethod ?? selectedLoan?.method ?? null
  const isBorrowFlow = effectiveMethod === 'BUY'
  const isBorrowCompletionStep = activeStep === 3 && borrowCompletionDone

  useEffect(() => {
    if (!loanOptions.length) {
      return
    }

    const hasValidSelection = loanOptions.some((option) => option.value === selectedLoanCode)
    if (!hasValidSelection) {
      form.setFieldValue('loan_form', loanOptions[0])
    }
  }, [form, loanOptions, selectedLoanCode])

  useEffect(() => {
    if (!selectedLoan) {
      form.setFieldValue('returnee_name', '')
      form.setFieldValue('returnee_phone', '')
      form.setFieldValue('returnee_citizen_id_number', '')
      form.setFieldValue('incidents', [])
      form.setFieldValue('penalty_amount', 0)
      form.setFieldValue('penalty_note', '')
      form.setFieldValue('payment_amount', 0)
      return
    }

    form.setFieldValue('returnee_name', selectedLoan.borrower_name ?? '')
    form.setFieldValue('returnee_phone', selectedLoan.borrower_phone ?? '')
    form.setFieldValue('returnee_citizen_id_number', selectedLoan.borrower_citizen_id_number ?? '')
    form.setFieldValue(
      'incidents',
      (selectedLoan.items ?? []).map((item) => ({
        sku: item.sku,
        item_name: item.loan_item_name,
        item_price: Number(item.item_price ?? 0),
        incident_status: 'NONE' as const,
        note: '',
      }))
    )
    form.setFieldValue('penalty_amount', 0)
    form.setFieldValue('penalty_note', '')
    form.setFieldValue('payment_amount', Number(selectedLoan.total_rental_amount ?? 0))
  }, [form, selectedLoan])

  const problematicIncidents = useMemo(() => {
    return incidents.filter((incident) => incident.incident_status !== 'NONE')
  }, [incidents])

  const delayDays = useMemo(() => {
    if (!selectedLoan?.due_date || selectedLoan?.method !== 'RENT') return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(selectedLoan.due_date)
    dueDate.setHours(0, 0, 0, 0)
    
    const diffTime = today.getTime() - dueDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }, [selectedLoan])

  const delayPenaltyAmount = useMemo(() => {
    if (delayDays <= 0 || !selectedLoan?.items) return 0
    const totalRentalPerDay = selectedLoan.items.reduce(
      (sum, item) => sum + Number(item.rental_price_per_day ?? 0),
      0
    )
    return totalRentalPerDay * delayDays
  }, [delayDays, selectedLoan])

  const minimumPenaltyAmount = useMemo(() => {
    if (selectedLoan?.method !== 'RENT') {
      return 0
    }

    const incidentPenalty = problematicIncidents.reduce((total, incident) => {
      if (incident.incident_status === 'LOST') {
        return total + Number(incident.item_price ?? 0)
      }

      return total + Number(incident.item_price ?? 0) * 0.1
    }, 0)

    return incidentPenalty + delayPenaltyAmount
  }, [problematicIncidents, selectedLoan?.method, delayPenaltyAmount])

  useEffect(() => {
    if (selectedLoan?.method !== 'RENT' || (!problematicIncidents.length && delayDays === 0)) {
      if (penaltyAmount !== 0) {
        form.setFieldValue('penalty_amount', 0)
        form.setFieldValue('penalty_note', '')
      }
      return
    }

    const roundedMinimumPenalty = Math.ceil(minimumPenaltyAmount)
    
    const defaultNotes: string[] = []
    if (delayDays > 0) {
      defaultNotes.push(`Trễ hạn trả ${delayDays} ngày (${delayPenaltyAmount.toLocaleString('vi-VN')} VND)`)
    }
    if (problematicIncidents.length > 0) {
      const incidentPenaltyTotal = minimumPenaltyAmount - delayPenaltyAmount
      defaultNotes.push(`Sự cố sản phẩm (${incidentPenaltyTotal.toLocaleString('vi-VN')} VND)`)
    }
    const suggestedNote = defaultNotes.join(' | ')

    if (penaltyAmount < roundedMinimumPenalty) {
      form.setFieldValue('penalty_amount', roundedMinimumPenalty)
    }
    
    const currentNote = form.state.values.penalty_note
    if (!currentNote || currentNote.trim() === '') {
      form.setFieldValue('penalty_note', suggestedNote)
    }
  }, [form, minimumPenaltyAmount, penaltyAmount, problematicIncidents.length, selectedLoan?.method, delayDays, delayPenaltyAmount])

  const rentalAmount = Number(selectedLoan?.total_rental_amount ?? 0)
  const totalAmount = rentalAmount + penaltyAmount
  const refundAmount = paymentAmount - totalAmount
  const isSubmitting = isCreatingReturn || isCreatingPenalty || isCreatingInvoice || isCompletingReturn

  const updateIncident = (
    index: number,
    patch: Partial<{ incident_status: 'NONE' | 'DAMAGED' | 'LOST'; note: string }>
  ) => {
    const next = incidents.map((incident, incidentIndex) =>
      incidentIndex === index ? { ...incident, ...patch } : incident
    )
    form.setFieldValue('incidents', next)
  }

  const validateCurrentStep = async (step: number) => {
    if (step === 3 && selectedLoan?.method === 'BUY') {
      return true
    }

    const stepFields: Array<
      | 'loan_form'
      | 'returnee_name'
      | 'returnee_phone'
      | 'returnee_citizen_id_number'
      | 'incidents'
      | 'penalty_amount'
      | 'penalty_note'
      | 'payment_method'
      | 'payment_amount'
    > =
      step === 1
        ? ['loan_form', 'returnee_name', 'returnee_phone', 'returnee_citizen_id_number']
        : step === 2
          ? ['incidents', 'penalty_amount', 'penalty_note']
          : ['payment_method', 'payment_amount']

    await Promise.all(stepFields.map((field) => form.validateField(field, 'submit')))

    const hasStepError = stepFields.some((field) => {
      const fieldMeta = form.getFieldMeta(field)
      return (fieldMeta?.errors?.length ?? 0) > 0
    })

    if (step === 2 && selectedLoan?.method !== 'RENT') {
      return !hasStepError
    }

    if (hasStepError) {
      toast.error('Vui lòng hoàn thiện đầy đủ thông tin trước khi tiếp tục')
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
    navigate({ to: '/return-forms' })
  }

  return (
    <>
      <Card className="h-full mx-auto w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Tạo phiếu trả</CardTitle>
          <CardDescription>
            Điền thông tin theo từng bước để tạo phiếu trả và xác nhận thanh toán. Nếu có sản phẩm bị hỏng hoặc mất, hãy
            cung cấp thông tin chi tiết để tính toán tiền phạt chính xác. Sau khi hoàn tất, phiếu trả sẽ được tạo và
            thanh toán sẽ được ghi nhận tự động.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 overflow-hidden">
          <Stepper
            value={activeStep}
            onValueChange={(step) => {
              void handleStepChange(step)
            }}
            className="flex flex-col gap-6 max-h-full overflow-hidden"
          >
            <StepperNav>
              <StepperItem step={1}>
                <StepperTrigger className="px-2 py-1">
                  <StepperIndicator>1</StepperIndicator>
                  <StepperTitle>Thông tin người trả</StepperTitle>
                </StepperTrigger>
                <StepperSeparator />
              </StepperItem>
              <StepperItem step={2}>
                <StepperTrigger className="px-2 py-1">
                  <StepperIndicator>2</StepperIndicator>
                  <StepperTitle>Kiểm tra sản phẩm</StepperTitle>
                </StepperTrigger>
                <StepperSeparator />
              </StepperItem>
              <StepperItem step={3}>
                <StepperTrigger className="px-2 py-1">
                  <StepperIndicator>3</StepperIndicator>
                  <StepperTitle>
                    {borrowCompletionDone ? 'Hoàn tất' : isBorrowFlow ? 'Xác nhận' : 'Thanh toán'}
                  </StepperTitle>
                </StepperTrigger>
              </StepperItem>
            </StepperNav>
            <StepperPanel className="h-full flex-1 overflow-y-scroll [scrollbar-gutter:stable] pr-1">
              <StepperContent value={1} className="space-y-4">
                {!loanOptions.length ? (
                  <Alert>
                    <AlertTriangleIcon className="size-4" />
                    <AlertTitle>Không có phiếu đủ điều kiện</AlertTitle>
                    <AlertDescription>Hiện chưa có phiếu thuê đang hoạt động để tạo phiếu trả.</AlertDescription>
                  </Alert>
                ) : null}

                <FieldGroup className="grid grid-cols-3">
                  <form.Field name="loan_form">
                    {(field) => (
                      <SelectFieldControl
                        field={field}
                        label="Phiếu thuê"
                        items={loanOptions}
                        labelField="label"
                        valueField="value"
                        disabled={!loanOptions.length}
                        placeholder="Chọn phiếu thuê"
                        description="Hiển thị các phiếu thuê còn hiệu lực, không hiển thị phiếu đã hủy hoặc đã trả"
                        classNames={{ field: 'col-span-full' }}
                      />
                    )}
                  </form.Field>
                  <form.Field name="returnee_name">
                    {(field) => (
                      <InputFieldControl
                        field={field}
                        label="Người trả"
                        placeholder="Nhập họ tên"
                        classNames={{ input: 'col-span-1' }}
                      />
                    )}
                  </form.Field>
                  <form.Field name="returnee_phone">
                    {(field) => (
                      <InputFieldControl
                        field={field}
                        label="Số điện thoại"
                        placeholder="Nhập số điện thoại"
                        classNames={{ input: 'col-span-1' }}
                      />
                    )}
                  </form.Field>
                  <form.Field name="returnee_citizen_id_number">
                    {(field) => (
                      <InputFieldControl
                        field={field}
                        label="CCCD"
                        placeholder="Nhập CCCD (nếu có)"
                        classNames={{ input: 'col-span-1' }}
                      />
                    )}
                  </form.Field>
                  <form.Field name="remark">
                    {(field) => (
                      <TextareaFieldControl
                        field={field}
                        label="Ghi chú phiếu trả"
                        placeholder="Ví dụ: Khách trả sớm 1 ngày, cần kiểm tra lại phụ kiện đi kèm..."
                        classNames={{ field: 'col-span-full', textarea: 'field-sizing-fixed' }}
                        rows={5}
                      />
                    )}
                  </form.Field>
                </FieldGroup>
              </StepperContent>
              <StepperContent value={2} className="space-y-4">
                <FieldSet>
                  <FieldDescription>Chọn tình trạng từng SKU: bình thường, hỏng hoặc mất.</FieldDescription>
                  <div className="space-y-4">
                    {incidents.map((incident, index) => (
                      <div key={incident.sku} className="rounded-md border p-3">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold">{incident.item_name || incident.sku}</div>
                            <div className="text-sm text-muted-foreground">SKU: {incident.sku}</div>
                          </div>
                          <div className="text-sm font-medium">
                            {Number(incident.item_price ?? 0).toLocaleString('vi-VN')} VND
                          </div>
                        </div>

                        <FieldLabel className="mb-2">Tình trạng trả</FieldLabel>
                        <RadioGroup
                          value={incident.incident_status}
                          onValueChange={(value) =>
                            updateIncident(index, {
                              incident_status: value as 'NONE' | 'DAMAGED' | 'LOST',
                            })
                          }
                          className="grid grid-cols-1 gap-2 md:grid-cols-3"
                        >
                          <label className="flex cursor-pointer items-center gap-2 rounded-md border p-2">
                            <RadioGroupItem value="NONE" />
                            <span>Không vấn đề</span>
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 rounded-md border p-2">
                            <RadioGroupItem value="DAMAGED" />
                            <span>Hỏng</span>
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 rounded-md border p-2">
                            <RadioGroupItem value="LOST" />
                            <span>Mất</span>
                          </label>
                        </RadioGroup>

                        {incident.incident_status !== 'NONE' ? (
                          <div className="mt-3 space-y-2">
                            <FieldLabel htmlFor={`incident-note-${incident.sku}`}>Mô tả sự cố</FieldLabel>
                            <Textarea
                              id={`incident-note-${incident.sku}`}
                              value={incident.note}
                              onChange={(event) => updateIncident(index, { note: event.target.value })}
                              placeholder="Mô tả chi tiết tình trạng hỏng/mất"
                              rows={2}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <form.Field name="incidents">
                    {(field) =>
                      field.state.meta.isTouched && !field.state.meta.isValid ? (
                        <FieldError errors={field.state.meta.errors} className="mt-3" />
                      ) : null
                    }
                  </form.Field>
                </FieldSet>

                {selectedLoan?.method === 'RENT' && (problematicIncidents.length > 0 || delayDays > 0) ? (
                  <div className="space-y-4 rounded-lg border border-amber-300 bg-amber-50/50 p-4">
                    <div className="text-sm font-medium text-amber-700 space-y-1">
                      {delayDays > 0 ? (
                        <div>• Đơn hàng quá hạn {delayDays} ngày. Phí phạt trễ hạn gợi ý: {delayPenaltyAmount.toLocaleString('vi-VN')} VND.</div>
                      ) : null}
                      {problematicIncidents.length > 0 ? (
                        <div>• Có {problematicIncidents.length} sản phẩm gặp sự cố (hỏng/mất). Phí phạt sự cố gợi ý: {(minimumPenaltyAmount - delayPenaltyAmount).toLocaleString('vi-VN')} VND.</div>
                      ) : null}
                      <div className="font-bold mt-1 text-amber-800">
                        Tổng tiền phạt gợi ý tối thiểu: {Math.ceil(minimumPenaltyAmount).toLocaleString('vi-VN')} VND
                      </div>
                    </div>
                    <form.Field name="penalty_amount">
                      {(field) => (
                        <InputFieldControl
                          field={field}
                          type="number"
                          min={Math.ceil(minimumPenaltyAmount)}
                          label="Tiền phạt"
                          placeholder="Nhập tiền phạt"
                        />
                      )}
                    </form.Field>
                    <form.Field name="penalty_note">
                      {(field) => (
                        <TextareaFieldControl
                          field={field}
                          label="Lý do phạt"
                          placeholder="Nhập chi tiết lý do phạt..."
                          rows={3}
                        />
                      )}
                    </form.Field>
                  </div>
                ) : null}
              </StepperContent>
              <StepperContent value={3} className="space-y-4">
                {isBorrowCompletionStep ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangleIcon className="size-4" />
                      <AlertTitle>Đã hoàn tất phiếu trả</AlertTitle>
                      <AlertDescription>
                        {borrowCompletionDone
                          ? 'Phiếu trả nội bộ đã được hoàn tất. Bạn có thể quay về danh sách phiếu trả.'
                          : 'Hệ thống đang xử lý hoàn tất phiếu trả nội bộ.'}
                      </AlertDescription>
                    </Alert>

                    <Link to="/return-forms" className={buttonVariants({ variant: 'default' })}>
                      Quay về danh sách phiếu trả
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="text-sm font-medium">Xem lại thông tin phiếu trả</div>
                      <ItemGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 [&_div[data-slot=item]]:p-0!">
                        <Item size="sm">
                          <ItemContent>
                            <ItemDescription>Phiếu thuê</ItemDescription>
                            <ItemTitle className="font-semibold">{selectedLoan?.code ?? '--'}</ItemTitle>
                          </ItemContent>
                        </Item>
                        <Item size="sm">
                          <ItemContent>
                            <ItemDescription>Loại phiếu</ItemDescription>
                            <ItemTitle className="font-semibold">
                              {effectiveMethod === 'BUY' ? 'Mua sản phẩm' : 'Thuê lẻ'}
                            </ItemTitle>
                          </ItemContent>
                        </Item>
                        <Item size="sm">
                          <ItemContent>
                            <ItemDescription>Người trả</ItemDescription>
                            <ItemTitle className="font-semibold">{form.state.values.returnee_name || '--'}</ItemTitle>
                          </ItemContent>
                        </Item>
                        <Item size="sm">
                          <ItemContent>
                            <ItemDescription>Số điện thoại</ItemDescription>
                            <ItemTitle className="font-semibold">{form.state.values.returnee_phone || '--'}</ItemTitle>
                          </ItemContent>
                        </Item>
                        <Item size="sm">
                          <ItemContent>
                            <ItemDescription>CCCD</ItemDescription>
                            <ItemTitle className="font-semibold">
                              {form.state.values.returnee_citizen_id_number || '--'}
                            </ItemTitle>
                          </ItemContent>
                        </Item>
                        <Item size="sm">
                          <ItemContent>
                            <ItemDescription>Số sản phẩm sự cố</ItemDescription>
                            <ItemTitle className="font-semibold">{problematicIncidents.length}</ItemTitle>
                          </ItemContent>
                        </Item>
                      </ItemGroup>
                      <Item size="sm" className="p-0!">
                        <ItemContent>
                          <ItemDescription>Ghi chú</ItemDescription>
                          <ItemTitle className="font-medium">{form.state.values.remark?.trim() || '--'}</ItemTitle>
                        </ItemContent>
                      </Item>
                      {problematicIncidents.length > 0 ? (
                        <div className="space-y-2">
                          {problematicIncidents.map((incident) => (
                            <div key={incident.sku} className="rounded-md border p-3 text-sm">
                              <div className="font-medium">{incident.item_name || incident.sku}</div>
                              <div className="text-muted-foreground">SKU: {incident.sku}</div>
                              <div>Tình trạng: {incident.incident_status === 'LOST' ? 'Mất' : 'Hỏng'}</div>
                              <div>Ghi chú: {incident.note?.trim() || '--'}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {!isBorrowFlow ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <FieldSet className="rounded-lg border p-4">
                            <FieldLegend className="inline-flex items-center gap-2">
                              <QrCodeIcon className="size-4" />
                              Thanh toán QR
                            </FieldLegend>
                            <div className="flex h-48 items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
                              QR placeholder
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Có thể thay bằng mã QR động từ cổng thanh toán ở giai đoạn tích hợp thật.
                            </p>
                          </FieldSet>

                          <FieldSet className="rounded-lg border p-4">
                            <FieldLegend className="inline-flex items-center gap-2">
                              <WalletIcon className="size-4" />
                              Phương thức thanh toán
                            </FieldLegend>
                            <form.Field name="payment_method">
                              {(field) => (
                                <RadioGroup
                                  value={field.state.value}
                                  onValueChange={field.handleChange}
                                  className="space-y-4"
                                >
                                  <FieldLabel htmlFor="cash-payment">
                                    <Field orientation="horizontal">
                                      <HandCoinsIcon size={20} className="stroke-muted-foreground" />
                                      <FieldContent>
                                        <FieldTitle>Tiền mặt</FieldTitle>
                                        <FieldDescription>Trả tiền trực tiếp tại quầy thu ngân</FieldDescription>
                                      </FieldContent>
                                      <RadioGroupItem value={'CASH'} id="cash-payment" />
                                    </Field>
                                  </FieldLabel>
                                  <FieldLabel htmlFor="transfer-payment">
                                    <Field orientation="horizontal">
                                      <CreditCardIcon size={20} className="stroke-muted-foreground" />
                                      <FieldContent>
                                        <FieldTitle>Chuyển khoản</FieldTitle>
                                        <FieldDescription>
                                          Quét mã QR để thanh toán, nhanh chóng và tiện lợi
                                        </FieldDescription>
                                      </FieldContent>
                                      <RadioGroupItem value={'BANK_TRANSFER'} id="transfer-payment" />
                                    </Field>
                                  </FieldLabel>
                                </RadioGroup>
                              )}
                            </form.Field>
                          </FieldSet>
                        </div>

                        <div className="space-y-4 rounded-lg border p-4">
                          <ItemGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 [&_div[data-slot=item]]:p-0!">
                            <Item size="sm">
                              <ItemContent>
                                <ItemDescription>Tiền thuê</ItemDescription>
                                <ItemTitle className="font-semibold">
                                  {rentalAmount.toLocaleString('vi-VN')} VND
                                </ItemTitle>
                              </ItemContent>
                            </Item>
                            <Item size="sm">
                              <ItemContent>
                                <ItemDescription>Tiền phạt</ItemDescription>
                                <ItemTitle className="font-semibold">
                                  {penaltyAmount.toLocaleString('vi-VN')} VND
                                </ItemTitle>
                              </ItemContent>
                            </Item>
                            <Item size="sm">
                              <ItemContent>
                                <ItemDescription>Tổng cần thanh toán</ItemDescription>
                                <ItemTitle className="font-semibold">
                                  {totalAmount.toLocaleString('vi-VN')} VND
                                </ItemTitle>
                              </ItemContent>
                            </Item>
                            <Item size="sm">
                              <ItemContent>
                                <ItemDescription>Tiền hoàn/thiếu</ItemDescription>
                                <ItemTitle
                                  className={`font-semibold ${refundAmount >= 0 ? 'text-success' : 'text-destructive'}`}
                                >
                                  {refundAmount.toLocaleString('vi-VN')} VND
                                </ItemTitle>
                              </ItemContent>
                            </Item>
                          </ItemGroup>

                          <form.Field name="payment_amount">
                            {(field) => (
                              <InputFieldControl
                                field={field}
                                type="number"
                                min={0}
                                label="Số tiền khách thanh toán"
                                placeholder="Mặc định bằng tiền thuê"
                                classNames={{ field: 'col-span-1' }}
                              />
                            )}
                          </form.Field>
                        </div>
                      </>
                    ) : null}
                  </>
                )}
              </StepperContent>
            </StepperPanel>
          </Stepper>
        </CardContent>
        <CardFooter className="gap-2">
          {!isBorrowCompletionStep ? (
            <>
              {activeStep > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}
                  disabled={isSubmitting}
                >
                  <ArrowLeftIcon />
                  Quay lại
                </Button>
              ) : null}
              <Button type="button" variant="outline" className="ml-auto" onClick={() => setOpenCancelDialog(true)}>
                Hủy
              </Button>
              {activeStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
                    void handleStepChange(activeStep + 1)
                  }}
                  disabled={!loanOptions.length || isSubmitting}
                >
                  {isSubmitting && <Spinner />}
                  Tiếp tục
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={async () => {
                    const isValid = await validateCurrentStep(3)
                    if (isValid) {
                      if (isBorrowFlow) {
                        void form.handleSubmit()
                        return
                      }

                      setOpenConfirmDialog(true)
                    }
                  }}
                  disabled={isSubmitting || !loanOptions.length}
                >
                  {isSubmitting ? <Spinner /> : null}
                  Xác nhận và tạo phiếu
                </Button>
              )}
            </>
          ) : null}
        </CardFooter>
      </Card>

      <AlertDialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy tạo phiếu?</AlertDialogTitle>
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

      <AlertDialog open={openConfirmDialog && !isBorrowFlow} onOpenChange={setOpenConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận tạo phiếu trả và thanh toán?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ tạo phiếu trả, lập phiếu phạt (nếu có) và phát hành hóa đơn thanh toán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kiểm tra lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void form.handleSubmit()
              }}
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
