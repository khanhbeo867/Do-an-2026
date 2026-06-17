import { MultiSelect, type MultiSelectProps } from '@/components/shared/multi-select'
import { sortBy, uniqBy } from 'lodash-es'
import { useMemo, useState } from 'react'

function MultiSelectColumnFilter<TData extends Record<'label' | 'value', string>>({
  datalist,
  value,
  onValueChange,
}: Pick<MultiSelectProps<TData>, 'datalist' | 'value' | 'onValueChange'>) {
  const [searchTerm, setSearchTerm] = useState<string>('')

  const filteredDataList = useMemo(() => {
    if (!datalist?.length) return []
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    const result = datalist.filter(({ value }) => value.trim().toLowerCase().includes(normalizedSearchTerm))
    const uniqueValues = uniqBy([...result, ...value.map((val) => ({ label: val, value: val }))], 'value')
    return sortBy(uniqueValues, 'value')
  }, [datalist, searchTerm, value])

  return (
    <MultiSelect
      value={value}
      datalist={filteredDataList as TData[]}
      shouldFilter={false}
      labelField="label"
      valueField="value"
      onInput={(search) => setSearchTerm(search)}
      onValueChange={(value) => onValueChange(value)}
      classNames={{
        popoverTrigger: 'h-10 border-none shadow-none',
      }}
    />
  )
}

export default MultiSelectColumnFilter
