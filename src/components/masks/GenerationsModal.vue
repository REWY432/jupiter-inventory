<template>
  <BaseModal
    v-model="isOpen"
    title="Справочник поколений"
    size="lg"
    hide-footer
    @close="handleClose"
  >
    <div class="space-y-4">
      <!-- Add New Generation -->
      <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Добавить поколение
        </h4>
        <div class="flex gap-2">
          <input
            v-model="newGeneration.code"
            type="text"
            placeholder="Код (например: A)"
            class="input flex-1"
            maxlength="5"
          />
          <input
            v-model="newGeneration.name"
            type="text"
            placeholder="Название"
            class="input flex-1"
          />
          <button
            @click="addGeneration"
            :disabled="!newGeneration.code || !newGeneration.name"
            class="btn-primary whitespace-nowrap"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Generations List -->
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="generation in sortedGenerations"
          :key="generation.id"
          class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
        >
          <div v-if="editingId !== generation.id" class="flex items-center gap-3 flex-1">
            <span class="text-lg font-mono font-bold text-primary-600 dark:text-primary-400">
              {{ generation.code }}
            </span>
            <span class="text-gray-700 dark:text-gray-300">
              {{ generation.name }}
            </span>
          </div>

          <div v-else class="flex gap-2 flex-1">
            <input
              v-model="editForm.code"
              type="text"
              class="input flex-1"
              maxlength="5"
            />
            <input
              v-model="editForm.name"
              type="text"
              class="input flex-1"
            />
          </div>

          <div class="flex items-center gap-2">
            <template v-if="editingId !== generation.id">
              <button
                @click="startEdit(generation)"
                class="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400"
                title="Редактировать"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteGeneration(generation.id)"
                class="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                title="Удалить"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </template>
            <template v-else>
              <button
                @click="saveEdit"
                class="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                title="Сохранить"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                @click="cancelEdit"
                class="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400"
                title="Отмена"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </template>
          </div>
        </div>

        <div v-if="sortedGenerations.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          Нет поколений. Добавьте первое поколение выше.
        </div>
      </div>

      <!-- Close Button -->
      <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button @click="handleClose" class="btn-primary">
          Закрыть
        </button>
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

const emit = defineEmits(['update:modelValue'])

const masksStore = useMasksStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const newGeneration = ref({
  code: '',
  name: ''
})

const editingId = ref(null)
const editForm = ref({
  code: '',
  name: ''
})

const sortedGenerations = computed(() => {
  return [...masksStore.generations].sort((a, b) => 
    (a.code || '').localeCompare(b.code || '')
  )
})

const addGeneration = async () => {
  if (!newGeneration.value.code || !newGeneration.value.name) return

  try {
    await masksStore.addGeneration({
      code: newGeneration.value.code.trim(),
      name: newGeneration.value.name.trim()
    })
    newGeneration.value = { code: '', name: '' }
  } catch (error) {
    console.error('Error adding generation:', error)
  }
}

const startEdit = (generation) => {
  editingId.value = generation.id
  editForm.value = {
    code: generation.code,
    name: generation.name
  }
}

const saveEdit = async () => {
  if (!editForm.value.code || !editForm.value.name) return

  try {
    await masksStore.updateGeneration(editingId.value, {
      code: editForm.value.code.trim(),
      name: editForm.value.name.trim()
    })
    cancelEdit()
  } catch (error) {
    console.error('Error updating generation:', error)
  }
}

const cancelEdit = () => {
  editingId.value = null
  editForm.value = { code: '', name: '' }
}

const deleteGeneration = async (id) => {
  if (!confirm('Удалить это поколение?')) return

  try {
    await masksStore.deleteGeneration(id)
  } catch (error) {
    console.error('Error deleting generation:', error)
  }
}

const handleClose = () => {
  cancelEdit()
  isOpen.value = false
}
</script>

