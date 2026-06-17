import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Icon, type IconProps } from '@/components/ui/icon'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { type Header, flexRender } from '@tanstack/react-table'
import { useUpdate } from 'ahooks'
import { pick } from 'lodash-es'
import { useTableContext } from '../context/table.context'

type TableCellHeadProps = {
  header: Header<any, any>
}

const TableCellHead: React.FC<TableCellHeadProps> = ({ header }) => {
  const { columnDef, getIsResizing, getIsSorted, getToggleSortingHandler, getNextSortingOrder } = header.column
  const toggleSorting = columnDef.enableSorting ? getToggleSortingHandler() : undefined
  const rerender = useUpdate()
  const { table, event$ } = useTableContext('table', 'event$')

  const currentSortingState: IconProps['name'] = (() => {
    switch (getIsSorted()) {
      case 'asc':
        return 'ArrowUp'
      case 'desc':
        return 'ArrowDown'
      default:
        return 'ArrowUpDown'
    }
  })()

  const headerTitle = header.column.getCanSort()
    ? getNextSortingOrder() === 'asc'
      ? 'Sắp xếp tăng dần'
      : getNextSortingOrder() === 'desc'
        ? 'Sắp xếp giảm dần'
        : 'Bỏ sắp xếp'
    : undefined

  if (header.colSpan > 1) return <>{flexRender(columnDef.header, header.getContext())}</>

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={cn(
          'flex h-max w-full cursor-auto grid-cols-[14px_auto] items-center px-4 py-2 text-left text-xs capitalize select-none [&:has([role=button])]:w-full [&:has([role=button])]:justify-center [&:has([role=checkbox])]:w-full [&:has([role=checkbox])]:justify-center!',
          {
            'hover:text-foreground cursor-pointer gap-x-2': columnDef.enableSorting,
            'cursor-col-resize': getIsResizing(),
            'justify-center text-center': header.colSpan > 1 || columnDef.meta?.align === 'center',
            'justify-start text-left': columnDef.meta?.align === 'left',
            'justify-end': columnDef.meta?.align === 'right',
          }
        )}
        style={
          {
            '--icon-size': '14px',
            minWidth: `var(--header-${header?.id}-size)`,
          } as React.CSSProperties
        }
        onClick={(e) => {
          if (typeof toggleSorting === 'function') toggleSorting(e)
          rerender()
        }}
        title={headerTitle}
      >
        {columnDef.enableSorting && (
          <Icon
            name={currentSortingState}
            size={14}
            className="h-(--icon-size) max-w-(--icon-size) min-w-(--icon-size)"
          />
        )}
        <Typography as="small" variant="small" className="line-clamp-1 text-left text-sm text-inherit">
          {flexRender(columnDef.header, header.getContext())}
        </Typography>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem
          disabled={!columnDef.enableSorting}
          className="gap-x-2"
          onClick={() => header.column.toggleSorting(false)}
        >
          <Icon name="ArrowUp" />
          Sắp xếp tăng dần
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!columnDef.enableSorting}
          className="gap-x-2"
          onClick={() => header.column.toggleSorting(true)}
        >
          <Icon name="ArrowDown" />
          Sắp xếp giảm dần
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger
            aria-disabled={!header.isPlaceholder && !header.column.columnDef.enablePinning}
            disabled={!header.isPlaceholder && !header.column.columnDef.enablePinning}
            className="aria-disabled:text-muted-foreground gap-x-2"
          >
            <Icon name="Pin" />
            Ghim cột
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            <ContextMenuCheckboxItem
              checked={header.column.getIsPinned() === false}
              onCheckedChange={() => {
                header.column.pin(false)
                event$.emit(pick(table.getState(), ['columnPinning']))
              }}
            >
              Bỏ ghim
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={header.column.getIsPinned() === 'left'}
              onCheckedChange={() => {
                header.column.pin('left')
                event$.emit(pick(table.getState(), ['columnPinning']))
              }}
            >
              Ghim trái
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={header.column.getIsPinned() === 'right'}
              onCheckedChange={() => {
                header.column.pin('right')
                event$.emit(pick(table.getState(), ['columnPinning']))
              }}
            >
              Ghim phải
            </ContextMenuCheckboxItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator className="h-[0.5px]" />
        <ContextMenuItem className="gap-x-2" onClick={header.column.resetSize}>
          <Icon name="FoldHorizontal" /> Đặt lại kích thước
        </ContextMenuItem>
        <ContextMenuItem className="gap-x-2" onClick={header.column.getToggleVisibilityHandler()}>
          <Icon name="EyeOff" /> Ẩn cột
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default TableCellHead
