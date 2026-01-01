import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useVirtualScroll(items, itemHeight = 60, visibleCount = 20) {
  const scrollTop = ref(0)
  const containerRef = ref(null)

  const totalHeight = computed(() => items.value.length * itemHeight)

  const startIndex = computed(() => {
    return Math.floor(scrollTop.value / itemHeight)
  })

  const endIndex = computed(() => {
    return Math.min(
      startIndex.value + visibleCount + 1,
      items.value.length
    )
  })

  const visibleItems = computed(() => {
    return items.value.slice(startIndex.value, endIndex.value).map((item, index) => ({
      ...item,
      _index: startIndex.value + index,
      _top: (startIndex.value + index) * itemHeight
    }))
  })

  const offsetY = computed(() => startIndex.value * itemHeight)

  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop
  }

  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll)
    }
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  }
}

