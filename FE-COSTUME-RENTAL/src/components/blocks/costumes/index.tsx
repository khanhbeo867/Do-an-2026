import { ItemType } from '@/common/constants/enums'
import { PageAction, PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { PageEventProvider } from '@/contexts/event-context'
import { usePageHelperText } from '@/hooks/use-page-helper-text'
import tw from '@/lib/tw'
import CategorySheet from '../categories/category-sheet'
import CostumeDetailDialog from './costume-detail-dialog'
import CostumeFormDialog from './costume-form-dialog'
import CostumeFormDialogTrigger from './costume-form-dialog-trigger'
import CostumeTable from './costumes-table'
import DeleteAlertDialog from './delete-alert-dialog'

const CostumePage: React.FC = () => {
  const { title, description } = usePageHelperText('main')

  return (
    <PageEventProvider>
      <PageWrapper>
        <PageHeader>
          <PageTitle>{title}</PageTitle>
          <PageAction>
            <CategorySheet type={ItemType.COSTUME} />
            <CostumeFormDialogTrigger />
          </PageAction>
        </PageHeader>
        <PageSeparator />
        <PageContent>
          <CostumeTable />
        </PageContent>
      </PageWrapper>
      <CostumeFormDialog />
      <DeleteAlertDialog />
      <CostumeDetailDialog />
    </PageEventProvider>
  )
}

const PageContent: React.FC<React.ComponentProps<'section'>> = tw.section`flex-1`

export default CostumePage
