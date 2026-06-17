import { POSITION_OPTIONS } from '@/apis/employee/constants'
import { useCreateOrUpdateEmployeeMutataion } from '@/apis/employee/hooks/use-employee-request'
import { createEmployeeSchema, type TCreateEmployeeSchema } from '@/apis/employee/schemas/create-employee.schema'
import { updateEmployeeSchema, type TUpdateEmployeeSchema } from '@/apis/employee/schemas/update-employee.schema'
import { CommonActions } from '@/common/constants/enums'
import { standardizeName } from '@/common/helpers/standardize-name'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Icon } from '@/components/ui/icon'
import { usePageEventContext } from '@/contexts/event-context'
import { useForm } from '@tanstack/react-form'
import React, { useRef, useState } from 'react'

const EmployeeFormDialog: React.FC = () => {
  const { event$ } = usePageEventContext()
  const [action, setAction] = useState<CommonActions.CREATE | CommonActions.UPDATE | 'none'>('none')
  const [open, setOpen] = useState<boolean>(!!action)
  const formSchemaRef = useRef<TCreateEmployeeSchema | TUpdateEmployeeSchema>(createEmployeeSchema)

  const mutation = useCreateOrUpdateEmployeeMutataion(action)

  const form = useForm({
    defaultValues: {
      full_name: '',
      citizen_id_number: '',
      email: '',
      phone: '',
      address: '',
      position: {},
    },
    onSubmitInvalid: ({ value }) => {
      console.debug('value', value)
    },
    onSubmit: async ({ value }) => {
      if (typeof mutation?.mutateAsync !== 'function') return
      await mutation.mutateAsync(value)
      setOpen(false)
    },
    validators: { onSubmit: formSchemaRef.current as any },
  })

  event$.useSubscription((e) => {
    if (e.action !== CommonActions.CREATE && e.action !== CommonActions.UPDATE) return
    setAction(e.action)
    setOpen(true)
    if (e.action === CommonActions.CREATE) {
      form.reset()
      formSchemaRef.current = createEmployeeSchema
    } else {
      formSchemaRef.current = updateEmployeeSchema
      form.reset(e.payload, { keepDefaultValues: true })
    }
  })

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    form.handleSubmit()
  }

  const { Field: FormField } = form

  return (
    <Dialog
      open={open && action !== 'none'}
      onOpenChange={setOpen}
      onOpenChangeComplete={(open) => {
        if (!open) {
          form.reset()
          setAction('none')
        }
      }}
    >
      <DialogContent className="max-w-3xl w-full @container">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Thông tin Nhân viên</FieldLegend>
              <FieldDescription>Hồ sơ thông tin sơ yếu lí lịch nhân viên trên hệ thống</FieldDescription>
              <FieldGroup className="grid xl:grid-cols-2">
                <FormField
                  name="full_name"
                  listeners={{
                    onChange: ({ value }: { value: string }) => {
                      form.setFieldValue('full_name', standardizeName(value))
                    },
                    onChangeDebounceMs: 300,
                  }}
                >
                  {(field) => <InputFieldControl field={field} label="Họ tên" type="text" placeholder="Nguyễn Văn A" />}
                </FormField>
                <FormField name="citizen_id_number">
                  {(field) => (
                    <InputFieldControl
                      field={field}
                      label="Số CCCD"
                      type="text"
                      inputMode="numeric"
                      placeholder="*** *** *** ***"
                    />
                  )}
                </FormField>
                <FormField name="phone">
                  {(field) => (
                    <InputFieldControl field={field} label="Số điện thoại" type="tel" placeholder="09xx xxx xxx" />
                  )}
                </FormField>
                <FormField name="email">
                  {(field) => (
                    <InputFieldControl field={field} label="Email" type="email" placeholder="example@gmail.com" />
                  )}
                </FormField>
                <FormField name="address">
                  {(field) => (
                    <InputFieldControl
                      field={field}
                      label="Địa chỉ liên hệ"
                      type="text"
                      placeholder="Số 1, đường Lạch Tray, TP.Hải Phòng"
                    />
                  )}
                </FormField>
                <FormField name="position">
                  {(field) => {
                    return (
                      <SelectFieldControl
                        field={field}
                        label="Chức vụ"
                        items={POSITION_OPTIONS}
                        labelField="label"
                        valueField="value"
                        placeholder="Chức vụ"
                        renderItem={(item) => (
                          <div className="flex gap-x-2 items-center">
                            <Icon name={item.icon} />
                            {item.label}
                          </div>
                        )}
                      />
                    )
                  }}
                </FormField>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
          <Field orientation="horizontal" className="justify-end">
            <Button type="submit">Xác nhận</Button>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              }
            />
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EmployeeFormDialog
