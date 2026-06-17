import { ItemType } from '@/common/constants/enums'
import { PageAction, PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { PageEventProvider } from '@/contexts/event-context'
import { usePageHelperText } from '@/hooks/use-page-helper-text'
import tw from '@/lib/tw'
import CategorySheet from '../categories/category-sheet'
import DeleteAlertDialog from './delete-alert-dialog'
import EquipmentPropsDetailDialog from './equipment-props-detail-dialog'
import CostumeFormDialog from './equipment-props-form-dialog'
import EquipmentPropsFormDialogTrigger from './equipment-props-form-dialog-trigger'
import EquipmentPropsTable from './equipment-props-table'

const EquipmentPropsPage: React.FC = () => {
  const { title } = usePageHelperText('main')

  return (
    <PageEventProvider>
      <PageWrapper>
        <PageHeader>
          <PageTitle>{title}</PageTitle>
          <PageAction>
            <CategorySheet type={ItemType.EQUIPMENT_PROPS} />
            <EquipmentPropsFormDialogTrigger />
          </PageAction>
        </PageHeader>
        <PageSeparator />
        <PageContent>
          <EquipmentPropsTable />
        </PageContent>
      </PageWrapper>
      <CostumeFormDialog />
      <DeleteAlertDialog />
      <EquipmentPropsDetailDialog />
    </PageEventProvider>
  )
}

const PageContent: React.FC<React.ComponentProps<'section'>> = tw.section`flex-1`

export default EquipmentPropsPage
