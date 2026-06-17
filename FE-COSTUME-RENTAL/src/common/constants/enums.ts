export enum RecordStatus {
  ACTIVE = 'Y',
  INACTIVE = 'N',
}

export enum CommonActions {
  CREATE = 'CREATE',
  READ = 'READ',
  DELETE_MANY = 'DELETE_MANY',
  UPDATE_MANY = 'UPDATE_MANY',
  UPDATE = 'UPDATE',
  CANCEL = 'CANCEL',
  SAVE = 'SAVE',
  DELETE = 'DELETE',
  SET_STATUS = 'SET_STATUS',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
}

export enum ItemType {
  COSTUME = 'COSTUME',
  EQUIPMENT_PROPS = 'EQUIPMENT_PROPS',
}
