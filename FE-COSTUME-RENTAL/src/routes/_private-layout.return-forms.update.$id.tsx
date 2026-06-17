import { getLoanFormsQueryOptions } from '@/apis/loan-form/hooks/use-loan-form-request'
import {
  getReturnFormDetailQueryOptions,
  useUpdateReturnFormMutation,
} from '@/apis/return-form/hooks/use-return-form-request'
import { updateReturnFormSchema } from '@/apis/return-form/schemas/update-return-form.schema'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_private-layout/return-forms/update/$id')({
  head: () => ({
    meta: [
      { title: 'Cập nhật phiếu trả' },
      {
        name: 'description',
        content: 'Chỉnh sửa thông tin phiếu trả, người trả và liên kết với phiếu thuê tương ứng.',
      },
    ],
  }),
  params: {
    parse: (params) => ({ id: Number(params.id) }),
    stringify: (params) => ({ id: String(params.id) }),
  },
  loader: async ({ context, params }) => {
    const [returnForm, loanForms] = await Promise.all([
      context.queryClient.ensureQueryData(getReturnFormDetailQueryOptions(params.id)),
      context.queryClient.ensureQueryData(getLoanFormsQueryOptions()),
    ])

    return { returnForm, loanForms }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { returnForm, loanForms } = Route.useLoaderData()
  const { mutateAsync: updateReturnAsync, isPending } = useUpdateReturnFormMutation()

  const loanOptions = useMemo(() => {
    return (loanForms ?? []).map((loan) => ({
      label: `${loan.code} - ${loan.borrower_name}`,
      value: loan.code,
    }))
  }, [loanForms])

  const form = useForm({
    defaultValues: {
      id: returnForm.id,
      loan_form:
        loanOptions.find((opt) => opt.value === returnForm.loan_form_code) ??
        ({ label: returnForm.loan_form_code, value: returnForm.loan_form_code } as const),
      returnee_name: returnForm.returnee_name,
      returnee_phone: returnForm.returnee_phone,
      returnee_citizen_id_number: returnForm.returnee_citizen_id_number ?? '',
      skus: (returnForm.items ?? []).map((item) => item.sku),
    },
    validators: {
      onSubmit: updateReturnFormSchema as any,
    },
    onSubmit: async ({ value }) => {
      await updateReturnAsync(value)
      toast.success('Cập nhật phiếu trả thành công')
      navigate({ to: '/return-forms' })
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
      className="h-full max-w-2xl mx-auto"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Cập nhật phiếu trả {returnForm.code}</CardTitle>
          <CardDescription>Chỉnh sửa thông tin người trả và liên kết phiếu thuê.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.Field name="loan_form">
            {(field) => (
              <SelectFieldControl
                field={field}
                label="Phiếu thuê"
                items={loanOptions}
                labelField="label"
                valueField="value"
              />
            )}
          </form.Field>
          <form.Field name="returnee_name">
            {(field) => <InputFieldControl field={field} label="Người trả" placeholder="Nhập họ tên" />}
          </form.Field>
          <form.Field name="returnee_phone">
            {(field) => <InputFieldControl field={field} label="Số điện thoại" placeholder="Nhập số điện thoại" />}
          </form.Field>
          <form.Field name="returnee_citizen_id_number">
            {(field) => <InputFieldControl field={field} label="CCCD" placeholder="Nhập CCCD" />}
          </form.Field>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal" className="justify-end">
            <Button type="button" variant="outline" onClick={() => navigate({ to: '/return-forms' })}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              Lưu thay đổi
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </form>
  )
}
