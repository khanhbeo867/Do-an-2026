import { Icon } from '@/components/ui/icon'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import type { Table } from '@tanstack/react-table'
import { useEffect, useState } from 'react'

export function GlobalFilterInput<T>({ table }: { table: Table<T> }) {
  const [value, setValue] = useState<string>(table.getState().globalFilter)

  useEffect(() => {
    setValue(table.getState().globalFilter)
  }, [table.getState().globalFilter])

  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setGlobalFilter(String(value))
    }, 200)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <InputGroup className="bg-background basis-full @5xl:basis-1/4">
      <InputGroupAddon>
        <Icon name="Search" />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder="Tìm kiếm..."
        type="search"
      />
    </InputGroup>
  )
}
export default GlobalFilterInput
