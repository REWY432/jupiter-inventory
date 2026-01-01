import { onMounted, onUnmounted } from 'vue'

export function useKeyboard(shortcuts) {
  const handleKeydown = (event) => {
    const key = event.key.toLowerCase()
    const ctrl = event.ctrlKey || event.metaKey
    const shift = event.shiftKey
    const alt = event.altKey

    for (const [combo, handler] of Object.entries(shortcuts)) {
      const parts = combo.toLowerCase().split('+')
      const hasCtrl = parts.includes('ctrl') || parts.includes('cmd')
      const hasShift = parts.includes('shift')
      const hasAlt = parts.includes('alt')
      const mainKey = parts[parts.length - 1]

      if (
        key === mainKey &&
        ctrl === hasCtrl &&
        shift === hasShift &&
        alt === hasAlt
      ) {
        event.preventDefault()
        handler(event)
        break
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    handleKeydown
  }
}

