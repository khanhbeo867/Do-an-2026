import { useDeleteCategoryMutation } from '@/apis/category/hooks/use-category-request'
import type { ICategory } from '@/apis/category/types'
import { CommonActions } from '@/common/constants/enums'
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
import { usePageEventContext } from '@/contexts/event-context'
import { useReactive } from 'ahooks'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { getMutationKeys } from './utils'

const DeleteAlertDialog: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false)
  const dataRef = useReactive<{ current: Pick<ICategory, 'id' | 'type' | 'is_active'> | null }>({ current: null })
  const { mutateAsync, isPending } = useDeleteCategoryMutation(getMutationKeys(dataRef.current?.type!))
  const { event$ } = usePageEventContext()

  event$.useSubscription(
    (e: { action: CommonActions.DELETE; payload: Pick<ICategory, 'id' | 'type' | 'is_active'> }) => {
      if (e.action === CommonActions.DELETE) {
        setOpen(e.action === CommonActions.DELETE)
        dataRef.current = e.payload
      }
    }
  )

  return (
    <AlertDialog open={open || isPending} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn chắc muốn xóa danh mục này?</AlertDialogTitle>
          <AlertDialogDescription>
            {!dataRef.current?.is_active
              ? 'Hành động này không thể hoàn tác. Vui lòng xác nhận nếu bạn muốn tiếp tục.'
              : 'Danh mục này sẽ bị ẩn và sẽ không được sủ dụng cho các sản phẩm tiếp theo'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={async () =>
              await mutateAsync({ id: dataRef.current?.id!, permanantly: !dataRef.current?.is_active })
                .then(() => {
                  setOpen(false)
                  toast.success('Xóa danh mục thành công')
                })
                .catch(() => toast.error('Có lỗi xảy ra, vui lòng thử lại'))
            }
          >
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteAlertDialog
