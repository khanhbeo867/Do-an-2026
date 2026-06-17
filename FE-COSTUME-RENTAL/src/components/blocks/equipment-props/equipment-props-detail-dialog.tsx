import { CommonActions } from '@/common/constants/enums'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { usePageEventContext } from '@/contexts/event-context'
import { useState } from 'react'

const EquipmentPropsDetailDialog: React.FC = () => {
  const [description, setDescription] = useState('')

  const { event$ } = usePageEventContext()

  event$.useSubscription((e) => {
    if (e.action === CommonActions.READ) {
      setDescription(e.payload)
    }
  })

  return (
    <Dialog
      open={!!description}
      onOpenChange={(open) => {
        if (!open) setDescription('')
      }}
    >
      <DialogContent className="max-w-6xl h-[90vh] overflow-auto">
        <div
          dangerouslySetInnerHTML={{ __html: description }}
          className="space-y-3 [&_table]:mb-6 [&_table_th]:text-left prose-h3:text-lg"
        />
      </DialogContent>
    </Dialog>
  )
}

export default EquipmentPropsDetailDialog
