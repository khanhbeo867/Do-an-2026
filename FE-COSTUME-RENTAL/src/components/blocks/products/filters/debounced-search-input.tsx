import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { omit } from 'lodash-es'
import { SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

const DebouncedSearchInput: React.FC = () => {
  const search = useSearch({ from: '/_public-layout/products', select: (search) => search.q, structuralSharing: false })
  const navigate = useNavigate({ from: '/products' })

  const [inputValue, setInputValue] = useState<string>(search ?? '')

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate({
        search: (prev) => {
          if (!inputValue) return omit(prev, ['q'])
          return { ...prev, q: inputValue }
        },
      })
    }, 500)

    return () => clearTimeout(timeout)
  }, [inputValue])

  return (
    <InputGroup>
      <InputGroupAddon>
        <SearchIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Tìm theo tên"
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.currentTarget.value)}
      />
    </InputGroup>
  )
}

export default DebouncedSearchInput
