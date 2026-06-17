import {
  FileTextIcon,
  GiftIcon,
  HomeIcon,
  Layers3Icon,
  LogInIcon,
  SearchIcon,
  SparklesIcon,
  TagIcon,
} from 'lucide-react'
import * as React from 'react'

import { useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import { ITEM_TYPE_MAP } from '@/common/constants/const'
import type { ItemType } from '@/common/constants/enums'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useNavigate } from '@tanstack/react-router'

export function SearchDialog() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const { data: categories } = useGetCategoriesQuery()

  const goTo = React.useCallback(
    (
      to: '/' | '/products' | '/policies' | '/login',
      options?: {
        hash?: string
        search?: {
          item_type?: ItemType
          'category_slug:eq'?: string
        }
      }
    ) => {
      setOpen(false)
      navigate({
        to,
        ...(options?.hash ? { hash: options.hash } : {}),
        ...(options?.search ? { search: options.search } : {}),
      })
    },
    [navigate]
  )

  const mainNavigationItems = React.useMemo(
    () => [
      {
        value: 'trang chủ home',
        label: 'Trang chủ',
        description: 'Giới thiệu tổng quan về cửa hàng',
        icon: HomeIcon,
        onSelect: () => goTo('/'),
      },
      {
        value: 'sản phẩm products thuê áo dài đạo cụ',
        label: 'Sản phẩm',
        description: 'Danh sách toàn bộ sản phẩm cho thuê',
        icon: SparklesIcon,
        onSelect: () => goTo('/products'),
      },
      {
        value: 'ưu đãi xu hướng khuyến mãi',
        label: 'Ưu đãi',
        description: 'Di chuyển đến phần ưu đãi trên trang chủ',
        icon: GiftIcon,
        onSelect: () => goTo('/', { hash: 'xu-huong' }),
      },
      {
        value: 'chính sách policies điều khoản',
        label: 'Chính sách',
        description: 'Thông tin chính sách cho thuê',
        icon: FileTextIcon,
        onSelect: () => goTo('/policies'),
      },
      {
        value: 'đăng nhập login hệ thống',
        label: 'Đăng nhập hệ thống',
        description: 'Truy cập màn hình đăng nhập',
        icon: LogInIcon,
        onSelect: () => goTo('/login'),
      },
    ],
    [goTo]
  )

  const categoryNavigationItems = React.useMemo(() => {
    if (!Array.isArray(categories)) return []

    return categories.map((category) => {
      const itemTypeLabel = ITEM_TYPE_MAP.get(category.type as ItemType)?.label ?? 'Danh mục'

      return {
        id: category.id,
        value: `${category.name} ${category.slug} ${itemTypeLabel} danh mục`,
        label: category.name,
        description: `${itemTypeLabel} - mở trang sản phẩm theo danh mục`,
        onSelect: () =>
          goTo('/products', {
            search: {
              item_type: category.type as ItemType,
              'category_slug:eq': category.slug,
            },
          }),
      }
    })
  }, [categories, goTo])

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        className="w-full justify-start min-w-44 sm:max-md:size-9! text-muted-foreground hover:text-muted-foreground bg-muted hover:bg-muted/50"
      >
        <SearchIcon />
        <span className="inline-block sm:max-md:hidden">Tìm kiếm ...</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} className="max-w-xl">
        <Command>
          <CommandInput placeholder="Tìm trang hoặc danh mục sản phẩm..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy trang phù hợp.</CommandEmpty>
            <CommandGroup heading="Trang điều hướng">
              {mainNavigationItems.map((item) => (
                <CommandItem key={item.label} value={item.value} onSelect={item.onSelect}>
                  <item.icon />
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Danh mục sản phẩm">
              {categoryNavigationItems.length === 0 ? (
                <CommandItem value="danh mục đang tải" disabled>
                  <Layers3Icon />
                  <span>Đang tải danh mục...</span>
                </CommandItem>
              ) : (
                categoryNavigationItems.map((item) => (
                  <CommandItem key={item.id} value={item.value} onSelect={item.onSelect}>
                    <TagIcon />
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
