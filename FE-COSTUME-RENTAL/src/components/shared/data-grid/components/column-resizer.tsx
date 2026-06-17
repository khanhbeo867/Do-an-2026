import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Header } from '@tanstack/react-table'

type ColumnResizerProps = {
  header: Header<any, any>
}

const ColumnResizer: React.FC<ColumnResizerProps> = ({ header }) => {
  return (
    <Separator
      onDoubleClick={() => header.column.resetSize()}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onTouchMove={header.getResizeHandler()}
      className={cn(
        'bg-border absolute inset-y-0 right-0 z-0 w-1! cursor-col-resize! touch-none opacity-0 transition-opacity duration-500 select-none group-hover:opacity-100',
        'group-data-[border=all]/data-grid-wrapper:h-full',
        'group-data-[border=bottom-only]/data-grid-wrapper:top-1/2 group-data-[border=bottom-only]/data-grid-wrapper:h-2/3 group-data-[border=bottom-only]/data-grid-wrapper:-translate-y-1/2 group-data-[border=bottom-only]/data-grid-wrapper:rounded-md',
        header.column.getCanResize() && 'hover:bg-primary',
        header.column.getIsResizing() && 'bg-primary opacity-10'
      )}
    />
  )
}

export default ColumnResizer
