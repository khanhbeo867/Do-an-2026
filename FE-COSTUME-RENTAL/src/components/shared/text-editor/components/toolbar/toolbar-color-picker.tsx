import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from '@/components/shared/color-picker'
import { cn } from '@/lib/utils'
import { useDebounceFn } from 'ahooks'
import type { ColorLike } from 'color'
import Color from 'color'
import { Activity, useCallback, useEffect, useMemo, useState } from 'react'

import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import type { IconProps } from '@/components/ui/icon'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

import { PresetColors } from '../../constants'
import { useEditorContext } from '../../context/editor-context'

type ColorPickerProps = {
  label: string
  icon: IconProps['name']
  type: 'textStyle' | 'highlight'
}

const FALLBACK_COLOR = 'hsl(0 0% 3.9%)'

const ToolbarColorPicker: React.FC<ColorPickerProps> = ({ label, icon, type }) => {
  const { editor } = useEditorContext()

  const [colorPaletteType, setColorPaletteType] = useState<'preset' | 'custom'>('preset')
  const initialColor = useMemo(() => editor.getAttributes(type).color, [type, editor])
  const [currentColor, setCurrentColor] = useState<string | undefined>(initialColor)

  useEffect(() => {
    const updateColor = () => {
      setCurrentColor(editor.getAttributes(type).color)
    }

    editor.on('update', updateColor)
    editor.on('selectionUpdate', updateColor)

    return () => {
      editor.off('update', updateColor)
      editor.off('selectionUpdate', updateColor)
    }
  }, [type, editor])

  const handleSelectColor = useCallback(
    (color: string) => {
      setCurrentColor(color)
      if (type === 'textStyle') editor.commands.setColor(color)
      if (type === 'highlight') editor.commands.setHighlight({ color })
    },
    [type, editor]
  )

  const handleConvertRgbaToHex = useCallback((value: number[]) => {
    try {
      const clampByte = (n: unknown) => {
        if (typeof n !== 'number' || !Number.isFinite(n)) return 0
        return Math.min(255, Math.max(0, Math.round(n)))
      }
      const clampAlpha = (a: unknown) => {
        if (typeof a !== 'number' || !Number.isFinite(a)) return 1
        const normalized = a > 1 ? a / 255 : a
        return Math.min(1, Math.max(0, normalized))
      }

      const r = clampByte(value[0])
      const g = clampByte(value[1])
      const b = clampByte(value[2])
      const alpha = clampAlpha(value.length >= 4 ? value[3] : 1)
      return alpha < 1 ? Color.rgb([r, g, b]).alpha(alpha).hexa() : Color.rgb([r, g, b]).hex()
    } catch {
      return FALLBACK_COLOR
    }
  }, [])

  const handleGetPickerValue = useCallback(() => {
    try {
      return Color(currentColor ?? FALLBACK_COLOR)
        .rgb()
        .string()
    } catch {
      return FALLBACK_COLOR
    }
  }, [currentColor])

  const { run: handleSetCustomColor, flush } = useDebounceFn(
    (color: ColorLike) => {
      const rgba = Array.isArray(color) ? (color as number[]) : []
      const hex = handleConvertRgbaToHex(rgba)
      handleSelectColor(hex)
    },
    { wait: 200, trailing: true }
  )

  return (
    <div className="relative">
      <Popover modal>
        <Tooltip
          message={label}
          triggerProps={{
            render: (
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    className="aspect-square h-8 w-8 flex-col gap-x-1.5"
                    size="icon"
                    type="button"
                  >
                    <Icon name={icon} />
                    <div
                      className={cn('mt-0.5 h-1.5 w-4/5 self-center rounded-l-full rounded-r-full border-[0.5px]', {
                        'bg-foreground!': !currentColor && type === 'textStyle',
                        'bg-transparent': !currentColor && type === 'highlight',
                      })}
                      style={{ backgroundColor: currentColor }}
                    />
                  </Button>
                }
              />
            ),
          }}
        />

        <PopoverContent align="end" className="h-auto p-0">
          <Activity mode={colorPaletteType === 'preset' ? 'visible' : 'hidden'}>
            <div className="grid grid-cols-10 gap-2 p-2 transition-allow-discrete animate-in fade-in-0 slide-in-from-right-2">
              {PresetColors.map((color) => (
                <button
                  key={color}
                  style={{
                    border: 'none',
                    backgroundColor: color,
                    width: 18,
                    height: 18,
                    aspectRatio: '1 / 1',
                    borderRadius: 2,
                    ...(editor.isActive('textStyle', {
                      color: color,
                    }) && { outlineColor: color, outlineOffset: 2, outlineWidth: 1, outlineStyle: 'solid' }),
                  }}
                  onClick={() => handleSelectColor(color)}
                />
              ))}
            </div>
          </Activity>
          <Activity mode={colorPaletteType === 'custom' ? 'visible' : 'hidden'}>
            <div className="h-80 max-w-sm p-4 transition-allow-discrete animate-in fade-in-0 slide-in-from-left-2">
              <ColorPicker value={handleGetPickerValue()} onChange={handleSetCustomColor} onMouseUp={() => flush()}>
                <ColorPickerSelection />
                <div className="flex items-center gap-4">
                  <ColorPickerEyeDropper />
                  <div className="grid w-full gap-1">
                    <ColorPickerHue />
                    <ColorPickerAlpha />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ColorPickerOutput />
                  <ColorPickerFormat />
                </div>
              </ColorPicker>
            </div>
          </Activity>
          <Separator />
          <div className="flex items-center justify-between p-1.5">
            {colorPaletteType === 'preset' ? (
              <Button size="sm" variant="ghost" onClick={() => setColorPaletteType('custom')}>
                <Icon name="Pipette" /> Tùy chỉnh màu
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setColorPaletteType('preset')}>
                <Icon name="Palette" /> Màu có sẵn
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              type="button"
              className="gap-x-2"
              onClick={() => {
                if (type === 'highlight') editor.commands.unsetHighlight()
                if (type === 'textStyle') editor.commands.unsetColor()
              }}
            >
              <Icon name="Eraser" /> Xóa màu
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ToolbarColorPicker
