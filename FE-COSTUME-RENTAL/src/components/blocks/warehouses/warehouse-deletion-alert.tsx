import { useDeleteWarehouseMutation } from '@/apis/warehouse/hooks/use-warehouse-request'
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
import { useState } from 'react'
import { toast } from 'sonner'
import { usePubSubSubscription } from '.'

const WarehouseDeletionAlert: React.FC = () => {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteWarehouseMutation()

  usePubSubSubscription('warehouse:delete', (warehouseId) => {
    setDeletingId(warehouseId)
  })

  const handleDeleteImage = async () => {
    try {
      if (!deletingId) return
      await deleteAsync({ id: deletingId!, permanantly: true })
      toast.success('Đã xóa kho khỏi hệ thống')
      setDeletingId(null)
    } catch {
      toast.error('Xóa thất bại')
    }
  }

  return (
    <AlertDialog
      open={deletingId !== null || isDeleting}
      onOpenChange={(open) => {
        if (!open) {
          setDeletingId(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn chắc chắn muốn xóa ?</AlertDialogTitle>
          <AlertDialogDescription>
            Thao tác này không thể hoàn tác. Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeletingId(null)}>Hủy</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={handleDeleteImage}>
            {isDeleting ? 'Đang xóa ...' : 'Tiếp tục'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default WarehouseDeletionAlert
