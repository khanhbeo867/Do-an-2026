import { useDeleteImageMutation } from '@/apis/image/hooks/use-image-request'
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

const ImageDeletionAlert: React.FC = () => {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteImageMutation()

  usePubSubSubscription('image:delete', (imageId) => {
    setDeletingId(imageId)
  })

  const handleDeleteImage = async () => {
    try {
      if (!deletingId) return
      await deleteAsync(deletingId!)
      toast.success('Xóa ảnh thành công')
      setDeletingId(null)
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
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

export default ImageDeletionAlert
