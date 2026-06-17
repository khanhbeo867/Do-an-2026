import type { Application } from 'express'
import { registerAuthRoutes } from './auth.routes'
import { registerBillingRoutes } from './billing.route'
import { registerCategoryRoutes } from './category.route'
import { registerCostumeRoutes } from './costume.route'
import { registerEmployeeRoutes } from './employee.route'
import { registerEquipmentPropsRoutes } from './equipment-props.route'
import { registerImageGalleryRoutes } from './images-gallery.route'
import { registerInventoryRoutes } from './inventory.route'
import { registerLoanRoutes } from './loan.route'
import { registerReturnRoutes } from './return.route'
import { registerStatisticsRoutes } from './statistics.route'
import { registerUserRoutes } from './user.route'
import { registerWarehouseRoutes } from './warehouse.route'

export function registerAllRoutes(app: Application) {
  registerAuthRoutes(app)
  registerUserRoutes(app)
  registerEmployeeRoutes(app)
  registerWarehouseRoutes(app)
  registerCategoryRoutes(app)
  registerCostumeRoutes(app)
  registerEquipmentPropsRoutes(app)
  registerImageGalleryRoutes(app)
  registerInventoryRoutes(app)
  registerLoanRoutes(app)
  registerReturnRoutes(app)
  registerStatisticsRoutes(app)
  registerBillingRoutes(app)
}
