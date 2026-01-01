<template>
  <AppLayout>
    <div class="p-4 lg:p-8 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Катушки</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Учет катушек-сматывателей</p>
        </div>
        <button @click="openCreate" class="btn-primary">
          <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Добавить
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="card p-4 border-l-4 border-green-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Всего</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {{ spoolsStore.totalCount }}
          </div>
        </div>
        <div class="card p-4 border-l-4 border-primary-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Китайский</div>
          <div class="text-2xl font-bold text-primary-600 mt-1">
            {{ spoolsStore.chineseCount }}
          </div>
        </div>
        <div class="card p-4 border-l-4 border-secondary-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Favero</div>
          <div class="text-2xl font-bold text-secondary-600 mt-1">
            {{ spoolsStore.faveroCount }}
          </div>
        </div>
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
          <select v-model="filterWire" class="select lg:w-48">
            <option value="">Все провода</option>
            <option value="Китайский">Китайский</option>
            <option value="Favero">Favero</option>
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
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  №
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Серийный номер
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Провод
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Модель/Год
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              <tr
                v-for="spool in paginatedSpools"
                :key="spool.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  #{{ spool.globalSeq }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-mono font-bold text-gray-900 dark:text-white">
                    {{ spool.serial }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['badge', getWireBadgeClass(getWireType(spool))]">
                    {{ getWireType(spool) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ spool.spoolModel || '2024' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ spool.month }}.{{ spool.year }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openEdit(spool)"
                      class="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400"
                      title="Редактировать"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="printLabel(spool)"
                      class="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400"
                      title="Печать этикетки"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                    <button
                      @click="printPassport(spool)"
                      class="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                      title="Печать паспорта"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      @click="deleteSpool(spool)"
                      class="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      title="Удалить"
                    >
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
        <div v-if="filteredSpools.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Нет катушек</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Начните с добавления первой катушки</p>
          <div class="mt-6">
            <button @click="openCreate" class="btn-primary">
              <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Добавить катушку
            </button>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="filteredSpools.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Показано <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> -
            <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredSpools.length) }}</span> из
            <span class="font-medium">{{ filteredSpools.length }}</span>
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="btn-ghost disabled:opacity-50"
            >
              Назад
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="btn-ghost disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSpoolsStore } from '@/stores/spools'
import { useToastStore } from '@/stores/toast'
import AppLayout from '@/components/common/AppLayout.vue'
import { printSpoolLabel, printSpoolPassport } from '@/utils/print'

const spoolsStore = useSpoolsStore()
const toast = useToastStore()

const searchQuery = ref('')
const filterWire = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

onMounted(() => {
  spoolsStore.init()
})

const getWireType = (spool) => {
  let wire = spool.wireType
  if (!wire && spool.model) {
    wire = spool.model.includes('У') ? 'Favero' : 'Китайский'
  }
  if (wire === 'Стандарт') wire = 'Китайский'
  if (wire === 'У') wire = 'Favero'
  return wire || 'Китайский'
}

const filteredSpools = computed(() => {
  let result = spoolsStore.spools
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.serial.toLowerCase().includes(query) ||
      (s.notes && s.notes.toLowerCase().includes(query))
    )
  }
  
  if (filterWire.value) {
    result = result.filter(s => getWireType(s) === filterWire.value)
  }
  
  return result.sort((a, b) => (b.globalSeq || 0) - (a.globalSeq || 0))
})

const totalPages = computed(() => Math.ceil(filteredSpools.value.length / pageSize.value))

const paginatedSpools = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredSpools.value.slice(start, start + pageSize.value)
})

const getWireBadgeClass = (wire) => {
  return wire === 'Favero' ? 'badge-secondary' : 'badge-primary'
}

const openCreate = () => {
  toast.info('Форма создания в разработке')
}

const openEdit = (spool) => {
  toast.info('Форма редактирования в разработке')
}

const openBulkAdd = () => {
  toast.info('Массовое добавление в разработке')
}

const printLabel = async (spool) => {
  try {
    const model = spoolsStore.settings.models.find(m => m.year === spool.spoolModel)
    const eanCode = model ? model.ean : ''
    await printSpoolLabel(spool, eanCode)
  } catch (error) {
    toast.error('Ошибка печати этикетки')
  }
}

const printPassport = async (spool) => {
  try {
    await printSpoolPassport(spool, monthNames)
  } catch (error) {
    toast.error('Ошибка печати паспорта')
  }
}

const deleteSpool = async (spool) => {
  if (confirm(`Удалить катушку ${spool.serial}?`)) {
    try {
      await spoolsStore.deleteSpool(spool.id)
    } catch (error) {
      // Error handled in store
    }
  }
}
</script>

