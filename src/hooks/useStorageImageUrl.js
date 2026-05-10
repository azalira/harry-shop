import { useEffect, useState } from "react"
import { resolveStorageUrl } from "../services/supabaseClient"

const isAbsoluteUrl = (value) => /^(https?:|blob:|data:)/i.test(value)
const isSupabaseStorageUrl = (value) => /storage\/v1\/object\/(?:public|sign)\//i.test(value)

export default function useStorageImageUrl(value) {
  const [resolvedUrl, setResolvedUrl] = useState(null)

  useEffect(() => {
    let isMounted = true

    if (!value) {
      setResolvedUrl(null)
      return
    }

    const loadUrl = async () => {
      if (isAbsoluteUrl(value) && !isSupabaseStorageUrl(value)) {
        if (isMounted) setResolvedUrl(value)
        return
      }

      const url = await resolveStorageUrl(value)
      if (isMounted) setResolvedUrl(url)
    }

    loadUrl()

    return () => {
      isMounted = false
    }
  }, [value])

  return resolvedUrl
}
