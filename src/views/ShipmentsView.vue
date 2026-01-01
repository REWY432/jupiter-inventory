<template>
  <AppLayout>
    <div class="p-4 lg:p-8 space-y-6">
      <Breadcrumbs />

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Отгрузки</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Управление отгрузками и складом</p>
        </div>
        <div class="flex gap-2">
          <button @click="openBuffer" class="btn-ghost relative">
            <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Буфер
            <span v-if="shipmentsStore.bufferCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {{ shipmentsStore.bufferCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="!shipmentsStore.isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card p-4 border-l-4 border-primary-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Всего отгрузок</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ shipmentsStore.totalShipments }}</div>
        </div>
        <div class="card p-4 border-l-4 border-amber-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">В ожидании</div>
          <div class="text-2xl font-bold text-amber-600 mt-1">{{ shipmentsStore.pendingShipments }}</div>
        </div>
        <div class="card p-4 border-l-4 border-green-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Завершено</div>
          <div class="text-2xl font-bold text-green-600 mt-1">{{ shipmentsStore.completedShipments }}</div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonLoader v-for="i in 3" :key="i" height="100px" rounded="lg" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Filters Sidebar -->
        <div class="lg:col-span-1">
          <AdvancedFilters
            v-model:search-query="filters.searchQuery"
            v-model:date-range="filters.dateRange"
            v-model:selected-statuses="filters.selectedStatuses"
            :status-options="statusOptions"
            :saved-presets="filters.savedPresets"
            :active-filters-count="filters.activeFiltersCount"
            @clear="filters.clearFilters"
            @save-preset="filters.savePreset"
            @apply-preset="filters.applyPreset"
            @delete-preset="filters.deletePreset"
          />
        </div>

        <!-- Shipments List -->
        <div class="lg:col-span-3 space-y-4">
          <!-- Loading -->
          <div v-if="shipmentsStore.isLoading" class="space-y-3">
            <SkeletonLoader v-for="i in 5" :key="i" height="120px" rounded="lg" />
          </div>

          <!-- Shipments -->
          <div v-else-if="pagination.paginatedItems.length > 0" class="space-y-3">
            <div
              v-for="shipment in pagination.paginatedItems"
              :key="shipment.id"
              class="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
              @click="openShipmentDetails(shipment)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ shipment.customerName }}
                    </h3>
                    <span :class="['badge', getStatusBadgeClass(shipment.status)]">
                      {{ shipmentsStore.STATUS_LABELS[shipment.status] }}
                    </span>
                  </div>
                  
                  <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p v-if="shipment.shippingAddress">
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ shipment.shippingAddress }}
                    </p>
                    <p>
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(shipment.shippingDate) }}
                    </p>
                    <p>
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      Товаров: {{ shipment.itemsCount }}
                    </p>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <button
                    @click.stop="changeStatus(shipment)"
                    class="btn-ghost text-xs"
                    title="Изменить статус"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    @click.stop="deleteShipment(shipment)"
                    class="text-red-600 hover:text-red-900"
                    title="Удалить"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="card p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Нет отгрузок</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ filters.activeFiltersCount > 0 ? 'Попробуйте изменить фильтры' : 'Добавьте товары в буфер для создания отгрузки' }}
            </p>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.paginatedItems.length > 0" class="card p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700 dark:text-gray-300">
                Показано {{ pagination.startIndex }} - {{ pagination.endIndex }} из {{ filters.filteredItems.length }}
              </div>
              <div class="flex items-center gap-2">
                <select v-model="pagination.pageSize" @change="pagination.changePageSize(pagination.pageSize)" class="select text-sm">
                  <option v-for="size in pagination.pageSizes" :key="size" :value="size">{{ size }} на странице</option>
                </select>
                <button @click="pagination.prevPage" :disabled="!pagination.hasPrevPage" class="btn-ghost disabled:opacity-50">Назад</button>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ pagination.currentPage }} / {{ pagination.totalPages }}</span>
                <button @click="pagination.nextPage" :disabled="!pagination.hasNextPage" class="btn-ghost disabled:opacity-50">Вперед</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ShipmentBufferModal v-model="showBufferModal" @success="handleSuccess" />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useShipmentsStore } from '@/stores/shipments'
import { useAdvancedFilters } from '@/composables/useAdvancedFilters'
import { usePagination } from '@/composables/usePagination'
import AppLayout from '@/components/common/AppLayout.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import AdvancedFilters from '@/components/common/AdvancedFilters.vue'
import ShipmentBufferModal from '@/components/shipments/ShipmentBufferModal.vue'

const shipmentsStore = useShipmentsStore()

const showBufferModal = ref(false)

const statusOptions = [
  { value: 'pending', label: 'Ожидает' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'completed', label: 'Завершена' },
  { value: 'cancelled', label: 'Отменена' }
]

onMounted(() => {
  shipmentsStore.init()
})

// Advanced filters
const filters = useAdvancedFilters(computed(() => shipmentsStore.shipments), {
  searchFields: ['customerName', 'shippingAddress', 'notes'],
  dateField: 'shippingDate',
  statusField: 'status'
})

// Pagination
const pagination = usePagination(filters.filteredItems, {
  pageSize: 10,
  pageSizes: [10, 20, 50]
})

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-warning',
    in_progress: 'badge-primary',
    completed: 'badge-success',
    cancelled: 'badge-danger'
  }
  return classes[status] || 'badge-primary'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU')
}

const openBuffer = () => {
  showBufferModal.value = true
}

const openShipmentDetails = (shipment) => {
  // TODO: Open shipment details modal
  console.log('Open shipment:', shipment)
}

const changeStatus = (shipment) => {
  // TODO: Open status change modal or dropdown
  const statuses = Object.keys(shipmentsStore.STATUSES)
  const currentIndex = statuses.indexOf(shipment.status)
  const nextIndex = (currentIndex + 1) % statuses.length
  const nextStatus = statuses[nextIndex]
  
  shipmentsStore.changeStatus(shipment.id, nextStatus)
}

const deleteShipment = async (shipment) => {
  if (confirm(`Удалить отгрузку для "${shipment.customerName}"?`)) {
    await shipmentsStore.deleteShipment(shipment.id)
  }
}

const handleSuccess = () => {
  // Refresh or do something after success
}
</script>

