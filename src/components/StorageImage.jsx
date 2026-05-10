import useStorageImageUrl from "../hooks/useStorageImageUrl"

export default function StorageImage({ src, alt = "image", className = "", fallback = "https://via.placeholder.com/300x300?text=Image+non+disponible", ...props }) {
  const resolvedUrl = useStorageImageUrl(src)
  const imageUrl = resolvedUrl || (/^(https?:|blob:|data:)/i.test(src) ? src : fallback)

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        if (e.target.src !== fallback) {
          e.target.src = fallback
        }
      }}
      {...props}
    />
  )
}
