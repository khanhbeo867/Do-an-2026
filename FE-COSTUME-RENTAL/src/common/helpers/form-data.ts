export const MULTIPART_HEADER: { headers: RequestHeaders } = {
  headers: { 'content-type': 'multipart/form-data' },
}

type FormDataValue = string | number | boolean | null | undefined | File | Blob | File[] | FileList

export function convertFileArrayToFileList(fileArray: File[]) {
  const dataTransfer = new DataTransfer()
  fileArray.forEach((file) => {
    dataTransfer.items.add(file)
  })
  return dataTransfer.files
}

export function createFormData(payload: Record<string, FormDataValue> & { _method?: RequestMethod }): FormData {
  const formData = new FormData()
  const jsonFields: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(payload)) {
    if (value instanceof File) {
      // Single file
      formData.append(key, value)
    } else if (value instanceof FileList) {
      // FileList từ <input type="file" multiple> — không phải Array nên cần xử lý riêng
      Array.from(value).forEach((file) => formData.append(key, file))
    } else if (Array.isArray(value) && value.every((item) => item instanceof File)) {
      // Mảng File[]
      value.forEach((file) => formData.append(key, file))
    } else if (value instanceof Blob) {
      formData.append(key, value)
    } else if (key === '_method' && typeof value === 'string') {
      formData.append(key, value)
    } else if (value !== null && value !== undefined) {
      jsonFields[key] = value
    }
  }

  formData.append('data', JSON.stringify(jsonFields))

  return formData
}
