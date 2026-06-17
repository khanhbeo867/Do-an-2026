import Image from '@tiptap/extension-image'
import { mergeAttributes, type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { AlignCenter, AlignLeft, AlignRight, Edit, ImageIcon, Maximize, MoreVertical, Trash } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { useImageUpload } from '../hooks/use-image-upload'

export const ImageExtension = Image.extend({
  allowGapCursor: true,
  name: 'figure',
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: null,
      },
      align: {
        default: 'center',
      },
      caption: {
        default: '',
      },
      aspectRatio: {
        default: null,
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: `figure[data-type="${this.name}"]`,
        getAttrs: (node) => {
          const figure = node as HTMLElement
          const img = figure.querySelector('img')
          const figcaption = figure.querySelector('figcaption')

          if (!img) return false

          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            caption: figcaption?.textContent || '',
          }
        },
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      { 'data-type': this.name },
      ['img', mergeAttributes(HTMLAttributes)],
      ['figcaption', { class: 'text-center text-muted-foreground' }, HTMLAttributes.caption || ''],
    ]
  },
  addNodeView: () => {
    return ReactNodeViewRenderer(TiptapImage)
  },
})

function TiptapImage(props: NodeViewProps) {
  const { node, editor, selected, deleteNode, updateAttributes } = props
  const imageRef = useRef<HTMLImageElement | null>(null)
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const [resizing, setResizing] = useState(false)
  const [resizingPosition, setResizingPosition] = useState<'left' | 'right'>('left')
  const [resizeInitialWidth, setResizeInitialWidth] = useState(0)
  const [resizeInitialMouseX, setResizeInitialMouseX] = useState(0)
  const [editingCaption, setEditingCaption] = useState(false)
  const [caption, setCaption] = useState(node.attrs.caption || '')
  const [openedMore, setOpenedMore] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState(node.attrs.alt || '')

  const { fileInputRef, handleFileChange, handleRemove, isPending, error } = useImageUpload({
    onUpload: (imageUrl) => {
      updateAttributes({
        src: imageUrl,
        alt: altText || fileInputRef.current?.files?.[0]?.name,
      })
      handleRemove()
      setOpenedMore(false)
    },
  })

  function handleResizingPosition({
    e,
    position,
  }: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
    position: 'left' | 'right'
  }) {
    startResize(e)
    setResizingPosition(position)
  }

  function startResize(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault()
    setResizing(true)
    setResizeInitialMouseX(event.clientX)
    if (imageRef.current) {
      setResizeInitialWidth(imageRef.current.offsetWidth)
    }
  }

  function resize(event: MouseEvent) {
    if (!resizing) return

    let dx = event.clientX - resizeInitialMouseX
    if (resizingPosition === 'left') {
      dx = resizeInitialMouseX - event.clientX
    }

    const newWidth = Math.max(resizeInitialWidth + dx, 150)
    const parentWidth = nodeRef.current?.parentElement?.offsetWidth ?? 0

    if (newWidth < parentWidth) {
      updateAttributes({
        width: newWidth,
      })
    }
  }

  function endResize() {
    setResizing(false)
    setResizeInitialMouseX(0)
    setResizeInitialWidth(0)
  }

  function handleTouchStart(event: React.TouchEvent, position: 'left' | 'right') {
    event.preventDefault()
    setResizing(true)
    setResizingPosition(position)
    setResizeInitialMouseX(event.touches[0]?.clientX ?? 0)
    if (imageRef.current) {
      setResizeInitialWidth(imageRef.current.offsetWidth)
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (!resizing) return

    let dx = (event.touches[0]?.clientX ?? resizeInitialMouseX) - resizeInitialMouseX
    if (resizingPosition === 'left') {
      dx = resizeInitialMouseX - (event.touches[0]?.clientX ?? resizeInitialMouseX)
    }

    const newWidth = Math.max(resizeInitialWidth + dx, 150)
    const parentWidth = nodeRef.current?.parentElement?.offsetWidth ?? 0

    if (newWidth < parentWidth) {
      updateAttributes({
        width: newWidth,
      })
    }
  }

  function handleTouchEnd() {
    setResizing(false)
    setResizeInitialMouseX(0)
    setResizeInitialWidth(0)
  }

  function handleCaptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newCaption = e.target.value
    setCaption(newCaption)
  }

  function handleCaptionBlur() {
    updateAttributes({ caption })
    setEditingCaption(false)
  }

  function handleCaptionKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleCaptionBlur()
    }
  }

  const handleImageUrlSubmit = () => {
    if (imageUrl) {
      updateAttributes({
        src: imageUrl,
        alt: altText,
      })
      setImageUrl('')
      setAltText('')
      setOpenedMore(false)
    }
  }

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', endResize)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', endResize)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [resizing, resizeInitialMouseX, resizeInitialWidth])

  return (
    <NodeViewWrapper
      ref={nodeRef}
      className={cn(
        'relative flex flex-col rounded border-2 border-transparent transition-all duration-200',
        selected ? 'border-active' : '',
        node.attrs.align === 'left' && 'left-0 translate-x-0',
        node.attrs.align === 'center' && 'left-1/2 -translate-x-1/2',
        node.attrs.align === 'right' && 'left-full -translate-x-full'
      )}
      style={{ width: node.attrs.width }}
    >
      <div className={cn('group relative rounded-md')}>
        <figure className={cn('relative m-0')}>
          <img
            ref={imageRef}
            src={node.attrs.src}
            alt={node.attrs.alt}
            title={node.attrs.title}
            className="rounded-[inherit] object-center"
            onLoad={(e) => {
              const img = e.currentTarget
              const aspectRatio = img.naturalWidth / img.naturalHeight
              updateAttributes({ aspectRatio })
            }}
          />
          {editor?.isEditable && (
            <Fragment>
              <div
                className={cn(
                  'absolute left-0 top-0 z-20 cursor-nw-resize opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                  resizing && 'opacity-100'
                )}
                onMouseDown={(event) => {
                  handleResizingPosition({ e: event, position: 'left' })
                }}
                onTouchStart={(event) => handleTouchStart(event, 'left')}
              >
                <div className="size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-active ring-[3px] ring-active/50" />
              </div>
              <div
                className={cn(
                  'absolute right-0 top-0 z-20 cursor-ne-resize opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                  resizing && 'opacity-100'
                )}
                onMouseDown={(event) => {
                  handleResizingPosition({ e: event, position: 'right' })
                }}
                onTouchStart={(event) => handleTouchStart(event, 'right')}
              >
                <div className="size-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-active ring-[3px] ring-active/50" />
              </div>
              <div
                className={cn(
                  'absolute bottom-0 left-0 z-20 cursor-sw-resize opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                  resizing && 'opacity-100'
                )}
                onMouseDown={(event) => {
                  handleResizingPosition({ e: event, position: 'left' })
                }}
                onTouchStart={(event) => handleTouchStart(event, 'left')}
              >
                <div className="size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-active ring-[3px] ring-active/50" />
              </div>
              <div
                className={cn(
                  'absolute bottom-0 right-0 z-20 cursor-se-resize opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                  resizing && 'opacity-100'
                )}
                onMouseDown={(event) => {
                  handleResizingPosition({ e: event, position: 'right' })
                }}
                onTouchStart={(event) => handleTouchStart(event, 'right')}
              >
                <div className="size-2 translate-x-1/2 translate-y-1/2 rounded-full bg-active ring-[3px] ring-active/50" />
              </div>
            </Fragment>
          )}
        </figure>

        {editingCaption ? (
          <Input
            value={caption}
            onChange={handleCaptionChange}
            onBlur={handleCaptionBlur}
            onKeyDown={handleCaptionKeyDown}
            className="h-9 rounded-none border-0 py-0 text-center text-sm text-muted-foreground shadow-none focus:border-0 focus:ring-offset-0"
            placeholder="Thêm chú thích ..."
            autoFocus
          />
        ) : (
          <div
            className="h-9 cursor-text place-content-center place-items-center text-center text-sm text-muted-foreground"
            onClick={() => editor?.isEditable && setEditingCaption(true)}
          >
            {caption || 'Thêm chú thích ...'}
          </div>
        )}

        {editor?.isEditable && (
          <div
            className={cn(
              'absolute right-2 top-2 flex items-center gap-1 rounded-md border bg-background/80 p-1 opacity-0 backdrop-blur transition-opacity',
              !resizing && 'group-hover:opacity-100',
              openedMore && 'opacity-100'
            )}
          >
            <Button
              size="icon"
              className={cn('size-7', node.attrs.align === 'left' && 'bg-accent')}
              variant="ghost"
              type="button"
              onClick={() => updateAttributes({ align: 'left' })}
            >
              <AlignLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              className={cn('size-7', node.attrs.align === 'center' && 'bg-accent')}
              variant="ghost"
              type="button"
              onClick={() => updateAttributes({ align: 'center' })}
            >
              <AlignCenter className="size-4" />
            </Button>
            <Button
              size="icon"
              type="button"
              className={cn('size-7', node.attrs.align === 'right' && 'bg-accent')}
              variant="ghost"
              onClick={() => updateAttributes({ align: 'right' })}
            >
              <AlignRight className="size-4" />
            </Button>
            <Separator orientation="vertical" className="h-[20px]" />
            <DropdownMenu open={openedMore} onOpenChange={setOpenedMore}>
              <DropdownMenuTrigger
                render={
                  <Button size="icon" className="size-7" variant="ghost" type="button">
                    <MoreVertical className="size-4" />
                  </Button>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent align="start" alignOffset={-90} className="mt-1 min-w-48 text-sm">
                <DropdownMenuItem onClick={() => setEditingCaption(true)}>
                  <Edit className="mr-2 size-4" /> '{caption ? 'Chỉnh sửa chú thích' : 'Thêm chú thích'}'
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ImageIcon className="mr-2 size-4" /> Thay thế hình ảnh
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-fit min-w-72 p-4">
                    <div className="space-y-4">
                      <div>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="replace-image-upload"
                        />
                        <label
                          htmlFor="replace-image-upload"
                          className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 hover:bg-accent"
                        >
                          {isPending ? (
                            <Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />
                          ) : (
                            <Fragment>
                              <Icon name="Image" size={24} />
                              <Typography variant="small">Chọn hình ảnh mới từ thiết bị của bạn</Typography>
                            </Fragment>
                          )}
                        </label>
                        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
                      </div>
                      <Separator className="relative">
                        <Typography
                          variant="small"
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs uppercase"
                        >
                          Hoặc
                        </Typography>
                      </Separator>
                      <div>
                        <div className="space-y-2">
                          <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Nhập URL hình ảnh mới"
                            className="text-xs"
                          />
                          <Button
                            onClick={handleImageUrlSubmit}
                            className="w-full"
                            type="button"
                            disabled={!imageUrl}
                            size="sm"
                          >
                            Thay thế bằng URL
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Alt text (hiển thị khi hình ảnh không tải được)</Label>
                        <Input
                          value={altText}
                          onChange={(e) => setAltText(e.target.value)}
                          placeholder="Alt text (optional)"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  onClick={() => {
                    const aspectRatio = node.attrs.aspectRatio
                    if (aspectRatio) {
                      const parentWidth = nodeRef.current?.parentElement?.offsetWidth ?? 0
                      updateAttributes({
                        width: parentWidth,
                        height: parentWidth / aspectRatio,
                      })
                    }
                  }}
                >
                  <Maximize className="mr-2 size-4" /> Phóng to vừa khung
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={deleteNode}>
                  <Trash className="mr-2 size-4" /> Xóa hình ảnh
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
