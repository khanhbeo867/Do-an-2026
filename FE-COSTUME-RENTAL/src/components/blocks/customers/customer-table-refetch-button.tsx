import { GET_USERS_QUERY_KEY } from '@/apis/user/hooks/use-user-request'
import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

const CustomerTableRefetchButton: React.FC = () => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState<boolean>(false)

  const handleRefetch = () => {
    setLoading(true)
    queryClient.invalidateQueries({ queryKey: [GET_USERS_QUERY_KEY] }).finally(() => setLoading(false))
  }

  return (
    <Tooltip
      message="Đồng bộ"
      triggerProps={{
        render: (
          <Button disabled={loading} onClick={handleRefetch} size="icon" variant="outline">
            <Icon className={loading ? 'animate-spin' : ''} name="RefreshCw" />
          </Button>
        ),
      }}
    />
  )
}

export default CustomerTableRefetchButton
