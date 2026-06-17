import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/loan-forms')({
  head: () => ({
    meta: [
      { title: 'Phiếu thuê và mua' },
      {
        name: 'description',
        content: 'Khu vực quản lý các phiếu thuê và mua trang phục, đạo cụ trong hệ thống.',
      },
    ],
  }),
  component: Outlet,
})
