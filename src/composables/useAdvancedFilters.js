import { ref, computed, watch } from 'vue'

export function useAdvancedFilters(items, options = {}) {
  const {
    searchFields = ['serial', 'notes'],
    dateField = 'createdAt',
    statusField = 'status'
  } = options

  // Filter state
  const searchQuery = ref('')
  const dateRange = ref({ from: null, to: null })
  const selectedStatuses = ref([])
  const customFilters = ref({})
  const sortBy = ref(null)
  const sortOrder = ref('desc') // 'asc' or 'desc'

  // Saved presets
  const savedPresets = ref([])
  
  // Load presets from localStorage
  const loadPresets = () => {
    const stored = localStorage.getItem('filterPresets')
    if (stored) {
      try {
        savedPresets.value = JSON.parse(stored)
      } catch (e) {
        console.error('Error loading presets:', e)
      }
    }
  }

  // Save preset
  const savePreset = (name) => {
    const preset = {
      id: Date.now(),
      name,
      filters: {
        searchQuery: searchQuery.value,
        dateRange: { ...dateRange.value },
        selectedStatuses: [...selectedStatuses.value],
        customFilters: { ...customFilters.value },
        sortBy: sortBy.value,
        sortOrder: sortOrder.value
      }
    }
    
    savedPresets.value.push(preset)
    localStorage.setItem('filterPresets', JSON.stringify(savedPresets.value))
    return preset
  }

  // Apply preset
  const applyPreset = (preset) => {
    const filters = preset.filters
    searchQuery.value = filters.searchQuery || ''
    dateRange.value = filters.dateRange || { from: null, to: null }
    selectedStatuses.value = filters.selectedStatuses || []
    customFilters.value = filters.customFilters || {}
    sortBy.value = filters.sortBy || null
    sortOrder.value = filters.sortOrder || 'desc'
  }

  // Delete preset
  const deletePreset = (presetId) => {
    savedPresets.value = savedPresets.value.filter(p => p.id !== presetId)
    localStorage.setItem('filterPresets', JSON.stringify(savedPresets.value))
  }

  // Clear all filters
  const clearFilters = () => {
    searchQuery.value = ''
    dateRange.value = { from: null, to: null }
    selectedStatuses.value = []
    customFilters.value = {}
  }

  // Toggle sort
  const toggleSort = (field) => {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = 'desc'
    }
  }

  // Filtered items
  const filteredItems = computed(() => {
    let result = [...items.value]

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = item[field]
          return value && value.toString().toLowerCase().includes(query)
        })
      })
    }

    // Date range filter
    if (dateRange.value.from || dateRange.value.to) {
      result = result.filter(item => {
        const itemDate = item[dateField]
        if (!itemDate) return false

        let date
        if (itemDate.toDate) {
          date = itemDate.toDate()
        } else if (itemDate instanceof Date) {
          date = itemDate
        } else {
          date = new Date(itemDate)
        }

        if (dateRange.value.from && date < new Date(dateRange.value.from)) {
          return false
        }
        if (dateRange.value.to && date > new Date(dateRange.value.to)) {
          return false
        }
        return true
      })
    }

    // Status filter
    if (selectedStatuses.value.length > 0) {
      result = result.filter(item => {
        return selectedStatuses.value.includes(item[statusField])
      })
    }

    // Custom filters
    Object.entries(customFilters.value).forEach(([field, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter(item => {
          if (Array.isArray(value)) {
            return value.includes(item[field])
          }
          return item[field] === value
        })
      }
    })

    // Sorting
    if (sortBy.value) {
      result.sort((a, b) => {
        const aVal = a[sortBy.value]
        const bVal = b[sortBy.value]

        if (aVal === bVal) return 0

        let comparison = 0
        if (typeof aVal === 'string') {
          comparison = aVal.localeCompare(bVal)
        } else if (typeof aVal === 'number') {
          comparison = aVal - bVal
        } else if (aVal instanceof Date || aVal?.toDate) {
          const aDate = aVal.toDate ? aVal.toDate() : aVal
          const bDate = bVal.toDate ? bVal.toDate() : bVal
          comparison = aDate - bDate
        }

        return sortOrder.value === 'asc' ? comparison : -comparison
      })
    }

    return result
  })

  // Active filters count
  const activeFiltersCount = computed(() => {
    let count = 0
    if (searchQuery.value) count++
    if (dateRange.value.from || dateRange.value.to) count++
    if (selectedStatuses.value.length > 0) count++
    count += Object.keys(customFilters.value).length
    return count
  })

  // Load presets on init
  loadPresets()

  return {
    // State
    searchQuery,
    dateRange,
    selectedStatuses,
    customFilters,
    sortBy,
    sortOrder,
    savedPresets,
    
    // Computed
    filteredItems,
    activeFiltersCount,
    
    // Methods
    savePreset,
    applyPreset,
    deletePreset,
    clearFilters,
    toggleSort,
    loadPresets
  }
}

