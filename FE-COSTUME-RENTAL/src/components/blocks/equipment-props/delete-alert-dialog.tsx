import { useDeletePropsMutation } from '@/apis/equipment-props/hooks/use-equipment-props-request'
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
import React, { useRef, useState } from 'react'
import { toast } from 'sonner'

const DeleteAlertDialog: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false)
  const { mutateAsync: deleteCostume, isPending: isDeleting } = useDeletePropsMutation()
  const { event$ } = usePageEventContext()
  const currentCostumeIdRef = useRef<number | null>(null)

  event$.useSubscription((e: { action: CommonActions.DELETE; payload: number }) => {
    if (e.action === CommonActions.DELETE) {
      setOpen(e.action === CommonActions.DELETE)
      currentCostumeIdRef.current = e.payload
    }
  })

  return (
    <AlertDialog open={open || isDeleting} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn chắc muốn xóa đạo cụ này?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Vui lòng xác nhận nếu bạn muốn tiếp tục.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={async () =>
              await deleteCostume(currentCostumeIdRef.current!)
                .then(() => {
                  setOpen(false)
                  toast.success('Xóa đạo cụ thành công')
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
