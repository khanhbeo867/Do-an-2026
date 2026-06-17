import { Tooltip } from '@/components/shared/tooltip'
import { Icon } from '@/components/ui/icon'
import { Toggle } from '@/components/ui/toggle'
import { useTableContext } from '../context/table.context'

const ColumnFilterToggle: React.FC = () => {
  const { filterOpen, setFilterOpen } = useTableContext('filterOpen', 'setFilterOpen')

  return (
    <Tooltip
      message="Bộ lọc"
      triggerProps={{
        render: (
          <Toggle
            variant="outline"
            className="aria-pressed:bg-accent aria-pressed:text-accent-foreground hover:text-foreground size-9 place-content-center p-0"
            pressed={filterOpen}
            onPressedChange={(pressed) => {
              setFilterOpen(pressed)
            }}
          >
            <Icon name="Funnel" />
          </Toggle>
        ),
      }}
    />
  )
}

export default ColumnFilterToggle
