import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { useDebounce } from 'ahooks'
import React, { useEffect, useState } from 'react'
import { useEditorContext } from '../../context/editor-context'

const FONT_SIZE_MIN = 14
const FONT_SIZE_DEFAULT = 16
const FONT_SIZE_MAX = 96

const extractFontSizeValue = (attributes: Record<string, any>) => {
  const fontSize = attributes?.fontSize
  if (!fontSize) return FONT_SIZE_DEFAULT
  return Number(fontSize.replace('px', ''))
}

const FontSizeInput: React.FC = () => {
  const { editor } = useEditorContext()
  const [fontSize, setFontSize] = useState<number>(extractFontSizeValue(editor.getAttributes('textStyle')))
  const debouncedFontSize = useDebounce(fontSize, { wait: 500 })

  const handleChangeFontSize = (step: number) => {
    if (fontSize + step < FONT_SIZE_MIN) {
      setFontSize(FONT_SIZE_MIN)
    } else if (fontSize + step > FONT_SIZE_MAX) {
      setFontSize(FONT_SIZE_MAX)
    } else {
      setFontSize((prev) => prev + step)
    }
  }

  useEffect(() => {
    setFontSize(debouncedFontSize)
    switch (true) {
      case debouncedFontSize < FONT_SIZE_MIN:
        setFontSize(FONT_SIZE_MIN)
        break
      case debouncedFontSize > FONT_SIZE_MAX:
        setFontSize(FONT_SIZE_MAX)
        break
      default:
        setFontSize(debouncedFontSize)
        break
    }
  }, [debouncedFontSize])

  useEffect(() => {
    editor.commands.setFontSize(fontSize.toString())
  }, [fontSize])

  editor.on('focus', () => {
    setFontSize(extractFontSizeValue(editor.getAttributes('textStyle')))
  })

  return (
    <ButtonGroup>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => handleChangeFontSize(-1)}
        disabled={fontSize <= FONT_SIZE_MIN}
      >
        <Icon name="Minus" size={14} />
      </Button>

      <Input
        type="number"
        min={FONT_SIZE_MIN}
        max={FONT_SIZE_MAX}
        value={fontSize}
        className="h-auto w-12 text-center focus-visible:ring-2"
        onChange={(e) => setFontSize(+e.target.value)}
      />
      {/* <Separator orientation="vertical" className="h-8 w-px" /> */}

      <Button type="button" size="icon-sm" variant="outline" onClick={() => handleChangeFontSize(1)}>
        <Icon name="Plus" size={14} />
      </Button>
    </ButtonGroup>
  )
}

export default FontSizeInput
