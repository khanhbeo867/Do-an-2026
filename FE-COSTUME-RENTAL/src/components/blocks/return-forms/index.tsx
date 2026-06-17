import { PageAction, PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { buttonVariants } from '@/components/ui/button'
import { usePageHelperText } from '@/hooks/use-page-helper-text'
import { Link } from '@tanstack/react-router'
import { FilePlusCornerIcon } from 'lucide-react'
import ReturnFormsTable from './return-forms-table'

const ReturnFormsPage: React.FC = () => {
  const { title } = usePageHelperText('main')

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        <PageAction>
          <Link to="/return-forms/create" className={buttonVariants()}>
            <FilePlusCornerIcon /> Tạo phiếu
          </Link>
        </PageAction>
      </PageHeader>
      <PageSeparator />
      <ReturnFormsTable />
    </PageWrapper>
  )
}

export default ReturnFormsPage
