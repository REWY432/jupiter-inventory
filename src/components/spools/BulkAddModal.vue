<template>
  <BaseModal
    v-model="isOpen"
    title="Массовое добавление катушек"
    size="xl"
    :confirm-disabled="items.length === 0 || isSubmitting"
    confirm-text="Добавить все"
    @confirm="handleSubmit"
    @close="handleClose"
  >
    <div class="space-y-4">
      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 class="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Инструкция</h4>
        <ul class="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Заполните форму и нажмите "Добавить в список"</li>
          <li>• Можно добавить несколько катушек с разными параметрами</li>
          <li>• Проверьте список и нажмите "Добавить все"</li>
        </ul>
      </div>

      <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Серийный номер</label>
            <input v-model="formData.serial" type="text" class="input" placeholder="K-2024-001" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип провода</label>
            <select v-model="formData.wireType" class="select">
              <option value="">Выберите тип</option>
              <option value="Китайский">Китайский</option>
              <option value="Favero">Favero</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Модель</label>
            <select v-model="formData.spoolModel" class="select">
              <option value="">Выберите модель</option>
              <option v-for="model in models" :key="model.year" :value="model.year">{{ model.year }}</option>
            </select>
          </div>
        </div>
        <button @click="addToList" :disabled="!canAddToList" class="btn-primary w-full">Добавить в список</button>
      </div>

      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div v-for="(item, index) in items" :key="index"
          class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex items-center gap-4 flex-1">
            <span class="text-sm font-mono font-bold">{{ item.serial }}</span>
            <span :class="['badge', item.wireType === 'Favero' ? 'badge-secondary' : 'badge-primary']">{{ item.wireType }}</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.spoolModel }}</span>
          </div>
          <button @click="removeFromList(index)" class="text-red-600 hover:text-red-900">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="items.length === 0" class="text-center py-8 text-gray-500">Список пуст</div>
      </div>

      <div v-if="items.length > 0" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p class="text-sm font-medium text-green-900 dark:text-green-300">Будет добавлено катушек: {{ items.length }}</p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSpoolsStore } from '@/stores/spools'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'success'])

const spoolsStore = useSpoolsStore()
const isOpen = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })

const isSubmitting = ref(false)
const items = ref([])
const formData = ref({ serial: '', wireType: '', spoolModel: '' })

const models = computed(() => spoolsStore.settings.models || [])
const canAddToList = computed(() => formData.value.serial && formData.value.wireType && formData.value.spoolModel)

const addToList = () => {
  if (!canAddToList.value) return
  items.value.push({ ...formData.value, month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  formData.value = { serial: '', wireType: '', spoolModel: '' }
}

const removeFromList = (index) => items.value.splice(index, 1)

const handleSubmit = async () => {
  if (items.value.length === 0) return
  isSubmitting.value = true
  try {
    let seq = spoolsStore.getNextSeq()
    for (const item of items.value) {
      await spoolsStore.addSpool({ ...item, globalSeq: seq++ })
    }
    emit('success')
    handleClose()
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  items.value = []
  formData.value = { serial: '', wireType: '', spoolModel: '' }
  isOpen.value = false
}
</script>

