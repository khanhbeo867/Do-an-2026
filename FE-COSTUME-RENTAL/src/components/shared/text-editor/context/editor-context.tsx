import { type Editor } from '@tiptap/react'
import { createContext, use } from 'react'

type EditorContextType = {
  editor: Editor
}

export const EditorContext = createContext<EditorContextType | null>(null)

export const EditorContextProvider: React.FC<EditorContextType & React.PropsWithChildren> = ({ editor, children }) => {
  return <EditorContext.Provider value={{ editor }}>{children}</EditorContext.Provider>
}

export const useEditorContext = () => {
  const context = use(EditorContext)

  if (!context) {
    throw new Error('useEditorContext must be used within a ToolbarProvider')
  }

  return context
}
