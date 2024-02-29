import { useState } from 'react'

type UseFileUploadProps = {
  onError?: (error: any) => void
  onSuccess?: (data: any) => void // Adjusted to pass the whole data object on success
}

type UploadResponse = {
  data: {
    code: string
    downloadPage: string
    fileId: string
    fileName: string
    guestToken: string
    md5: string
    parentFolder: string
  }
  status: string
}

// Extracted upload logic into its own function
async function uploadFile(
  file: File,
  onSuccess?: (url: string) => void,
  onError?: (error: any) => void
) {
  const formData = new FormData()
  const uniqueId = Date.now().toString()
  const fileExtension = file.name.split('.').pop()
  const newFileName = `${uniqueId}.${fileExtension}`
  const fileWithNewName = new File([file], newFileName, { type: file.type })
  formData.append('file', fileWithNewName)

  try {
    const response = await fetch('https://store1.gofile.io/uploadFile', {
      method: 'POST',
      body: formData
    })
    const data: UploadResponse = await response.json()
    if (data.status === 'ok') {
      const url = `https://store1.gofile.io/download/${data.data.fileId}/${data.data.fileName}`
      console.log(url)
      onSuccess?.(url)
    } else {
      onError?.(data)
    }
  } catch (error) {
    onError?.((error as any).message)
  }
}

export function useFileUpload({ onError, onSuccess }: UseFileUploadProps) {
  const [isLoading, setIsLoading] = useState(false)

  const upload = async (e: any) => {
    const file = e.target.files[0] as File

    if (!file) return

    setIsLoading(true)

    // Use the extracted function
    await uploadFile(
      file,
      url => {
        setIsLoading(false)
        onSuccess?.(url)
      },
      error => {
        setIsLoading(false)
        onError?.(error)
      }
    )
  }

  return {
    upload,
    isLoading
  }
}
