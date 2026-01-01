import { ref, computed, watch } from 'vue'

export function usePagination(items, options = {}) {
  const {
    pageSize: initialPageSize = 20,
    pageSizes = [10, 20, 50, 100]
  } = options

  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)

  // Computed
  const totalPages = computed(() => {
    return Math.ceil(items.value.length / pageSize.value)
  })

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return items.value.slice(start, end)
  })

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })

  const hasPrevPage = computed(() => {
    return currentPage.value > 1
  })

  const startIndex = computed(() => {
    return (currentPage.value - 1) * pageSize.value + 1
  })

  const endIndex = computed(() => {
    return Math.min(currentPage.value * pageSize.value, items.value.length)
  })

  // Methods
  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const changePageSize = (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1 // Reset to first page
  }

  // Reset to first page when items change
  watch(() => items.value.length, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = 1
    }
  })

  return {
    // State
    currentPage,
    pageSize,
    pageSizes,
    
    // Computed
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    
    // Methods
    nextPage,
    prevPage,
    goToPage,
    changePageSize
  }
}

