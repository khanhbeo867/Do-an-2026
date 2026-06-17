import CreateUserFormDialogTrigger from '@/components/blocks/users/create-user-dialog-form-trigger'
import UserFormDialog from '@/components/blocks/users/user-form-dialog'
import UserTable from '@/components/blocks/users/user-table'
import { PageAction, PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { PageEventProvider } from '@/contexts/event-context'

const UserPage: React.FC = () => {
  return (
    <PageEventProvider>
      <PageWrapper>
        <PageHeader>
          <PageTitle>Quản lý truy cập</PageTitle>
          <PageAction>
            <CreateUserFormDialogTrigger />
          </PageAction>
        </PageHeader>
        <PageSeparator />
        <UserTable />
      </PageWrapper>
      <UserFormDialog />
    </PageEventProvider>
  )
}

export default UserPage
