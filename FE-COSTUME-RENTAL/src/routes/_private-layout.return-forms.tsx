import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/return-forms')({
  head: () => ({
    meta: [
      { title: 'Phiếu trả' },
      {
        name: 'description',
        content: 'Khu vực quản lý quy trình trả sản phẩm, hoàn tất đối soát và đóng phiếu.',
      },
    ],
  }),
  component: Outlet,
})
