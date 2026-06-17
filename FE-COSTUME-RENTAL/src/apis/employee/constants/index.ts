import type { IconProps } from '@/components/ui/icon'

export enum Position {
  MANAGER = 'MANAGER',
  /**
   * @description
   * * Nhân viên quản lý kho
   * * Nhóm nhân viên này sẽ trực tiếp thao tác trên hệ thống
   */
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  /**
   * * Nhân viên Kinh doanh/Xử lý đơn hàng
   * * Nhóm nhân viên này sẽ trực tiếp thao tác trên hệ thống
   */
  ORDER_PROCESSOR = 'ORDER_PROCESSOR',
  /**
   * @description
   * * Dùng chung cho ca sĩ, nhóm nhảy,... là những người hoạt động trên sân khấu (nhóm nhân viên lấy trang phục biểu diễu)
   * ! nhân viên vai trò này không tham gia sử dụng hệ thống
   */
  TALENT = 'TALENT',
  /**
   * @description
   * * Đội ngũ kỹ thuật hậu trường (nhóm nhân viên sẽ lấy đạo cụ đèn sân khấu, loa, ...)
   * ! nhân viên vai trò này không tham gia sử dụng hệ thống
   */
  TECHNICAL_CREW = 'TECHNICAL_CREW',
  /**
   * @description
   * * Nhân viên Bảo quản & Phục trang
   * * Đóng gói đúng loại đạo cụ khách yêu cầu, kiểm tra tình trạng (rách, hỏng, bẩn) khi bàn giao và khi nhận lại, ký biên bản bàn giao. (Sẽ do thủ kho đánh vào hệ thống)
   * ! nhân viên vai trò này không tham gia sử dụng hệ thống
   */
  WARDROBE = 'WARDROBE',
}

export enum WorkStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXITED = 'EXITED',
}

export const POSITION_OPTIONS: Array<{
  label: string
  value: Position
  icon: IconProps['name']
}> = [
  {
    label: 'Nhóm biểu diễn',
    value: Position.TALENT,
    icon: 'User',
  },
  {
    label: 'Kỹ thuật viên',
    value: Position.TECHNICAL_CREW,
    icon: 'User',
  },
  {
    label: 'Nhân viên Hậu cần',
    value: Position.WARDROBE,
    icon: 'User',
  },
  {
    label: 'Nhân viên Kho',
    value: Position.WAREHOUSE_MANAGER,
    icon: 'User',
  },
  {
    label: 'Nhân viên Kinh doanh',
    value: Position.ORDER_PROCESSOR,
    icon: 'User',
  },
  {
    label: 'Quản lý',
    value: Position.MANAGER,
    icon: 'UserStar',
  },
]

export const WORK_STATUS_OPTIONS: Array<{
  label: string
  value: WorkStatus
  icon: IconProps['name']
  color: `var(--${string})`
}> = [
  {
    label: 'Đang làm việc',
    value: WorkStatus.ACTIVE,
    icon: 'CircleCheckBig',
    color: 'var(--success)',
  },
  {
    label: 'Tạm hoãn',
    value: WorkStatus.SUSPENDED,
    icon: 'CircleDotDashed',
    color: 'var(--muted-foreground)',
  },
  {
    label: 'Thôi việc',
    value: WorkStatus.EXITED,
    icon: 'CircleX',
    color: 'var(--destructive)',
  },
]

export const CITIZEN_ID_NUMBER_REGEX = /^\d{12}$/
