import { ref } from 'vue'

export function useDragDrop(options = {}) {
  const {
    onDrop = () => {},
    accept = '*',
    multiple = false
  } = options

  const isDragging = ref(false)
  const files = ref([])

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = true
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only set to false if leaving the drop zone entirely
    if (e.target === e.currentTarget) {
      isDragging.value = false
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false

    const droppedFiles = Array.from(e.dataTransfer.files)
    
    // Filter by accept type
    const filteredFiles = accept === '*' 
      ? droppedFiles 
      : droppedFiles.filter(file => {
          const acceptTypes = accept.split(',').map(t => t.trim())
          return acceptTypes.some(type => {
            if (type.startsWith('.')) {
              return file.name.endsWith(type)
            }
            if (type.endsWith('/*')) {
              return file.type.startsWith(type.replace('/*', ''))
            }
            return file.type === type
          })
        })

    files.value = multiple ? filteredFiles : filteredFiles.slice(0, 1)
    
    if (files.value.length > 0) {
      await onDrop(files.value)
    }
  }

  const handleFileInput = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    files.value = multiple ? selectedFiles : selectedFiles.slice(0, 1)
    
    if (files.value.length > 0) {
      await onDrop(files.value)
    }
  }

  const clearFiles = () => {
    files.value = []
  }

  return {
    isDragging,
    files,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    clearFiles
  }
}

