const convertBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = (event) => resolve(event.target!.result)
    fileReader.onerror = (error) => reject(error)
  })
}

export default convertBase64
