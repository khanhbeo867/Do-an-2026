import { Position, WorkStatus } from '@/apis/employee/constants'
import { getEmployeeQueryOptions } from '@/apis/employee/hooks/use-employee-request'
import type { IEmployee } from '@/apis/employee/types'
import { ROLE_OPTIONS } from '@/apis/user/constants'
import { useCreateOrUpdateUserMutataion } from '@/apis/user/hooks/use-user-request'
import { createUserSchema, type TCreateUserSchema } from '@/apis/user/schemas/create-user.schema'
import { updateUserSchema, type TUpdateUserSchema } from '@/apis/user/schemas/update-user.schema'
import { CommonActions } from '@/common/constants/enums'
import { ComboboxFieldControl } from '@/components/forms/combobox-field-control'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { usePageEventContext } from '@/contexts/event-context'
import generateAvatar from '@/lib/generate-avatar'

import { useForm } from '@tanstack/react-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import React, { useRef, useState } from 'react'

const UserFormDialog: React.FC = () => {
  const { event$ } = usePageEventContext()
  const [action, setAction] = useState<CommonActions.CREATE | CommonActions.UPDATE | 'none'>('none')
  const [open, setOpen] = useState<boolean>(!!action)
  const formSchemaRef = useRef<TCreateUserSchema | TUpdateUserSchema>(createUserSchema)

  const { data: employees } = useSuspenseQuery(
    getEmployeeQueryOptions({
      'position:in': `${Position.MANAGER},${Position.ORDER_PROCESSOR},${Position.WAREHOUSE_MANAGER}`,
      'is_active:eq': true,
      'work_status:ne': WorkStatus.EXITED,
      'user_id:eq': null,
    })
  )
  const mutation = useCreateOrUpdateUserMutataion(action)

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
      role: {},
      employee: {},
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
      formSchemaRef.current = createUserSchema
    } else {
      formSchemaRef.current = updateUserSchema
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
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Thông tin đăng nhập</FieldLegend>
              <FieldDescription>Người dùng sẽ sử dụng thông tin này để đăng nhập vào tài khoản.</FieldDescription>
              <FieldGroup>
                <FormField
                  name="employee"
                  listeners={{
                    onChange: ({ value }: { value: IEmployee }) => {
                      form.setFieldValue('username', value.employee_code)
                      form.setFieldValue('password', value.employee_code)
                    },
                  }}
                >
                  {(field) => {
                    return (
                      <ComboboxFieldControl
                        field={field}
                        label="Nhân viên"
                        items={employees}
                        labelField="full_name"
                        valueField="id"
                        renderItem={(employee: IEmployee) => (
                          <Item size="xs">
                            <ItemMedia>
                              <Avatar>
                                <AvatarImage
                                  src={generateAvatar({
                                    name: employee.full_name,
                                  })}
                                />
                                <AvatarFallback>{employee.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </ItemMedia>
                            <ItemContent>
                              <ItemTitle className="capitalize">{employee.full_name}</ItemTitle>
                              <ItemDescription>{employee.phone}</ItemDescription>
                            </ItemContent>
                          </Item>
                        )}
                      />
                    )
                  }}
                </FormField>
                <FormField name="username">
                  {(field) => {
                    return (
                      <InputFieldControl
                        field={field}
                        label="Tên đăng nhập"
                        type="text"
                        readOnly
                        placeholder="Tên đăng nhập"
                        description="Tên đăng nhập mặc định sẽ là mã nhân viên"
                      />
                    )
                  }}
                </FormField>
                <FormField name="password">
                  {(field) => {
                    return (
                      <InputFieldControl
                        field={field}
                        label="Mật khẩu"
                        placeholder="******"
                        type="password"
                        description="Mật khẩu đăng nhập mặc định sẽ là mã nhân viên. Bạn có thể đặt 1 mật khẩu tạm thời khác để người dùng dễ nhớ hơn, sau đó yêu cầu họ thay đổi đổi."
                      />
                    )
                  }}
                </FormField>
                <FormField
                  name="role"
                  children={(field) => {
                    return (
                      <SelectFieldControl
                        field={field}
                        label="Vai trò"
                        items={ROLE_OPTIONS}
                        labelField="label"
                        valueField="value"
                      />
                    )
                  }}
                />
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

export default UserFormDialog
