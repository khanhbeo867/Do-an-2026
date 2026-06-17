import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { CellContext } from '@tanstack/react-table'
import { EllipsisVerticalIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

import type { IImage } from '@/apis/image/types'
import { getImageUrl } from '@/common/helpers/image-url'
import { usePubSub } from '.'

const ImageActionsDropdown: React.FC<CellContext<IImage, any>> = ({ row }) => {
  const { publish } = usePubSub()

  const handleDownload = async () => {
    try {
      const imageUrl = getImageUrl(row.original.dest)

      // Fetch file từ URL
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      // Convert response thành blob
      const blob = await response.blob()

      // Tạo URL từ blob và download
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = row.original.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)

      toast.success('Download file successfully')
    } catch (error) {
      console.error('Download failed', error)
      toast.error('Download file failed')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}>
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start">
        <DropdownMenuItem onClick={handleDownload}>Tải xuống hình ảnh</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            publish('image:update', {
              id: row.original.id,
              file_name: row.original.file_name,
              category: {
                label: row.original.category.name,
                value: row.original.category.id,
              },
            })
          }
        >
          Cập nhật
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => publish('image:delete', row.original.id)}>Xóa</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ImageActionsDropdown
