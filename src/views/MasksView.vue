<template>
  <AppLayout>
    <div class="p-4 lg:p-8 space-y-6">
      <!-- Breadcrumbs -->
      <Breadcrumbs />

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Маски</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Учет фехтовальных масок</p>
        </div>
        <button @click="openCreate" class="btn-primary">
          <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Добавить
        </button>
      </div>

      <!-- Stats -->
      <div v-if="!masksStore.isLoading" class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="card p-4 border-l-4 border-primary-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Всего</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ masksStore.totalCount }}</div>
        </div>
        <div class="card p-4 border-l-4 border-green-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Рапира</div>
          <div class="text-2xl font-bold text-green-600 mt-1">{{ masksStore.rapierCount }}</div>
        </div>
        <div class="card p-4 border-l-4 border-red-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Шпага</div>
          <div class="text-2xl font-bold text-red-600 mt-1">{{ masksStore.epeeCount }}</div>
        </div>
        <div class="card p-4 border-l-4 border-amber-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Сабля</div>
          <div class="text-2xl font-bold text-amber-600 mt-1">{{ masksStore.sabreCount }}</div>
        </div>
        <div class="card p-4 border-l-4 border-cyan-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Тренер</div>
          <div class="text-2xl font-bold text-cyan-600 mt-1">{{ masksStore.coachCount }}</div>
        </div>
      </div>

      <!-- Skeleton for Stats -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SkeletonLoader v-for="i in 5" :key="i" height="100px" rounded="lg" />
      </div>

      <!-- Filters & Actions -->
      <div class="card p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по серийному номеру..."
              class="input"
            />
          </div>
          <select v-model="filterModel" class="select lg:w-48">
            <option value="">Все модели</option>
            <option value="Рапира">Рапира</option>
            <option value="Шпага">Шпага</option>
            <option value="Сабля">Сабля</option>
            <option value="Тренер">Тренер</option>
          </select>
          <select v-model="filterSize" class="select lg:w-32">
            <option value="">Все размеры</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
          <button @click="openBulkAdd" class="btn-ghost">
            <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Массовое
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        <div v-if="masksStore.isLoading" class="p-6 space-y-3">
          <SkeletonLoader v-for="i in 10" :key="i" height="60px" />
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    v-model="selectAll"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">№</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Серийный номер</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Модель</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Размер</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Поколение</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Дата</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              <tr
                v-for="mask in paginatedMasks"
                :key="mask.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                @contextmenu.prevent="openContextMenu($event, mask)"
              >
                <td class="px-6 py-4">
                  <input
                    type="checkbox"
                    v-model="selectedIds"
                    :value="mask.id"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">#{{ mask.globalSeq }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-mono font-bold text-gray-900 dark:text-white">{{ mask.serial }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['badge', getModelBadgeClass(mask.model)]">{{ mask.model }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ mask.size }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{{ mask.generation }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{{ mask.month }}.{{ mask.year }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="openEdit(mask)" class="text-primary-600 hover:text-primary-900" title="Редактировать">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="printLabel(mask)" class="text-gray-600 hover:text-gray-900" title="Печать этикетки">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                    <button @click="deleteMask(mask)" class="text-red-600 hover:text-red-900" title="Удалить">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredMasks.length === 0 && !masksStore.isLoading" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Нет масок</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Начните с добавления первой маски</p>
          <div class="mt-6">
            <button @click="openCreate" class="btn-primary">
              <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Добавить маску
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredMasks.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Показано <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> -
            <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredMasks.length) }}</span> из
            <span class="font-medium">{{ filteredMasks.length }}</span>
          </div>
          <div class="flex gap-2">
            <button @click="currentPage--" :disabled="currentPage === 1" class="btn-ghost disabled:opacity-50">Назад</button>
            <button @click="currentPage++" :disabled="currentPage >= totalPages" class="btn-ghost disabled:opacity-50">Вперед</button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <Transition name="slide-up">
        <div v-if="selectedIds.length > 0" class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div class="glass-strong px-6 py-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                Выбрано: {{ selectedIds.length }}
              </span>
              <div class="flex gap-2">
                <button @click="bulkPrint" class="btn-ghost">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Печать
                </button>
                <button @click="bulkDelete" class="btn-danger">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Удалить
                </button>
                <button @click="clearSelection" class="btn-ghost">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Modals -->
    <MaskModal
      v-model="showMaskModal"
      :mask="editingMask"
      @success="handleSuccess"
      @open-generations="showGenerationsModal = true"
    />

    <GenerationsModal v-model="showGenerationsModal" />

    <BulkAddModal v-model="showBulkAddModal" @success="handleSuccess" />

    <!-- Context Menu -->
    <ContextMenu
      v-model:visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="contextMenuItems"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMasksStore } from '@/stores/masks'
