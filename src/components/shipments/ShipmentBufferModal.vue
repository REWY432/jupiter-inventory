<template>
  <BaseModal
    v-model="isOpen"
    title="Буфер отгрузки"
    size="xl"
    hide-footer
    @close="handleClose"
  >
    <div class="space-y-4">
      <!-- Header Stats -->
      <div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-primary-600 dark:text-primary-400 font-medium">Товаров в буфере</p>
            <p class="text-3xl font-bold text-primary-700 dark:text-primary-300 mt-1">{{ shipmentsStore.bufferCount }}</p>
          </div>
          <button
            v-if="shipmentsStore.bufferCount > 0"
            @click="createShipment"
            class="btn-primary"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Создать отгрузку
          </button>
        </div>
      </div>

      <!-- Buffer Items -->
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="(item, index) in shipmentsStore.buffer"
          :key="index"
          class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors"
        >
          <div class="flex items-center gap-4 flex-1">
            <div :class="['p-2 rounded-lg', item.type === 'mask' ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-secondary-100 dark:bg-secondary-900/30']">
              <svg class="w-6 h-6" :class="item.type === 'mask' ? 'text-primary-600' : 'text-secondary-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-mono font-bold text-gray-900 dark:text-white">{{ item.serial }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ item.model || item.wireType }} 
                <span v-if="item.size">• {{ item.size }}</span>
              </p>
            </div>
            <span class="text-xs text-gray-500">{{ formatDate(item.addedAt) }}</span>
          </div>
          <button
            @click="removeItem(index)"
            class="text-red-600 hover:text-red-900 dark:hover:text-red-400 ml-4"
            title="Удалить"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="shipmentsStore.bufferCount === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Буфер пуст</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Добавьте товары для отгрузки</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          v-if="shipmentsStore.bufferCount > 0"
          @click="clearBuffer"
          class="btn-danger"
        >
          Очистить буфер
        </button>
        <button @click="handleClose" class="btn-ghost ml-auto">Закрыть</button>
      </div>
    </div>

    <!-- Create Shipment Modal -->
    <CreateShipmentModal
      v-model="showCreateModal"
      @success="handleShipmentCreated"
    />
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useShipmentsStore } from '@/stores/shipments'
import BaseModal from '@/components/common/BaseModal.vue'
import CreateShipmentModal from './CreateShipmentModal.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'success'])

const shipmentsStore = useShipmentsStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showCreateModal = ref(false)

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const removeItem = (index) => {
  shipmentsStore.removeFromBuffer(index)
}

const clearBuffer = () => {
  if (confirm('Очистить весь буфер отгрузки?')) {
    shipmentsStore.clearBuffer()
  }
}

const createShipment = () => {
  showCreateModal.value = true
}

const handleShipmentCreated = () => {
  showCreateModal.value = false
  emit('success')
  handleClose()
}

const handleClose = () => {
  isOpen.value = false
}
</script>

