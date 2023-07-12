type ChatStreamProps = {
  response: Response
  onEnd?: (fullValue: string) => void // Define the onEnd callback
}

export async function chatStream({ response, onEnd }: ChatStreamProps) {
  if (!response.ok) {
    throw new Error('Response not OK')
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()

  let fullValue = new Uint8Array()

  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read()
        if (value) {
          fullValue = concatTypedArrays(fullValue, value)
        }
        if (done) {
          controller.close()
          // Call the onEnd callback with the fullValue if it exists
          if (onEnd) {
            const textDecoder = new TextDecoder()
            const fullText = textDecoder.decode(fullValue)
            onEnd(fullText)
          }
          break
        }
        controller.enqueue(value)
      }
    }
  })

  return stream
}

function concatTypedArrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const c = new Uint8Array(a.length + b.length)
  c.set(a, 0)
  c.set(b, a.length)
  return c
}
