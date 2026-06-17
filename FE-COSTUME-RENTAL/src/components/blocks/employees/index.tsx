import { PageAction, PageHeader, PageSeparator, PageTitle, PageWrapper } from '@/components/layouts/app/app-page'
import { PageEventProvider } from '@/contexts/event-context'
import React from 'react'
import CreateEmployeeFormDialogTrigger from './create-employee-dialog-form-trigger'
import EmployeeFormDialog from './employee-form-dialog'
import EmployeeTable from './employee-table'

const EmployeePage: React.FC = () => {
  return (
    <PageEventProvider>
      <PageWrapper>
        <PageHeader>
          <PageTitle>Quản lý nhân sự</PageTitle>
          <PageAction>
            <CreateEmployeeFormDialogTrigger />
          </PageAction>
        </PageHeader>
        <PageSeparator />
        <EmployeeTable />
      </PageWrapper>
      <EmployeeFormDialog />
    </PageEventProvider>
  )
}

export default EmployeePage