import { useToastStore } from '@/stores/toast'
import { useKeyboard } from '@/composables/useKeyboard'
import { useDebounce } from '@/composables/useDebounce'
import AppLayout from '@/components/common/AppLayout.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import ContextMenu from '@/components/common/ContextMenu.vue'
import MaskModal from '@/components/masks/MaskModal.vue'
import GenerationsModal from '@/components/masks/GenerationsModal.vue'
import BulkAddModal from '@/components/masks/BulkAddModal.vue'
import { printMaskLabel } from '@/utils/print'

const masksStore = useMasksStore()
const toast = useToastStore()

const searchQuery = ref('')
const debouncedSearch = useDebounce(searchQuery, 300)
const filterModel = ref('')
const filterSize = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const showMaskModal = ref(false)
const showGenerationsModal = ref(false)
const showBulkAddModal = ref(false)
const editingMask = ref(null)

const selectedIds = ref([])
const selectAll = ref(false)

const contextMenu = ref({ visible: false, x: 0, y: 0, mask: null })

onMounted(() => {
  masksStore.init()
})

// Keyboard shortcuts
useKeyboard({
  'ctrl+n': () => openCreate(),
  'ctrl+f': (e) => {
    e.preventDefault()
    document.querySelector('input[type="text"]')?.focus()
  }
})

const filteredMasks = computed(() => {
  let result = masksStore.masks

  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase()
    result = result.filter(m =>
      m.serial.toLowerCase().includes(query) ||
      (m.notes && m.notes.toLowerCase().includes(query))
    )
  }

  if (filterModel.value) {
    result = result.filter(m => m.model === filterModel.value)
  }

  if (filterSize.value) {
    result = result.filter(m => m.size === filterSize.value)
  }

  return result.sort((a, b) => (b.globalSeq || 0) - (a.globalSeq || 0))
})

const totalPages = computed(() => Math.ceil(filteredMasks.value.length / pageSize.value))

const paginatedMasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredMasks.value.slice(start, start + pageSize.value)
})

const getModelBadgeClass = (model) => {
  const classes = {
    'Рапира': 'badge-success',
    'Шпага': 'badge-danger',
    'Сабля': 'badge-warning',
    'Тренер': 'badge-primary'
  }
  return classes[model] || 'badge-primary'
}

const openCreate = () => {
  editingMask.value = null
  showMaskModal.value = true
}

const openEdit = (mask) => {
  editingMask.value = mask
  showMaskModal.value = true
}

const openBulkAdd = () => {
  showBulkAddModal.value = true
}

const printLabel = async (mask) => {
  try {
    await printMaskLabel(mask)
  } catch (error) {
    toast.error('Ошибка печати этикетки')
  }
}

const deleteMask = async (mask) => {
  if (confirm(`Удалить маску ${mask.serial}?`)) {
    try {
      await masksStore.deleteMask(mask.id)
    } catch (error) {
      // Error handled in store
    }
  }
}

const handleSuccess = () => {
  clearSelection()
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = paginatedMasks.value.map(m => m.id)
  } else {
    selectedIds.value = []
  }
}

const clearSelection = () => {
  selectedIds.value = []
  selectAll.value = false
}

const bulkPrint = async () => {
  const masks = masksStore.masks.filter(m => selectedIds.value.includes(m.id))
  for (const mask of masks) {
    await printLabel(mask)
  }
  clearSelection()
}

const bulkDelete = async () => {
  if (confirm(`Удалить выбранные маски (${selectedIds.value.length})?`)) {
    try {
      await masksStore.bulkDeleteMasks(selectedIds.value)
      clearSelection()
    } catch (error) {
      // Error handled in store
    }
  }
}

const openContextMenu = (event, mask) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    mask
  }
}

const contextMenuItems = computed(() => {
  if (!contextMenu.value.mask) return []
  
  const mask = contextMenu.value.mask
  
  return [
    {
      label: 'Редактировать',
      action: () => openEdit(mask)
    },
    {
      label: 'Печать этикетки',
      action: () => printLabel(mask)
    },
    { divider: true },
    {
      label: 'Удалить',
      danger: true,
      action: () => deleteMask(mask)
    }
  ]
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(-50%);
}
</style>

