import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { FieldGroup } from '@/components/ui/field'
import React from 'react'

type Option = { label: string; value: string }

type LoanFormCreateBorrowerStepProps = {
  form: any
  selectedMethod: 'BUY' | 'RENT'
  setSelectedMethod: React.Dispatch<React.SetStateAction<'BUY' | 'RENT'>>
  roleOptions: Option[]
  methodOptions: Option[]
}

function LoanFormCreateBorrowerStepComponent({
  form,
  selectedMethod,
  setSelectedMethod,
  roleOptions,
  methodOptions,
}: LoanFormCreateBorrowerStepProps) {
  return (
    <FieldGroup>
      <form.Field
        name="method"
        listeners={{
          onChange: ({ value }: { value: { label: string; value: 'BUY' | 'RENT' } }) => {
            setSelectedMethod(value.value)

            if (value.value === 'BUY') {
              form.setFieldValue('borrower_role', roleOptions[0])
              form.setFieldValue('deposit_amount', 0)
              form.setFieldValue('borrower_name', '')
              form.setFieldValue('borrower_phone', '')
              form.setFieldValue('borrower_citizen_id_number', '')
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
        {(field: any) => (
          <SelectFieldControl
            field={field}
            label="Loại phiếu"
            items={methodOptions}
            labelField="label"
            valueField="value"
            classNames={{ select: 'w-full' }}
          />
        )}
      </form.Field>

      <form.Field name="borrower_name">
        {(field: any) => (
          <InputFieldControl
            field={field}
            label={selectedMethod === 'BUY' ? 'Tên người mua' : 'Người thuê'}
            placeholder={selectedMethod === 'BUY' ? 'Nhập họ tên người mua' : 'Nhập họ tên khách hàng'}
            readOnly={false}
          />
        )}
      </form.Field>
      <form.Field name="borrower_phone">
        {(field: any) => (
          <InputFieldControl
            field={field}
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            readOnly={false}
          />
        )}
      </form.Field>
      <form.Field name="borrower_citizen_id_number">
        {(field: any) => (
          <InputFieldControl
            field={field}
            label="CCCD"
            placeholder="Nhập CCCD (nếu có)"
            readOnly={false}
          />
        )}
      </form.Field>
    </FieldGroup>
  )
}

export const LoanFormCreateBorrowerStep = React.memo(LoanFormCreateBorrowerStepComponent)
