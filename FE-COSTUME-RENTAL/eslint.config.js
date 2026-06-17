//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/order': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'no-shadow': 'allow',
    },
  },
]
