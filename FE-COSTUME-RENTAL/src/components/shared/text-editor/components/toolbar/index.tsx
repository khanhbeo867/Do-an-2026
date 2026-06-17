import { Tooltip } from '@/components/shared/tooltip'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useEditorState } from '@tiptap/react'
import { useEditorContext } from '../../context/editor-context'
import { AlignmentDropdownMenu } from './toolbar-alignment-dropdown'
import ToolbarColorPicker from './toolbar-color-picker'
import FontSizeInput from './toolbar-font-size-input'
import ImageDropdown from './toolbar-image-dropdown'
import { LinkPopover } from './toolbar-link-popover'
import { SearchAndReplaceToolbar } from './toolbar-search-replace'
import { StyleDropdownMenu } from './toolbar-style-dropdown'
import TableDropdownMenu from './toolbar-table-dropdown'

const Toolbar: React.FC = () => {
  const { editor } = useEditorContext()

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isBlockquote: editor.isActive('blockquote'),
      isUnderline: editor.isActive('underline'),
      isStrike: editor.isActive('strike'),
      isCodeBlock: editor.isActive('codeBlock'),
      isBulletList: editor.isActive('bulletList'),
      isOrderedList: editor.isActive('orderedList'),
      isTaskList: editor.isActive('taskList'),
    }),
  })

  return (
    <nav>
      <div className="flex h-full items-center gap-x-1 overflow-y-hidden p-1.5">
        <SearchAndReplaceToolbar />

        <Separator orientation="vertical" className="mx-3 h-6 w-0.5 min-w-0.5 basis-0.5" />

        {/* Undo */}
        <Tooltip
          message="Hoàn tác"
          triggerProps={{
            render: (
              <Button
                className="aspect-square size-8"
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().undo().run()}
              >
                <Icon name="Undo2" />
              </Button>
            ),
          }}
        />
        {/* Redo */}
        <Tooltip
          message="Trở lại"
          triggerProps={{
            render: (
              <Button
                className="aspect-square size-8"
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().redo().run()}
              >
                <Icon name="Redo2" />
              </Button>
            ),
          }}
        />

        <Separator orientation="vertical" className="mx-3 h-6 w-0.5 min-w-0.5 basis-0.5" />

        {/* Change style */}
        <StyleDropdownMenu />

        {/* Change font size */}
        <Tooltip
          message="Kích thước chữ"
          triggerProps={{
            render: <FontSizeInput />,
          }}
        />

        <Separator orientation="vertical" className="mx-3 h-6 w-0.5 min-w-0.5 basis-0.5" />

        <AlignmentDropdownMenu />

        {/* Toggle bold */}
        <Tooltip
          message="In đậm"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                type="button"
                size="icon"
                className={cn('aspect-square size-8', editorState.isBold && 'bg-accent text-accent-foreground')}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Icon name="Bold" />
              </Button>
            ),
          }}
        />

        {/* Toggle italic */}
        <Tooltip
          message="In nghiêng"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                type="button"
                size="icon"
                className={cn('aspect-square size-8', {
                  'bg-accent text-accent-foreground': editorState.isItalic,
                })}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Icon name="Italic" />
              </Button>
            ),
          }}
        />

        {/* Toggle quote */}
        <Tooltip
          message="Blockquote"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                type="button"
                size="icon"
                className={cn('aspect-square size-8', {
                  'bg-accent text-accent-foreground': editorState.isBlockquote,
                })}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <Icon name="Quote" size={14} />
              </Button>
            ),
          }}
        />

        {/* Toggle underline */}
        <Tooltip
          message="Gạch chân"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                type="button"
                size="icon"
                className={cn('aspect-square size-8', {
                  'bg-accent text-accent-foreground': editorState.isUnderline,
                })}
                onClick={() => editor.commands.toggleUnderline()}
              >
                <Icon name="Underline" />
              </Button>
            ),
          }}
        />

        {/* Toggle underline */}
        <Tooltip
          message="Đoạn mã"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                type="button"
                size="icon"
                className={cn('aspect-square size-8', {
                  'bg-accent text-accent-foreground': editorState.isCodeBlock,
                })}
                onClick={() => editor.commands.toggleCodeBlock()}
              >
                <Icon name="Code" />
              </Button>
            ),
          }}
        />

        {/* Toggle strike linethough */}
        <Tooltip
          message="Gạch ngang"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                type="button"
                size="icon"
                className={cn('aspect-square size-8', {
                  'bg-accent text-accent-foreground': editorState.isStrike,
                })}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Icon name="Strikethrough" className="h-4 w-4" />
              </Button>
            ),
          }}
        />

        <Separator orientation="vertical" className="mx-3 h-6 w-0.5 min-w-0.5 basis-0.5" />

        {/* Text color and highlight */}
        <ToolbarColorPicker label="Màu chữ" icon="Baseline" type="textStyle" />
        <ToolbarColorPicker label="Highlight" icon="Highlighter" type="highlight" />

        <Separator orientation="vertical" className="mx-3 h-6 w-0.5 min-w-0.5 basis-0.5" />

        {/* Toggle ordered list */}
        <Tooltip
          message="Danh sách có thứ tự"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                type="button"
                size="icon"
                className={cn('aspect-square size-8', {
                  'bg-accent text-accent-foreground': editorState.isOrderedList,
                })}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <Icon name="ListOrdered" size={20} />
              </Button>
            ),
          }}
        />

        {/* Toggle bullet list */}
        <Tooltip
          message="Danh sách không thứ tự"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className={cn('aspect-square size-8', {
                  'bg-accent text-accent-foreground': editorState.isBulletList,
                })}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <Icon name="List" size={18} />
              </Button>
            ),
          }}
        />
        {/* Toggle task list */}
        <Tooltip
          message="Danh sách công việc"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                type="button"
                size="icon"
                className={cn('aspect-square size-8', {
                  'bg-accent text-accent-foreground': editorState.isTaskList,
                })}
                onClick={() => {
                  editor.chain().focus().toggleTaskList().run()
                }}
              >
                <Icon name="ListTodo" size={18} />
              </Button>
            ),
          }}
        />

        {/* Horizontal ruler */}
        <Tooltip
          message="Chèn đường kẻ ngang"
          triggerProps={{
            render: (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="aspect-square size-8"
                onClick={() => editor.commands.setHorizontalRule()}
              >
                <Icon name="PencilLine" />
              </Button>
            ),
          }}
        />
        <LinkPopover />
        <ImageDropdown />
        <TableDropdownMenu />
      </div>
    </nav>
  )
}

export default Toolbar
