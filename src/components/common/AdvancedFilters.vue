<template>
  <div class="card p-4 space-y-4">
    <!-- Search -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Поиск
      </label>
      <input
        v-model="searchQuery"
        type="text"
        class="input"
        placeholder="Поиск..."
      />
    </div>

    <!-- Date Range -->
    <div v-if="showDateFilter">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Период
      </label>
      <div class="grid grid-cols-2 gap-2">
        <input
          v-model="dateRange.from"
          type="date"
          class="input"
          placeholder="От"
        />
        <input
          v-model="dateRange.to"
          type="date"
          class="input"
          placeholder="До"
        />
      </div>
    </div>

    <!-- Status Filter -->
    <div v-if="statusOptions && statusOptions.length > 0">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Статус
      </label>
      <div class="space-y-2">
        <label
          v-for="status in statusOptions"
          :key="status.value"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            :value="status.value"
            v-model="selectedStatuses"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ status.label }}</span>
        </label>
      </div>
    </div>

    <!-- Custom Filters Slot -->
    <slot name="custom-filters"></slot>

    <!-- Active Filters Badge -->
    <div v-if="activeFiltersCount > 0" class="flex items-center justify-between">
      <span class="text-sm text-gray-600 dark:text-gray-400">
        Активных фильтров: <span class="font-bold text-primary-600">{{ activeFiltersCount }}</span>
      </span>
      <button @click="clearAll" class="text-sm text-red-600 hover:text-red-700">
        Очистить все
      </button>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button @click="openSavePresetDialog" class="btn-ghost flex-1">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Сохранить
      </button>
      <button @click="clearAll" class="btn-ghost flex-1">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Очистить
      </button>
    </div>

    <!-- Saved Presets -->
    <div v-if="savedPresets.length > 0" class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Сохранённые фильтры
      </label>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="preset in savedPresets"
          :key="preset.id"
          class="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
        >
          <button
            @click="applyPresetHandler(preset)"
            class="hover:underline"
          >
            {{ preset.name }}
          </button>
          <button
            @click="deletePresetHandler(preset.id)"
            class="text-primary-600 hover:text-primary-800"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Save Preset Dialog -->
    <BaseModal
      v-model="showSaveDialog"
      title="Сохранить фильтр"
      size="sm"
      @confirm="savePresetHandler"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Название фильтра
        </label>
        <input
          v-model="presetName"
          type="text"
          class="input"
          placeholder="Например: Отгрузки за месяц"
          @keyup.enter="savePresetHandler"
        />
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  searchQuery: String,
  dateRange: Object,
  selectedStatuses: Array,
  statusOptions: Array,
  savedPresets: Array,
  activeFiltersCount: Number,
  showDateFilter: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:dateRange',
  'update:selectedStatuses',
  'clear',
  'savePreset',
  'applyPreset',
  'deletePreset'
])

const showSaveDialog = ref(false)
const presetName = ref('')

const searchQuery = ref(props.searchQuery)
const dateRange = ref(props.dateRange)
const selectedStatuses = ref(props.selectedStatuses)

// Watch and emit changes
const updateSearch = (value) => {
  emit('update:searchQuery', value)
}

const updateDateRange = (value) => {
  emit('update:dateRange', value)
}

const updateStatuses = (value) => {
  emit('update:selectedStatuses', value)
}

const clearAll = () => {
  emit('clear')
}

const openSavePresetDialog = () => {
  if (props.activeFiltersCount === 0) {
    return
  }
  showSaveDialog.value = true
  presetName.value = ''
}

const savePresetHandler = () => {
  if (!presetName.value.trim()) return
  
  emit('savePreset', presetName.value.trim())
  showSaveDialog.value = false
  presetName.value = ''
}

const applyPresetHandler = (preset) => {
  emit('applyPreset', preset)
}

const deletePresetHandler = (presetId) => {
  if (confirm('Удалить этот фильтр?')) {
    emit('deletePreset', presetId)
  }
}
</script>

