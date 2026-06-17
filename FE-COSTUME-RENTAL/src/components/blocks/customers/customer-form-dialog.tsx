import { getEmployeeQueryOptions } from '@/apis/employee/hooks/use-employee-request'
import type { IEmployee } from '@/apis/employee/types'
import { UserRole } from '@/apis/auth/constants'
import { useCreateOrUpdateUserMutataion } from '@/apis/user/hooks/use-user-request'
import { updateUserSchema } from '@/apis/user/schemas/update-user.schema'
import { CommonActions } from '@/common/constants/enums'
import { ComboboxFieldControl } from '@/components/forms/combobox-field-control'
import InputFieldControl from '@/components/forms/input-field-control'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { usePageEventContext } from '@/contexts/event-context'
import generateAvatar from '@/lib/generate-avatar'
import { Switch } from '@/components/ui/switch'

import { useForm } from '@tanstack/react-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import React, { useState, useMemo } from 'react'

const CustomerFormDialog: React.FC = () => {
  const { event$ } = usePageEventContext()
  const [open, setOpen] = useState<boolean>(false)
  const [currentUserEmployee, setCurrentUserEmployee] = useState<IEmployee | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  const { data: unlinkedEmployees } = useSuspenseQuery(
    getEmployeeQueryOptions({
      'is_active:eq': true,
      'user_id:eq': null,
    })
  )

  // Combine currently linked employee (if any) with available unlinked ones
  const employeesOptions = useMemo(() => {
    if (!currentUserEmployee) return unlinkedEmployees
    const exists = unlinkedEmployees.some((emp) => emp.id === currentUserEmployee.id)
    if (exists) return unlinkedEmployees
    return [currentUserEmployee, ...unlinkedEmployees]
  }, [unlinkedEmployees, currentUserEmployee])

  const mutation = useCreateOrUpdateUserMutataion(CommonActions.UPDATE)

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
      is_active: true,
      employee: {} as IEmployee,
    },
    onSubmit: async ({ value }) => {
      if (!userId || typeof mutation?.mutateAsync !== 'function') return

      const payload: any = {
        id: userId,
        username: value.username,
        is_active: value.is_active,
        role: { label: 'Thành viên', value: UserRole.USER },
      }

      if (value.password) {
        payload.password = value.password
      }

      if (value.employee && value.employee.id) {
        payload.employee = { id: value.employee.id }
      } else {
        payload.employee_id = null
      }

      await mutation.mutateAsync(payload)
      setOpen(false)
    },
    validators: { onSubmit: updateUserSchema as any },
  })

  event$.useSubscription((e) => {
    if (e.action !== CommonActions.UPDATE) return
    setUserId(e.payload.id)
    setCurrentUserEmployee(e.payload.employee || null)
    setOpen(true)

    form.reset({
      username: e.payload.username || '',
      password: '',
      is_active: typeof e.payload.is_active === 'boolean' ? e.payload.is_active : true,
      employee: e.payload.employee || {},
    }, { keepDefaultValues: true })
  })

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    form.handleSubmit()
  }

  const { Field: FormField } = form

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(open) => {
        if (!open) {
          form.reset()
          setUserId(null)
          setCurrentUserEmployee(null)
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Thông tin tài khoản khách hàng</FieldLegend>
              <FieldDescription>Cập nhật thông tin đăng nhập và hồ sơ liên kết cho khách hàng.</FieldDescription>
              <FieldGroup>
                <FormField name="username">
                  {(field) => {
                    return (
                      <InputFieldControl
                        field={field}
                        label="Tên đăng nhập"
                        type="text"
                        placeholder="Tên đăng nhập"
                      />
                    )
                  }}
                </FormField>
                <FormField name="password">
                  {(field) => {
                    return (
                      <InputFieldControl
                        field={field}
                        label="Mật khẩu mới (Bỏ trống nếu không đổi)"
                        placeholder="******"
                        type="password"
                        description="Đặt mật khẩu mới nếu khách hàng quên mật khẩu."
                      />
                    )
                  }}
                </FormField>

                <FormField name="is_active">
                  {(field) => (
                    <Field orientation="horizontal" className="justify-between items-center py-2">
                      <div>
                        <span className="text-sm font-medium">Trạng thái hoạt động</span>
                        <p className="text-xs text-muted-foreground">Kích hoạt hoặc tạm khóa tài khoản khách hàng này.</p>
                      </div>
                      <Switch
                        checked={field.state.value}
                        onCheckedChange={field.handleChange}
                      />
                    </Field>
                  )}
                </FormField>

                <FormField name="employee">
                  {(field) => {
                    return (
                      <ComboboxFieldControl
                        field={field}
                        label="Hồ sơ khách hàng"
                        items={employeesOptions}
                        labelField="full_name"
                        valueField="id"
                        description="Liên kết tài khoản này với một hồ sơ cá nhân để hiển thị Họ tên, Số điện thoại và Email."
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
                              <ItemDescription>{employee.phone || 'Không có số điện thoại'}</ItemDescription>
                            </ItemContent>
                          </Item>
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

export default CustomerFormDialog
