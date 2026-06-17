import type { TUpdateWarehouseValues } from '@/apis/warehouse/schemas/update-warehouse.schema'
import { createPubSubContext } from '@/contexts/pubsub-context'
import type React from 'react'
import WarehouseDeletionAlert from './warehouse-deletion-alert'
import WarehouseFormDialog from './warehouse-form-dialog'
import WarehouseTable from './warehouse-table'

export type TWarehousePubSubEventMap = {
  'warehouse:create': null
  'warehouse:update': Required<TUpdateWarehouseValues>
  'warehouse:delete': number
}

export const { PubSubProvider, usePubSub, usePubSubSubscription } =
  createPubSubContext<TWarehousePubSubEventMap>('WarehousePubSubContext')

const WarehouseTabContent: React.FC = () => {
  return (
    <PubSubProvider>
      <WarehouseTable />
      <WarehouseFormDialog />
      <WarehouseDeletionAlert />
    </PubSubProvider>
  )
}

export default WarehouseTabContent
