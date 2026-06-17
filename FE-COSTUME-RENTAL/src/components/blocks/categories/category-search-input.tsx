import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useDebounce } from 'ahooks'
import { Search } from 'lucide-react'
import { memo, useEffect, useState } from 'react'

const CategorySearchInput: React.FC<{
  searchTerm: string
  onSearchTermChange: React.Dispatch<React.SetStateAction<string>>
}> = ({ searchTerm, onSearchTermChange }) => {
  const [value, setValue] = useState<string>(searchTerm)

  const debouncedValue = useDebounce(value, { wait: 200 })

  useEffect(() => {
    if (typeof onSearchTermChange === 'function') onSearchTermChange(debouncedValue)
  }, [debouncedValue])

  return (
    <div className="px-4">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput value={value} onChange={(e) => setValue(e.currentTarget.value)} placeholder="Tìm kiếm ..." />
      </InputGroup>
    </div>
  )
}

export default memo(CategorySearchInput)
