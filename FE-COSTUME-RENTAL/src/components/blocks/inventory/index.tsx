import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { JSX } from 'react'
import WarehouseTabContent from '../warehouses'
import CostumeInventoryTabContent from './costume'
import PropsInventoryTabContent from './equipment-props'

const tabs: Array<{
  value: 'all-warehouses' | 'costume-warehouse' | 'props-warehouse'
  label: string
  content: JSX.Element
}> = [
  {
    value: 'all-warehouses',
    label: 'Tất cả kho',
    content: <WarehouseTabContent />,
  },
  {
    value: 'costume-warehouse',
    label: 'Kho trang phục',
    content: <CostumeInventoryTabContent />,
  },
  {
    value: 'props-warehouse',
    label: 'Kho đạo cụ',
    content: <PropsInventoryTabContent />,
  },
]

const InventoryPage: React.FC = () => {
  const tabValue = useSearch({
    structuralSharing: false,
    from: '/_private-layout/inventory',
    select: (state) => state.tab,
  })

  const navigate = useNavigate({ from: '/inventory' })

  return (
    <Tabs value={tabValue} className="gap-6">
      <TabsList variant="line">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} onClick={() => navigate({ search: { tab: tab.value } })}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default InventoryPage
