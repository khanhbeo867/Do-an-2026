import copy from 'copy-to-clipboard'
import { useState } from 'react'

export default function useCopyToClipboard(): [
  (...parameters: Parameters<typeof copy>) => void,
  { data: string; isCoppied: boolean },
] {
  const [data, setData] = useState<string>('')
  const [isCoppied, setIsCoppied] = useState<boolean>(false)

  const copyToClipboard = async (text: string, options: Parameters<typeof copy>[1]) => {
    const result = await copy(text, options)
    if (result) setData(text)
    setIsCoppied(result)
  }

  return [copyToClipboard, { data, isCoppied }]
}
