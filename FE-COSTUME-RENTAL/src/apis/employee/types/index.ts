import type { Position } from '../constants'

export interface IEmployee extends IBaseEntity {
  work_status: any
  address: string
  citizen_id_number?: string
  employee_code: string
  full_name: string
  dob: Date
  phone: string
  email: string
  position: Position
  hire_date: Date
}
