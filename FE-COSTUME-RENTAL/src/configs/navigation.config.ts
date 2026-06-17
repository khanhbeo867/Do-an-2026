import { UserRole } from '@/apis/auth/constants'
import type { IconProps } from '@/components/ui/icon'
import type { FileRouteTypes } from '@/routeTree.gen'

export type TNavigationConfig = {
  icon?: IconProps['name']
  title: string
  url?: FileRouteTypes['to']
  items?: Omit<TNavigationConfig, 'icon'>[] & Required<Pick<TNavigationConfig, 'url'>>
  authorizedRoles?: UserRole[] | '*'
  description: string
}
const navigationConfig: Record<'main' | 'administration', TNavigationConfig[]> = {
  main: [
    {
      title: 'Thống kê',
      url: '/statistics',
      icon: 'ChartColumnBig',
      authorizedRoles: '*',
      description:
        'Báo cáo và phân tích hiệu suất nhà hàng: doanh thu, đặt bàn, món bán chạy và hoạt động nhân viên để ra quyết định hiệu quả.',
    },
    {
      title: 'Quản lý trang phục',
      url: '/costumes',
      icon: 'Shirt',
      authorizedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF, UserRole.HR_STAFF],
      description:
        'Quản lý trang phục: thêm, sửa, xóa trang phục, phân loại theo loại, kích cỡ, màu sắc và tình trạng để vận hành hiệu quả.',
    },
    {
      title: 'Quản lý đạo cụ',
      url: '/equipment-props',
      icon: 'ToolCase',
      authorizedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF, UserRole.HR_STAFF],
      description:
        'Quản lý đạo cụ: thêm, sửa, xóa đạo cụ, phân loại theo loại, kích cỡ, màu sắc và tình trạng để vận hành hiệu quả.',
    },
    {
      title: 'Quản lý thư viện ảnh',
      url: '/images-gallery',
      icon: 'Images',
      authorizedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF, UserRole.HR_STAFF],
      description: 'Quản lý thư viện ảnh sử dụng trên hệ thống',
    },
    {
      title: 'Kiểm kê kho',
      url: '/inventory',
      icon: 'Warehouse',
      authorizedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF],
      description:
        'Quản lý kho trang phục: thêm, sửa, xóa trang phục, phân loại theo loại, kích cỡ, màu sắc và tình trạng để vận hành hiệu quả.',
    },
    {
      title: 'Phiếu thuê/mua',
      url: '/loan-forms',
      icon: 'ShoppingBag',
      authorizedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF, UserRole.HR_STAFF],
      description:
        'Quản lý phiếu thuê/mua: tạo, xem, chỉnh sửa và xóa phiếu thuê/mua trang phục, theo dõi trạng thái và lịch sử giao dịch để đảm bảo quản lý hiệu quả.',
    },
    {
      title: 'Phiếu trả', 
      url: '/return-forms',
      icon: 'Undo2',
      authorizedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF, UserRole.HR_STAFF],
      description:
        'Quản lý phiếu trả đồ sau khi thuê, theo dõi tình trạng và lịch sử giao dịch để đảm bảo quản lý hiệu quả.',
    },
    {
      title: 'Phiếu phạt',
      url: '/penalty-forms',
      icon: 'Gavel',
      authorizedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF, UserRole.HR_STAFF],
      description: 'Quản lý phiếu phạt do khách hàng vi phạm chính sách thuê đồ của cửa hàng',
    },
    {
      title: 'Quản lý hóa đơn',
      url: '/invoices',
      icon: 'Receipt',
      authorizedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR_STAFF],
      description:
        'Quản lý hóa đơn: tạo, xem, chỉnh sửa và xóa hóa đơn thuê trang phục, theo dõi trạng thái thanh toán và lịch sử giao dịch để đảm bảo quản lý tài chính hiệu quả.',
    },
  ],
  administration: [
    {
      title: 'Quản lý khách hàng',
      url: '/customers',
      icon: 'Users',
      authorizedRoles: [UserRole.ADMIN, UserRole.MANAGER],
      description: 'Quản lý thông tin tài khoản khách hàng, lịch sử thuê và mua hàng.',
    },
    {
      title: 'Quản lý truy cập',
      url: '/users',
      icon: 'UserCog',
      authorizedRoles: [UserRole.ADMIN],
      description:
        'Quản lý nhân sự: tạo tài khoản, phân quyền, theo dõi ca kíp và vai trò để vận hành nhà hàng an toàn và hiệu quả.',
    },
    {
      title: 'Quản lý nhân viên',
      url: '/employees',
      icon: 'Users',
      authorizedRoles: [UserRole.ADMIN],
      description:
        'Quản lý nhân sự: tạo tài khoản, phân quyền, theo dõi ca kíp và vai trò để vận hành nhà hàng an toàn và hiệu quả.',
    },
  ],
}


export default navigationConfig
