import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { type PaginationState, type Table } from '@tanstack/react-table'
import React, { memo, useEffect } from 'react'
import isEqual from 'react-fast-compare'
import type { PaginationBaseProps } from '../types'

export type DataTablePaginationProps = {
  table: Table<any>
  manualPagination?: boolean
  enableInputPageSize?: boolean
  controlledPaginationProps: Partial<Omit<Pagination<any>, 'data'>>
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>
  [key: string]: any
} & PaginationBaseProps

const TablePagination: React.FC<DataTablePaginationProps> = ({
  table,
  loading,
  manualPagination,
  controlledPaginationProps,
  onPaginationChange,
  prefetch,
}) => {
  const { firstPage, lastPage, nextPage, previousPage, setPageSize } = table

  const canNextPage = manualPagination ? controlledPaginationProps?.hasNextPage : table.getCanNextPage()
  const canPreviousPage = manualPagination ? controlledPaginationProps?.hasPrevPage : table.getCanPreviousPage()
  const pageCount = (manualPagination ? controlledPaginationProps?.totalPages : table.getPageCount()) as number
  const pageSize = (
    manualPagination ? controlledPaginationProps?.limit : table.getState().pagination.pageSize
  ) as number
  const pageIndex = (
    manualPagination ? controlledPaginationProps?.page : table.getState().pagination.pageIndex + 1
  ) as number
  const rowCount = (manualPagination ? controlledPaginationProps.totalDocs : table.getRowCount()) as number

  const pageIndexContext = String(pageIndex ?? 1) + '/' + String(pageCount ?? 1)

  const changePageSize = (value: string) => {
    if (isNaN(+value)) return

    if (+value > rowCount) {
      goToFirstPage()
    }
    setPageSize(+value)
    if (manualPagination && typeof onPaginationChange === 'function')
      onPaginationChange({ pageIndex, pageSize: +value })
  }

  const goToNextPage = () => {
    if (!canNextPage) return
    if (manualPagination && typeof onPaginationChange === 'function')
      onPaginationChange({ pageIndex: pageIndex + 1, pageSize: pageSize })
    else nextPage()
  }

  const goToPrevPage = () => {
    if (!canPreviousPage) return
    if (manualPagination && typeof onPaginationChange === 'function')
      onPaginationChange({ pageIndex: pageIndex - 1, pageSize: pageSize })
    else previousPage()
  }

  const handlePrefetch = (params: { [key in string]: any } & Pick<Pagination<any>, 'page' | 'limit'>) => {
    if (!manualPagination || typeof prefetch !== 'function' || !canNextPage) return
    prefetch(params)
  }

  useEffect(() => {
    if (typeof pageIndex !== 'number' && typeof pageSize !== 'number') return
    handlePrefetch({ page: pageIndex + 1, limit: pageSize })
  }, [canNextPage, pageIndex, pageSize])

  const goToFirstPage = () => {
    if (manualPagination && typeof onPaginationChange === 'function') {
      onPaginationChange({ pageIndex: 1, pageSize })
    } else {
      firstPage()
    }
  }

  const goToLastPage = () => {
    if (manualPagination && typeof onPaginationChange === 'function') {
      onPaginationChange({ pageIndex: pageCount, pageSize })
    } else {
      lastPage()
    }
  }

  useEffect(() => {
    if (pageIndex > pageCount) goToFirstPage()
  }, [pageCount])

  return (
    <div
      role="navigation"
      className="ml-auto flex items-center space-x-2 py-0.5 sm:space-x-2 lg:space-x-4 xl:space-x-4"
    >
      <div className="flex items-center space-x-2">
        <Label className="font-medium whitespace-nowrap">Hàng mỗi trang</Label>
        <Select value={pageSize} onValueChange={(value) => changePageSize(String(value))}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Số hàng mỗi trang" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Separator orientation="vertical" className="bg-border h-6 w-1 sm:hidden md:hidden" />
      <Typography variant="small" className="text-center font-medium whitespace-nowrap">
        {`Trang ${pageIndexContext}`}
      </Typography>
      <Separator orientation="vertical" className="bg-border h-6 w-1 sm:hidden md:hidden" />
      <ButtonGroup>
        <Tooltip
          message="Trang đầu"
          triggerProps={{
            render: (
              <Button
                role="button"
                aria-disabled={!canPreviousPage || loading}
                aria-label="Trang đầu"
                disabled={!canPreviousPage || loading}
                variant="outline"
                size="icon"
                onClick={goToFirstPage}
                onPointerEnter={() => handlePrefetch({ limit: pageSize, page: 1 })}
              >
                <Icon name="ChevronsLeft" />
              </Button>
            ),
          }}
        />
        <Tooltip
          message="Trang trước"
          triggerProps={{
            render: (
              <Button
                role="button"
                aria-disabled={!canPreviousPage || loading}
                aria-label="Trang trước"
                disabled={!canPreviousPage || loading}
                variant="outline"
                size="icon"
                onClick={goToPrevPage}
                onPointerEnter={() => {
                  if (canPreviousPage) handlePrefetch({ limit: pageSize, page: pageIndex - 1 })
                }}
              >
                <Icon name="ChevronLeft" />
              </Button>
            ),
          }}
        />
        <Tooltip
          message="Trang sau"
          triggerProps={{
            render: (
              <Button
                role="button"
                aria-disabled={!canNextPage || loading}
                aria-label="Trang sau"
                disabled={!canNextPage || loading}
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                onPointerEnter={() => {
                  if (canNextPage) handlePrefetch({ limit: pageSize, page: pageIndex + 1 })
                }}
              >
                <Icon name="ChevronRight" />
              </Button>
            ),
          }}
        />
        <Tooltip
          message="Trang cuối"
          triggerProps={{
            render: (
              <Button
                role="button"
                aria-disabled={!canNextPage || loading}
                aria-label="Trang cuối"
                disabled={!canNextPage || loading}
                variant="outline"
                size="icon"
                onClick={goToLastPage}
                onPointerEnter={() => handlePrefetch({ limit: pageSize, page: pageCount })}
              >
                <Icon name="ChevronsRight" />
              </Button>
            ),
          }}
          contentProps={{ align: 'end' }}
        />
      </ButtonGroup>
    </div>
  )
}

TablePagination.displayName = 'TablePagination'

export default memo(
  TablePagination,
  (prevProps, nextProps) =>
    isEqual(prevProps.controlledPaginationProps, nextProps.controlledPaginationProps) &&
    nextProps.table.getState().columnSizingInfo.isResizingColumn !== false
) as typeof TablePagination
