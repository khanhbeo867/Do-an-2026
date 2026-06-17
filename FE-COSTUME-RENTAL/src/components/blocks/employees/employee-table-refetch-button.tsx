import { getEmployeeQueryOptions } from '@/apis/employee/hooks/use-employee-request'
import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import useMediaQuery from '@/hooks/use-media-query'
import { useSuspenseQuery } from '@tanstack/react-query'

const EmployeeTableRefetchButton: React.FC<React.ComponentProps<typeof Button>> = (props) => {
  const isMobile = useMediaQuery('(max-width: 767px')
  const { refetch } = useSuspenseQuery(getEmployeeQueryOptions())

  return (
    <Tooltip
      message="Tải lại"
      contentProps={{ hidden: !isMobile }}
      triggerProps={{
        render: (
          <Button
            className={!isMobile ? 'bg-background' : undefined}
            variant={isMobile ? 'ghost' : 'outline'}
            size={isMobile ? 'icon' : 'default'}
            onClick={() => refetch()}
            {...props}
          >
            <Icon name="RefreshCcw" /> {!isMobile && 'Tải lại'}
          </Button>
        ),
      }}
    />
  )
}

export default EmployeeTableRefetchButton
