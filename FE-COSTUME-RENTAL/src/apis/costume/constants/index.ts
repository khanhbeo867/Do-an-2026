export enum CostumeGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNISEX = 'UNISEX',
}

export enum CostumeUnit {
  SET = 'SET',
  PIECE = 'PIECE',
}

export const COSTUME_GENDER_LABEL_MAP = new Map<CostumeGender, string>([
  [CostumeGender.MALE, 'Nam'],
  [CostumeGender.FEMALE, 'Nữ'],
  [CostumeGender.UNISEX, 'Unisex'],
])

export const COSTUME_GENDER_OPTIONS: Array<{ value: CostumeGender; label: string }> = [
  { value: CostumeGender.MALE, label: 'Nam' },
  { value: CostumeGender.FEMALE, label: 'Nữ' },
  { value: CostumeGender.UNISEX, label: 'Unisex' },
]

export const COSTUME_UNIT_LABEL_MAP = new Map<CostumeUnit, string>([
  [CostumeUnit.SET, 'Bộ'],
  [CostumeUnit.PIECE, 'Chiếc'],
])

export enum CostumeSize {
  'XS' = 'XS',
  'S' = 'S',
  'M' = 'M',
  'L' = 'L',
  'XL' = 'XL',
  '2XL' = '2XL',
  '3XL' = '3XL',
}

export const SIZE_RUN = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: '2XL', label: '2XL' },
  { value: '3XL', label: '3XL' },
].map((size, index) => {
  return { ...size, sortOrder: index + 1 }
})

export const COSTUME_UNIT = [
  { value: CostumeUnit.SET, label: COSTUME_UNIT_LABEL_MAP.get(CostumeUnit.SET) },
  { value: CostumeUnit.PIECE, label: COSTUME_UNIT_LABEL_MAP.get(CostumeUnit.PIECE) },
]
