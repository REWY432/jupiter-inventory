<template>
  <BaseModal
    v-model="isOpen"
    title="Массовое добавление масок"
    size="xl"
    :confirm-disabled="items.length === 0 || isSubmitting"
    confirm-text="Добавить все"
    @confirm="handleSubmit"
    @close="handleClose"
  >
    <div class="space-y-4">
      <!-- Instructions -->
      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 class="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          Инструкция
        </h4>
        <ul class="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Заполните форму и нажмите "Добавить в список"</li>
          <li>• Можно добавить несколько масок с разными параметрами</li>
          <li>• Проверьте список и нажмите "Добавить все"</li>
        </ul>
      </div>

      <!-- Form -->
      <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Серийный номер
            </label>
            <input
              v-model="formData.serial"
              type="text"
              class="input"
              placeholder="A-105"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Модель
            </label>
            <select v-model="formData.model" class="select">
              <option value="">Выберите модель</option>
              <option value="Рапира">Рапира</option>
              <option value="Шпага">Шпага</option>
              <option value="Сабля">Сабля</option>
              <option value="Тренер">Тренер</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Размер
            </label>
            <select v-model="formData.size" class="select">
              <option value="">Выберите размер</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Поколение
            </label>
            <select v-model="formData.generation" class="select">
              <option value="">Выберите поколение</option>
              <option v-for="gen in generations" :key="gen.id" :value="gen.code">
                {{ gen.code }} - {{ gen.name }}
              </option>
            </select>
          </div>
        </div>
        <button
          @click="addToList"
          :disabled="!canAddToList"
          class="btn-primary w-full"
        >
          Добавить в список
        </button>
      </div>

      <!-- Items List -->
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center gap-4 flex-1">
            <span class="text-sm font-mono font-bold text-gray-900 dark:text-white">
              {{ item.serial }}
            </span>
            <span :class="['badge', getModelBadgeClass(item.model)]">
              {{ item.model }}
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ item.size }}
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ item.generation }}
            </span>
          </div>
          <button
            @click="removeFromList(index)"
            class="text-red-600 hover:text-red-900 dark:hover:text-red-400"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="items.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          Список пуст. Добавьте маски используя форму выше.
        </div>
      </div>

      <!-- Summary -->
      <div v-if="items.length > 0" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p class="text-sm font-medium text-green-900 dark:text-green-300">
          Будет добавлено масок: {{ items.length }}
        </p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMasksStore } from '@/stores/masks'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const masksStore = useMasksStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isSubmitting = ref(false)
const items = ref([])

const formData = ref({
  serial: '',
  model: '',
  size: '',
  generation: ''
})

const generations = computed(() => masksStore.generations)

const canAddToList = computed(() => {
  return formData.value.serial &&
         formData.value.model &&
         formData.value.size &&
         formData.value.generation
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

const addToList = () => {
  if (!canAddToList.value) return

  items.value.push({
    ...formData.value,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  // Reset form
  formData.value = {
    serial: '',
    model: '',
    size: '',
    generation: ''
  }
}

const removeFromList = (index) => {
  items.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (items.value.length === 0) return

  isSubmitting.value = true

  try {
    let seq = masksStore.getNextSeq()
    
    for (const item of items.value) {
      await masksStore.addMask({
        ...item,
        globalSeq: seq++
      })
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Error bulk adding masks:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  items.value = []
  formData.value = {
    serial: '',
    model: '',
    size: '',
    generation: ''
  }
  isOpen.value = false
}
</script>

