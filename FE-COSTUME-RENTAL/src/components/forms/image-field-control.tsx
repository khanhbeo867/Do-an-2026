import { convertFileArrayToFileList } from '@/common/helpers/form-data'
import type { AnyFieldApi } from '@tanstack/react-form'
import React from 'react'
import { GalleryUpload, type GalleryUploadProps } from '../shared/gallery-upload'
import { Field, FieldError, FieldLabel } from '../ui/field'

type ImageFieldControlProps = GalleryUploadProps & {
  field: AnyFieldApi
  label?: string
  orientation: React.ComponentProps<typeof Field>['orientation']
}

const ImageFieldControl: React.FC<ImageFieldControlProps> = ({ field, orientation, label = 'Hình ảnh', ...props }) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field orientation={orientation}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <GalleryUpload
        {...props}
        onFilesChange={(files) => field.handleChange(convertFileArrayToFileList(files.map(({ file }) => file as File)))}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default ImageFieldControl
