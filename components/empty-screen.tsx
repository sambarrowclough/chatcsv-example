import { UseChatHelpers, useChat } from 'ai/react'

import { Button } from '@/components/ui/button'
import { useFileUpload } from '@/lib/hooks/use-file-upload'
import { CreateMessage } from 'ai'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import toast from 'react-hot-toast'
import { IconSpinner } from './ui/icons'

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { append } = useChat({
    sendExtraMessageFields: true
  })

  const { upload, isLoading } = useFileUpload({
    onError: error => {
      toast.error(error.message)
    },
    onSuccess: async url => {
      router.refresh()

      await append({
        role: 'user',
        content: 'Give me a quick rundown of this data',
        file: url
      } as CreateMessage)
    }
  })

  return (
    <>
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-lg border bg-background p-8 text-center flex items-center flex-col">
          <div className="mb-4 border rounded-md p-4">
            <Upload strokeWidth={1.5} />
          </div>

          <h1 className="mb-2 text-lg font-semibold">Attach a file</h1>
          <p className="mb-4 leading-normal text-muted-foreground">
            Upload a file or start a conversation to get started.
          </p>

          <div>
            <label htmlFor="file-upload-empty-screen">
              <Button
                disabled={isLoading}
                onClick={e => {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }}
                size={'sm'}
              >
                {isLoading ? (
                  <IconSpinner className="animate-spin mr-2" />
                ) : null}
                Attach file
              </Button>

              <span className="sr-only">Attach file</span>
            </label>
            <input
              ref={fileInputRef}
              id="file-upload-empty-screen"
              type="file"
              onChange={upload}
              style={{ display: 'none' }}
            />
          </div>

          <button
            className="mt-4 text-sm text-muted-foreground underline underline-offset-4"
            onClick={event => {
              event.preventDefault() // Prevents the default button behavior
              const url =
                'https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv'
              const filename = 'titanic.csv'

              fetch(url)
                .then(response => response.blob())
                .then(blob => {
                  // Create a temporary URL for the Blob
                  const blobURL = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = blobURL
                  link.download = filename
                  link.click()
                  URL.revokeObjectURL(blobURL) // Clean up the temporary URL
                })
            }}
          >
            Download the Titanic sample data
          </button>
        </div>
      </div>
    </>
  )
}
