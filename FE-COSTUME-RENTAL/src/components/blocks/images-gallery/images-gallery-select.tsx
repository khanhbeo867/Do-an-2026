import { useGetImagesQuery } from '@/apis/image/hooks/use-image-request'
import type { IImage } from '@/apis/image/types'
import { ItemType } from '@/common/constants/enums'
import { rewriteImageUrl } from '@/common/helpers/image-url'
import { GalleryUpload } from '@/components/shared/gallery-upload'
import Image from '@/components/shared/image'
import { Checkbox } from '@/components/ui/checkbox'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Typography } from '@/components/ui/typography'
import { groupBy } from 'lodash-es'
import { ImageIcon } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import UploadImageForm from './upload-image-form'

type TImagesGalleryProps = {
  type: 'any' | ItemType
  selected?: IImage[]
  onSelect?: (value: IImage[]) => any
  onTabChange?: (value: 'any' | ItemType) => any
} & React.ComponentProps<'div'>

export const IMAGE_SELECTION_SUBMIT_BTN_ID = 'image-select-submit-btn'

const ImagesGallary: React.FC<TImagesGalleryProps> = ({ type, selected, onSelect, onTabChange }) => {
  const { data: images, isLoading } = useGetImagesQuery()
  const [selectedImages, setSelectedImages] = useState<IImage[]>(selected ?? [])

  return (
    <>
      <Tabs
        defaultValue={type}
        onValueChange={(value) => {
          if (typeof onTabChange === 'function') onTabChange(value)
        }}
      >
        <TabsList variant="line" className="sticky top-0 z-20 bg-inherit ">
          <TabsTrigger value={ItemType.COSTUME}>Trang Phục</TabsTrigger>
          <TabsTrigger value={ItemType.EQUIPMENT_PROPS}>Đạo Cụ</TabsTrigger>
          <TabsTrigger value={'UPLOAD'}>Tải lên</TabsTrigger>
        </TabsList>
        <TabsContent value={ItemType.COSTUME} className="py-6 max-h-125 overflow-auto">
          <ImageList
            data={images ?? []}
            isLoading={isLoading}
            selected={selectedImages}
            onSelect={setSelectedImages}
            type={ItemType.COSTUME}
          />
        </TabsContent>
        <TabsContent value={ItemType.EQUIPMENT_PROPS} className="py-6 max-h-125 overflow-auto">
          <ImageList
            data={images ?? []}
            isLoading={isLoading}
            selected={selectedImages}
            onSelect={setSelectedImages}
            type={ItemType.EQUIPMENT_PROPS}
          />
        </TabsContent>
        <TabsContent value={'UPLOAD'} className="py-6 max-h-125 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <UploadImageForm />
          </div>
        </TabsContent>
      </Tabs>

      <button
        id={IMAGE_SELECTION_SUBMIT_BTN_ID}
        className="hidden"
        onClick={() => {
          if (typeof onSelect === 'function') onSelect(selectedImages)
        }}
      />
    </>
  )
}

type TImageListProps = {
  data: IImage[]
  type: ItemType
  isLoading: boolean
  selected: IImage[]
  onSelect: React.Dispatch<React.SetStateAction<IImage[]>>
}

const ImageList: React.FC<TImageListProps> = ({ data, isLoading, type, selected, onSelect }) => {
  return (
    <div className="space-y-10">
      {isLoading ? (
        Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="max-w-sm aspect-square" />)
      ) : !Array.isArray(data) || data.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <ImageIcon />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Không tìm thấy hình ảnh nào</EmptyTitle>
            <EmptyDescription>
              Có vẻ như bạn chưa tải lên hình ảnh nào. Hãy bắt đầu bằng cách thêm một hình ảnh mới để hiển thị ở đây.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="max-w-4xl">
            <GalleryUpload />
          </EmptyContent>
        </Empty>
      ) : (
        Object.entries(
          groupBy(
            data.filter((item) => item.category?.type === type),
            (img) => `${img.category_id}.${img?.category?.name}`
          )
        ).map(([category, images]) => (
          <div key={category} className="flex flex-col space-y-3">
            <Typography variant="small" color="muted">
              {category.split('.').at(-1)}
            </Typography>
            <div className="grid grid-cols-2 md:max-lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {images.map((image) => (
                <label key={image.id} className="relative cursor-pointer" htmlFor={`image-${image.id}`}>
                  <Checkbox
                    id={`image-${image.id}`}
                    className="absolute top-2 left-2"
                    checked={Array.isArray(selected) && selected.some((img) => img.id === image.id)}
                    onCheckedChange={(checked) => {
                      if (typeof onSelect === 'function') {
                        if (checked) onSelect((prev) => [...prev!, image])
                        else onSelect((prev) => prev!?.filter((img) => img.id !== image.id))
                      }
                    }}
                  />
                  <Image
                    src={rewriteImageUrl(image.dest)}
                    alt={image.file_name}
                    className="w-full aspect-square object-cover rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default ImagesGallary
