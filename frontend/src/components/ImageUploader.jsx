import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

let uid = 0

export default function ImageUploader({ images = [], onImagesChange, maxImages = 10 }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const getPreview = useCallback((img) => {
    if (img.file) return URL.createObjectURL(img.file)
    return img.url || ''
  }, [])

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img._url) URL.revokeObjectURL(img._url)
        img._url = null
      })
    }
  }, [images])

  const handleSelect = () => inputRef.current?.click()

  const handleFile = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > maxImages) {
      return alert(`最多 ${maxImages} 张图片`)
    }
    const newItems = files.map((file) => ({ _id: ++uid, file }))
    onImagesChange([...images, ...newItems])
    e.target.value = ''
  }

  const handleRemove = (index) => {
    const removed = images[index]
    if (removed && removed._url) URL.revokeObjectURL(removed._url)
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div
              key={img._id || img.url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/10 group bg-white/5"
            >
              <img src={getPreview(img)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white/80 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                ✕
              </button>
              {img.file && (
                <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white/50">新</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length < maxImages && (
          <motion.button
            type="button"
            onClick={handleSelect}
            disabled={uploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-28 h-28 rounded-xl border-2 border-dashed border-white/10 hover:border-white/30 flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white/50 transition-all disabled:opacity-30 shrink-0"
          >
            {uploading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-lg leading-none">+</span>
                <span className="text-[10px]">添加图片</span>
              </>
            )}
          </motion.button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
      <p className="text-[11px] text-white/20">先暂存前端，保存时一起上传</p>
    </div>
  )
}
