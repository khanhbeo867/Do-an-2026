import CreateCustomerFormDialogTrigger from '@/components/blocks/customers/create-customer-dialog-form-trigger'
import CustomerFormDialog from '@/components/blocks/customers/customer-form-dialog'
import CustomerHistoryDialog from '@/components/blocks/customers/customer-history-dialog'
import CustomerTable from '@/components/blocks/customers/customer-table'
import { PageAction, PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { PageEventProvider } from '@/contexts/event-context'

const CustomerPage: React.FC = () => {
  return (
    <PageEventProvider>
      <PageWrapper>
        <PageHeader>
          <PageTitle>Quản lý khách hàng</PageTitle>
          <PageAction>
            <CreateCustomerFormDialogTrigger />
          </PageAction>
        </PageHeader>
        <PageSeparator />
        <CustomerTable />
      </PageWrapper>
      <CustomerFormDialog />
      <CustomerHistoryDialog />
    </PageEventProvider>
  )
}

export default CustomerPage



