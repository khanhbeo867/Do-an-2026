import { UserRole } from '@/apis/auth/constants'
import { useCreateCustomerMutation, useCreateOrUpdateUserMutataion } from '@/apis/user/hooks/use-user-request'
import { createCustomerSchema } from '@/apis/user/schemas/create-customer.schema'
import { updateUserSchema } from '@/apis/user/schemas/update-user.schema'
import { CommonActions } from '@/common/constants/enums'
import InputFieldControl from '@/components/forms/input-field-control'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { usePageEventContext } from '@/contexts/event-context'

import { useForm } from '@tanstack/react-form'
import React, { useRef, useState } from 'react'

type DialogMode = CommonActions.CREATE | CommonActions.UPDATE | null

const CustomerFormDialog: React.FC = () => {
  const { event$ } = usePageEventContext()
  const [open, setOpen] = useState<boolean>(false)
  const [mode, setMode] = useState<DialogMode>(null)

  const updateMutation = useCreateOrUpdateUserMutataion(CommonActions.UPDATE)
  const createMutation = useCreateCustomerMutation()

  const formSchemaRef = useRef<typeof createCustomerSchema | typeof updateUserSchema>(createCustomerSchema)

  // CREATE form
  const createForm = useForm({
    defaultValues: {
      email: '',
      phone: '',
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value)
      setOpen(false)
    },
    validators: { onSubmit: createCustomerSchema as any },
  })

  // UPDATE form
  const updateForm = useForm({
    defaultValues: {
      id: undefined as number | undefined,
      username: '',
      password: '',
      is_active: true,
      phone: '',
    },
    onSubmit: async ({ value }) => {
      if (!value.id || typeof updateMutation?.mutateAsync !== 'function') return

      const payload: any = {
        id: value.id,
        username: value.username,
        is_active: value.is_active,
        phone: value.phone || null,
        role: { label: 'Thành viên', value: UserRole.USER },
        employee_id: null,
      }

      if (value.password) {
        payload.password = value.password
      }

      await updateMutation.mutateAsync(payload)
      setOpen(false)
    },
    validators: { onSubmit: updateUserSchema as any },
  })

  event$.useSubscription((e) => {
    if (e.action === CommonActions.CREATE) {
      setMode(CommonActions.CREATE)
      setOpen(true)
      createForm.reset()
      return
    }

    if (e.action === CommonActions.UPDATE) {
      setMode(CommonActions.UPDATE)
      setOpen(true)
      updateForm.reset(
        {
          id: e.payload.id,
          username: e.payload.username || '',
          password: '',
          is_active: typeof e.payload.is_active === 'boolean' ? e.payload.is_active : true,
          phone: e.payload.phone || '',
        },
        { keepDefaultValues: true },
      )
    }
  })

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (mode === CommonActions.CREATE) createForm.handleSubmit()
    else updateForm.handleSubmit()
  }

  const { Field: CreateField } = createForm
  const { Field: UpdateField } = updateForm

  const isCreating = mode === CommonActions.CREATE

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(open) => {
        if (!open) {
          createForm.reset()
          updateForm.reset()
          setMode(null)
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>
                {isCreating ? 'Thêm tài khoản khách hàng' : 'Thông tin tài khoản khách hàng'}
              </FieldLegend>
              <FieldDescription>
                {isCreating
                  ? 'Tạo tài khoản mới cho khách hàng. Khách hàng có thể dùng tài khoản này để đăng nhập.'
                  : 'Cập nhật thông tin đăng nhập cho khách hàng.'}
              </FieldDescription>
              <FieldGroup>
                {isCreating ? (
                  <>
                    <CreateField name="email">
                      {(field) => (
                        <InputFieldControl
                          field={field}
                          label="Email"
                          type="text"
                          placeholder="Nhập email (không bắt buộc)"
                        />
                      )}
                    </CreateField>
                    <CreateField name="phone">
                      {(field) => (
                        <InputFieldControl
                          field={field}
                          label="Số điện thoại"
                          type="tel"
                          placeholder="Nhập số điện thoại"
                        />
                      )}
                    </CreateField>
                    <CreateField name="username">
                      {(field) => (
                        <InputFieldControl
                          field={field}
                          label="Tên đăng nhập"
                          type="text"
                          placeholder="Tên đăng nhập (tối thiểu 3 ký tự)"
                        />
                      )}
                    </CreateField>
                    <CreateField name="password">
                      {(field) => (
                        <InputFieldControl
                          field={field}
                          label="Mật khẩu"
                          placeholder="******"
                          type="password"
                          description="Mật khẩu phải có tối thiểu 6 ký tự."
                        />
                      )}
                    </CreateField>
                  </>
                ) : (
                  <>
                    <UpdateField name="phone">
                      {(field) => (
                        <InputFieldControl
                          field={field}
                          label="Số điện thoại"
                          type="tel"
                          placeholder="Số điện thoại"
                        />
                      )}
                    </UpdateField>
                    <UpdateField name="username">
                      {(field) => (
                        <InputFieldControl
                          field={field}
                          label="Tên đăng nhập"
                          type="text"
                          placeholder="Tên đăng nhập"
                        />
                      )}
                    </UpdateField>
                    <UpdateField name="password">
                      {(field) => (
                        <InputFieldControl
                          field={field}
                          label="Mật khẩu mới (Bỏ trống nếu không đổi)"
                          placeholder="******"
                          type="password"
                          description="Đặt mật khẩu mới nếu khách hàng quên mật khẩu."
                        />
                      )}
                    </UpdateField>

                    <UpdateField name="is_active">
                      {(field) => (
                        <Field orientation="horizontal" className="justify-between items-center py-2">
                          <div>
                            <span className="text-sm font-medium">Trạng thái hoạt động</span>
                            <p className="text-xs text-muted-foreground">
                              Kích hoạt hoặc tạm khóa tài khoản khách hàng này.
                            </p>
                          </div>
                          <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                        </Field>
                      )}
                    </UpdateField>
                  </>
                )}
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
          <Field orientation="horizontal" className="justify-end">
            <Button type="submit">{isCreating ? 'Tạo tài khoản' : 'Xác nhận'}</Button>
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
