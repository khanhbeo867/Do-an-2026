import { useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import { ImageMimeType } from '@/apis/image/constants'
import { useGetImagesQuery } from '@/apis/image/hooks/use-image-request'
import type { TSearchImagesValues } from '@/apis/image/schemas/search.schema'
import { ItemType } from '@/common/constants/enums'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@/components/ui/combobox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { format, subDays } from 'date-fns'
import { groupBy, isNil, omit, omitBy } from 'lodash-es'
import { CalendarIcon, FileIcon, RefreshCcwIcon, XIcon } from 'lucide-react'
import { Activity, useMemo, useRef, useState } from 'react'

const ImageGalleryToolbar: React.FC = () => {
  const { refetch } = useGetImagesQuery()

  const search = useSearch({
    from: '/_private-layout/images-gallery',
    select: (state) => ({ mime_type: state.mime_type, from: state.from, to: state.to }),
    structuralSharing: false,
  })
  const navigate = useNavigate({ from: '/images-gallery' })

  return (
    <div className="flex h-(--gallery-toolbar-height) items-center gap-x-2">
      <MimeTypeSelect />
      <CreateDateSelect />
      <CategoryCombobox />
      <Activity mode={Object.values(search).every(isNil) ? 'hidden' : 'visible'}>
        <Button
          variant="secondary"
          onClick={() => navigate({ search: (prev) => omit(prev, ['mime_type', 'from', 'to']) })}
        >
          <XIcon />
          Clear filters
        </Button>
      </Activity>
      <Button variant="outline" className="ml-auto" onClick={() => refetch()}>
        <RefreshCcwIcon />
        Tải lại
      </Button>
    </div>
  )
}

const CategoryCombobox: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false)
  const { data } = useGetCategoriesQuery()
  const navigate = useNavigate({ from: '/images-gallery' })
  const category = useSearch({
    from: '/_private-layout/images-gallery',
    select: (state) => state.category,
  })

  const optionGroups = useMemo(() => {
    if (!Array.isArray(data)) return []

    const categoryLabelMap = new Map<ItemType, string>([
      [ItemType.COSTUME, 'Trang phục'],
      [ItemType.EQUIPMENT_PROPS, 'Đạo cụ'],
    ])

    return Object.entries(groupBy(data, (category) => category.type)).map(([type, items]) => ({
      label: categoryLabelMap.get(type as ItemType),
      items: items.map((item) => ({
        label: item.name,
        value: item.slug,
      })),
    }))
  }, [])

  const currentCategory = useMemo(() => {
    if (!Array.isArray(data) || !category) return null

    return {
      label: data.find((cate) => cate.slug === category)?.name ?? '',
      value: category,
    }
  }, [category, data])

  return (
    <Combobox
      open={open}
      onOpenChange={setOpen}
      items={optionGroups}
      value={currentCategory}
      itemToStringLabel={(item: { label: string; value: string }) => item.label}
      itemToStringValue={(item: { label: string; value: string }) => item.value}
      isItemEqualToValue={(itemValue, value) => itemValue.value === value.value}
      onValueChange={(value) =>
        navigate({
          search: (old) => ({ ...old, category: value?.value }),
        })
      }
    >
      <ComboboxInput placeholder="Tất cả danh mục" />
      <ComboboxContent className="w-fit">
        <ComboboxEmpty>Không có kết quả phù hợp</ComboboxEmpty>
        <ComboboxList>
          {(group: { label: string; items: Array<Record<'label' | 'value', string>> }) => (
            <ComboboxGroup key={group.label.toLowerCase().replace(' ', '-')} items={group.items}>
              <ComboboxLabel>{group.label}</ComboboxLabel>
              <ComboboxCollection>
                {(option) => <ComboboxItem value={option}>{option.label}</ComboboxItem>}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

const MimeTypeSelect: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false)
  // const { table } = useTableContext('table')

  const mimeType = useSearch({
    from: '/_private-layout/images-gallery',
    select: (state) => state.mime_type,
  })
  const navigate = useNavigate({ from: '/images-gallery' })

  const imageFormatOptions = useRef<Array<{ label: string; value: ImageMimeType }>>([
    { label: '.avif', value: ImageMimeType.AVIF },
    { label: '.bmp', value: ImageMimeType.BMP },
    { label: '.jpeg', value: ImageMimeType.JPEG },
    { label: '.jpg', value: ImageMimeType.JPG },
    { label: '.png', value: ImageMimeType.PNG },
    { label: '.webp', value: ImageMimeType.WEBP },
  ])

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      items={imageFormatOptions.current}
      value={mimeType ?? ''}
      onValueChange={(value) =>
        navigate({
          search: (old) => ({ ...old, mime_type: value as ImageMimeType }),
        })
      }
    >
      <SelectTrigger
        onClick={(e) => e.preventDefault()}
        render={
          <Button variant="outline">
            <span className="inline-flex items-center gap-x-2" onClick={() => setOpen(!open)}>
              <FileIcon />
              {imageFormatOptions.current.find((format) => format?.value === mimeType)?.label ?? 'Tất cả định dạng'}
            </span>
          </Button>
        }
      />
      <SelectContent>
        {imageFormatOptions.current.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-x-2">
              <FileIcon />
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const CreateDateSelect: React.FC = () => {
  const navigate = useNavigate({ from: '/images-gallery' })
  const date = useSearch({
    from: '/_private-layout/images-gallery',
    select: (state) => ({ from: state.from, to: state.to }),
  })

  const presetOptions = useMemo(() => {
    return [
      { label: 'Today', value: '0', from: format(new Date(), 'yyyy-MM-dd') },
      { label: 'In 7 days', value: '7', from: format(subDays(new Date(), 7), 'yyyy-MM-dd'), to: new Date() },
      { label: 'In 30 days', value: '30', from: format(subDays(new Date(), 30), 'yyyy-MM-dd'), to: new Date() },
    ]
  }, [])

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" id="date-picker-range" className="justify-start px-2.5 font-normal">
            <CalendarIcon
              aria-current={date.from ? 'date' : undefined}
              className="aria-[current=date]:stroke-foreground stroke-muted-foreground"
            />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(new Date(date.from), 'LLL dd, y')
              )
            ) : (
              <span className="text-muted-foreground">Chọn ngày</span>
            )}
          </Button>
        }
      />
      <PopoverContent className="flex w-auto flex-col items-stretch space-y-2 p-2" align="start">
        <Select
          items={presetOptions}
          onValueChange={(value) => {
            if (!value) return
            let from: string | undefined
            let to: string | undefined
            switch ((value as { label: string; value: string; from: string; to?: string }).value) {
              case '0':
                from = format(new Date(), 'yyyy-MM-dd')
                to = undefined
                break
              case '7':
                from = format(subDays(new Date(), 7), 'yyyy-MM-dd')
                to = format(new Date(), 'yyyy-MM-dd')
                break
              case '30':
                from = format(subDays(new Date(), 30), 'yyyy-MM-dd')
                to = format(new Date(), 'yyyy-MM-dd')
                break
            }
            navigate({
              search: (old) => omitBy<TSearchImagesValues>({ ...old, from, to } as TSearchImagesValues, isNil),
            })
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a date range" />
          </SelectTrigger>
          <SelectContent>
            {presetOptions.map((option) => (
              <SelectItem key={option.value} value={option}>
                <span className="flex items-center gap-x-2">
                  <CalendarIcon />
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Calendar
          className="p-0"
          mode="range"
          defaultMonth={date?.from ? new Date(date.from) : undefined}
          selected={{
            from: date?.from ? new Date(date.from) : undefined,
            to: date?.to ? new Date(date.to) : undefined,
          }}
          onSelect={(date) =>
            navigate({
              search: (old) => ({
                ...old,
                from: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
                to: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined,
              }),
            })
          }
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  )
}

export default ImageGalleryToolbar
