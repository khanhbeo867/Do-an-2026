import { Dialog, DialogContent } from '@/components/ui/dialog'
import React, { useState } from 'react'
import { usePubSubSubscription } from '.'
import UploadImageForm from './upload-image-form'

const UploadImageDialog: React.FC = () => {
  const [open, setOpen] = useState(false)

  usePubSubSubscription('image:create', () => {
    setOpen(true)
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl ">
        <UploadImageForm modal={true} onModalChange={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

export default UploadImageDialog
