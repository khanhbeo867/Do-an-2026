import { Typography, type TypographyProps } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { type CellContext } from '@tanstack/react-table'
import { isEmpty, isNil } from 'lodash-es'

const TableCellText: React.FC<CellContext<any, any> & TypographyProps> = (props) => {
  const value = props.getValue()

  if (isNil(value) || isEmpty(value))
    return (
      <Typography variant="small" color="muted" className={cn('line-clamp-1', props.className)} title="Chưa xác định">
        Chưa xác định
      </Typography>
    )

  return (
    <Typography variant="small" className={cn('line-clamp-1', props.className)} title={value}>
      {value}
    </Typography>
  )
}

export default TableCellText
