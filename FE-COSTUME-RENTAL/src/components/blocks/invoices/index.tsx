import { PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { usePageHelperText } from '@/hooks/use-page-helper-text'
import InvoicesTable from './invoices-table'

const InvoicesPage: React.FC = () => {
  const { title } = usePageHelperText('main')

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
      </PageHeader>
      <PageSeparator />
      <InvoicesTable />
    </PageWrapper>
  )
}

export default InvoicesPage
