import { Position } from '@/apis/employee/constants'
import { useGetEmployeesQuery } from '@/apis/employee/hooks/use-employee-request'
import type { IEmployee } from '@/apis/employee/types'
import { useCreateOrUpdateWarehouseMutation } from '@/apis/warehouse/hooks/use-warehouse-request'
import { createWarehouseSchema, type TCreateWarehouseSchema } from '@/apis/warehouse/schemas/create-warehouse.schema'
import { updateWarehouseSchema, type TUpdateWarehouseSchema } from '@/apis/warehouse/schemas/update-warehouse.schema'
import { CommonActions } from '@/common/constants/enums'
import { ComboboxFieldControl } from '@/components/forms/combobox-field-control'
import InputFieldControl from '@/components/forms/input-field-control'
import SelectFieldControl from '@/components/forms/select-field-control'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import generateAvatar from '@/lib/generate-avatar'
import { useForm } from '@tanstack/react-form'
import React, { useRef, useState } from 'react'
import { z } from 'zod'
import { usePubSubSubscription } from '.'
import { WAREHOUSE_TYPE_OPTIONS } from './constant'

const WarehouseFormDialog: React.FC = () => {
  const [action, setAction] = useState<CommonActions.CREATE | CommonActions.UPDATE | 'none'>('none')
  const formSchemaRef = useRef<TCreateWarehouseSchema | TUpdateWarehouseSchema | any>(z.any())
  const { data: employees } = useGetEmployeesQuery({ 'position:in': Position.WAREHOUSE_MANAGER })
  const { mutateAsync, isPending } = useCreateOrUpdateWarehouseMutation(action)

  const form = useForm({
    defaultValues: {
      name: '',
      type: { label: '', value: '' },
      managed_by: { id: 0, full_name: '' },
    },
    onSubmit: ({ value }) => mutateAsync(value).then(() => setAction('none')),

    validators: {
      onSubmit: formSchemaRef.current,
    },
  })

  usePubSubSubscription('warehouse:create', () => {
    formSchemaRef.current = createWarehouseSchema.superRefine((values, context) => {
      if (!values?.managed_by?.id || !values?.managed_by?.full_name)
        context.addIssue({
          code: 'custom',
          message: 'Vui lòng chọn nhân viên quản lý',
          path: ['managed_by'],
        })
    })
    form.reset()
    setAction(CommonActions.CREATE)
  })

  usePubSubSubscription('warehouse:update', (data) => {
    formSchemaRef.current = updateWarehouseSchema
    form.reset(data, { keepDefaultValues: true })
    setAction(CommonActions.UPDATE)
  })

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    form.handleSubmit()
  }

  const FieldItem = form.Field

  return (
    <Dialog
      open={action !== 'none'}
      onOpenChange={(open) => {
        if (!open) setAction('none')
      }}
    >
      <DialogContent className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldLegend>{action === CommonActions.CREATE ? 'Tạo mới kho' : 'Cập nhật kho'}</FieldLegend>
            <FieldDescription>
              {action === CommonActions.CREATE
                ? 'Điền thông tin để tạo mới kho'
                : 'Điều chỉnh thông tin và lưu để cập nhật kho'}
            </FieldDescription>
            <FieldGroup>
              <FieldItem name="name">
                {(field) => (
                  <InputFieldControl
                    field={field}
                    label="Tên kho"
                    placeholder="Nhập tên kho"
                    description="Tên kho phải là duy nhất và không được để trống"
                  />
                )}
              </FieldItem>
              <FieldItem name="type">
                {(field) => (
                  <SelectFieldControl
                    field={field}
                    label="Loại kho"
                    placeholder="Chọn loại kho"
                    items={WAREHOUSE_TYPE_OPTIONS}
                    labelField="label"
                    valueField="value"
                    description={`Loại kho xác định loại trang phục hoặc đạo cụ mà kho này quản lý. Vui lòng chọn loại phù hợp với nội dung bạn sẽ lưu trữ trong kho này.`}
                  />
                )}
              </FieldItem>
              <FieldItem name="managed_by">
                {(field) => (
                  <ComboboxFieldControl
                    field={field}
                    label="Nhân viên quản lý"
                    items={employees ?? []}
                    labelField={'full_name'}
                    valueField={'id'}
                    description="Nhân viên chịu trách nhiệm quản lý nhập/xuất và tồn kho"
                    renderItem={(item: IEmployee) => (
                      <Item className="p-0" size="xs">
                        <ItemMedia>
                          <Avatar>
                            <AvatarImage src={generateAvatar({ name: item?.full_name })} />
                            <AvatarFallback>{item?.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{item.full_name}</ItemTitle>
                          <ItemDescription>{item.email}</ItemDescription>
                        </ItemContent>
                      </Item>
                    )}
                  />
                )}
              </FieldItem>
              <Field orientation={'horizontal'} className="justify-end">
                <DialogClose className={buttonVariants({ variant: 'secondary' })} onClick={() => form.reset()}>
                  Hủy
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner />} Xác nhận
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default WarehouseFormDialog
