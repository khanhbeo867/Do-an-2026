import { PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { usePageHelperText } from '@/hooks/use-page-helper-text'
import PenaltyFormsTable from './penalty-forms-table'

const PenaltyFormsPage: React.FC = () => {
  const { title } = usePageHelperText('main')

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
      </PageHeader>
      <PageSeparator />
      <PenaltyFormsTable />
    </PageWrapper>
  )
}

export default PenaltyFormsPage
