import { Button } from '@/components/ui/button'
import { ImageUpIcon } from 'lucide-react'
import type React from 'react'
import { usePubSub } from '.'

const ImageUploadDialogTrigger: React.FC<React.ComponentProps<typeof Button>> = (props) => {
  const { publish } = usePubSub()

  return (
    <Button {...props} onClick={() => publish('image:create', {})}>
      <ImageUpIcon /> Tải lên hình ảnh
    </Button>
  )
}

export default ImageUploadDialogTrigger
