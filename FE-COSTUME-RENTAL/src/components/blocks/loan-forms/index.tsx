import { PageAction, PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { buttonVariants } from '@/components/ui/button'
import { usePageHelperText } from '@/hooks/use-page-helper-text'
import { Link } from '@tanstack/react-router'
import { FilePlusCornerIcon } from 'lucide-react'
import LoanFormsTable from './loan-forms-table'

const LoanFormsPage: React.FC = () => {
  const { title } = usePageHelperText('main')

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        <PageAction>
          <Link to="/loan-forms/create" className={buttonVariants()}>
            <FilePlusCornerIcon /> Tạo phiếu
          </Link>
        </PageAction>
      </PageHeader>
      <PageSeparator />
      <LoanFormsTable />
    </PageWrapper>
  )
}

export default LoanFormsPage
