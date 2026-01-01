import { ref } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

export function useScanner() {
  const isScanning = ref(false)
  const scanner = ref(null)
  
  const startScanner = async (elementId, onSuccess, onError) => {
    if (scanner.value) return
    
    try {
      scanner.value = new Html5Qrcode(elementId)
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      }
      
      await scanner.value.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          onSuccess(decodedText)
        },
        (errorMessage) => {
          // Ignore continuous scan errors
        }
      )
      
      isScanning.value = true
    } catch (error) {
      console.error('Scanner start error:', error)
      if (onError) onError(error)
      
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Сканер требует HTTPS!')
      } else {
        throw new Error('Ошибка доступа к камере')
      }
    }
  }
  
  const stopScanner = async () => {
    if (scanner.value && isScanning.value) {
      try {
        await scanner.value.stop()
        scanner.value.clear()
        scanner.value = null
        isScanning.value = false
      } catch (error) {
        console.error('Scanner stop error:', error)
      }
    }
  }
  
  return {
    isScanning,
    startScanner,
    stopScanner
  }
}

