import { getUsersQueryOptions } from '@/apis/user/hooks/use-user-request'
import { getLoanFormsQueryOptions } from '@/apis/loan-form/hooks/use-loan-form-request'
import type { IUser } from '@/apis/user/types'
import { formatPhoneNumber } from '@/common/helpers/format-intl'
import { DataGrid } from '@/components/shared/data-grid'
import { ROW_ACTIONS_COLUMN_ID } from '@/components/shared/data-grid/constants'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Icon, type IconProps } from '@/components/ui/icon'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Typography } from '@/components/ui/typography'
import generateAvatar from '@/lib/generate-avatar'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { format, isValid } from 'date-fns'
import { useMemo } from 'react'
import CustomerActionDropdown from './customer-action-dropdown'
import CustomerTableToolbar from './customer-table-toolbar'

const normalizeString = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[đĐ]/g, 'd')
}

const CustomerTable: React.FC = () => {
  const { data: allUsers, isLoading } = useSuspenseQuery(getUsersQueryOptions())
  const { data: allLoanForms } = useSuspenseQuery(getLoanFormsQueryOptions())

  // Filter users to only show customers (role === 'USER' and not linked to an employee profile)
  const customers = useMemo(() => {
    return allUsers.filter((user: IUser) => user.role === 'USER' && !user.employee)
  }, [allUsers])

  const getCustomerInfo = useMemo(() => {
    return (user: IUser) => {
      if (user.employee) {
        return {
          fullName: user.employee.full_name,
          phone: user.employee.phone,
          email: user.employee.email,
        }
      }

      // Use email and phone directly from registered account
      const registeredEmail = user.email || null
      const registeredPhone = user.phone || null

      if (allLoanForms && allLoanForms.length > 0) {
        const normalizedUsername = normalizeString(user.username)
        const matchedOrders = allLoanForms.filter((order: any) => {
          if (!order.borrower_name) return false
          return normalizeString(order.borrower_name) === normalizedUsername
        })

        if (matchedOrders.length > 0) {
          // Sort by created_at descending to get the latest order
          const latestOrder = [...matchedOrders].sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]

          return {
            fullName: latestOrder.borrower_name,
            phone: registeredPhone || latestOrder.borrower_phone,
            email: registeredEmail,
          }
        }
      }

      return {
        fullName: user.username,
        phone: registeredPhone,
        email: user.email || null,
      }
    }
  }, [allLoanForms])

  const columnHelper = createColumnHelper<IUser>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.employee?.full_name, {
        id: 'account',
        header: 'Tài khoản',
        size: 250,
        cell: ({ row }) => {
          const info = getCustomerInfo(row.original)
          const fullName = info.fullName || row.original.username
          return (
            <Item size="xs" className="p-0 flex-nowrap">
              <ItemMedia>
                <Avatar className="col-start-1 row-span-2">
                  <AvatarImage
                    src={generateAvatar({ name: fullName })}
                    alt={fullName}
                  />
                  <AvatarFallback>KH</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{fullName}</ItemTitle>
                <ItemDescription className='before:[content:"@"] font-medium before:text-normal before:text-muted-foreground'>
                  {row.original.username}
                </ItemDescription>
              </ItemContent>
            </Item>
          )
        },
      }),
      columnHelper.accessor((row) => row.email, {
        id: 'email',
        header: 'Email',
        cell: ({ row }) => {
          const info = getCustomerInfo(row.original)
          const value = info.email
          if (!value)
            return (
              <Typography variant="small" color="muted">
                Chưa cập nhật
              </Typography>
            )
          return <span>{value}</span>
        },
      }),
      columnHelper.accessor((row) => row.employee?.phone, {
        id: 'phone',
        header: 'Số điện thoại',
        cell: ({ row }) => {
          const info = getCustomerInfo(row.original)
          const value = info.phone
          if (!value)
            return (
              <Typography variant="small" color="muted">
                Chưa xác định
              </Typography>
            )
          return formatPhoneNumber(value)
        },
      }),
      columnHelper.accessor('created_at', {
        id: 'created_at',
        header: 'Ngày đăng ký',
        cell: ({ getValue }) => {
          const value = getValue()
          return value && isValid(new Date(value)) ? (
            format(new Date(value), 'dd/MM/yyyy')
          ) : (
            <Typography variant="small" color="muted">
              Chưa xác định
            </Typography>
          )
        },
      }),
      columnHelper.accessor('is_active', {
        id: 'is_active',
        header: 'Trạng thái',
        enableHiding: true,
        cell: ({ getValue }) => {
          const value = getValue()

          const badgeHelper: {
            icon: IconProps['name']
            text: string
            color: `var(--${'success' | 'muted-foreground'})`
          } = value
            ? {
                icon: 'CircleCheckBig',
                text: 'Đang hoạt động',
                color: 'var(--success)',
              }
            : {
                icon: 'Lock',
                text: 'Tạm khóa',
                color: 'var(--muted-foreground)',
              }

          return (
            <Badge variant="outline" className="justify-center gap-x-2 rounded-l-full rounded-r-full whitespace-nowrap">
              <Icon aria-current={value} name={badgeHelper?.icon as IconProps['name']} stroke={badgeHelper?.color} />
              {badgeHelper?.text}
            </Badge>
          )
        },
        enableSorting: true,
        enableColumnFilter: true,
        enableGlobalFilter: true,
        enableResizing: true,
      }),
      columnHelper.display({
        id: ROW_ACTIONS_COLUMN_ID,
        meta: { align: 'center' },
        size: 60,
        maxSize: 60,
        enableHiding: false,
        cell: CustomerActionDropdown,
      }),
    ],
    [getCustomerInfo]
  )

  return (
    <DataGrid
      columns={columns}
      data={customers}
      loading={isLoading}
      border="bottom-only"
      defaultFilterOpen={false}
      containerProps={{
        className:
          'xxl:h-[calc(var(--outlet-wrapper-height)-4rem)] h-96 md:max-xxl:h-[calc(var(--outlet-wrapper-height)-8rem)]',
      }}
      virtualizerOptions={{ estimateSize: 48 }}
      toolbarProps={{
        override: true,
        render: CustomerTableToolbar,
      }}
    />
  )
}

export default CustomerTable
