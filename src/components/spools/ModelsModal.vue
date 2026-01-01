<template>
  <BaseModal
    v-model="isOpen"
    title="Настройки моделей"
    size="lg"
    hide-footer
    @close="handleClose"
  >
    <div class="space-y-4">
      <!-- Add New Model -->
      <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Добавить модель
        </h4>
        <div class="flex gap-2">
          <input
            v-model="newModel.year"
            type="text"
            placeholder="Год (например: 2024)"
            class="input flex-1"
            maxlength="4"
          />
          <input
            v-model="newModel.ean"
            type="text"
            placeholder="EAN-13 код"
            class="input flex-1"
            maxlength="13"
          />
          <button
            @click="addModel"
            :disabled="!newModel.year || !newModel.ean"
            class="btn-primary whitespace-nowrap"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Models List -->
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="(model, index) in models"
          :key="index"
          class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div v-if="editingIndex !== index" class="flex items-center gap-4 flex-1">
            <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
              {{ model.year }}
            </span>
            <span class="text-sm font-mono text-gray-700 dark:text-gray-300">
              EAN: {{ model.ean }}
            </span>
          </div>

          <div v-else class="flex gap-2 flex-1">
            <input
              v-model="editForm.year"
              type="text"
              class="input flex-1"
              maxlength="4"
            />
            <input
              v-model="editForm.ean"
              type="text"
              class="input flex-1"
              maxlength="13"
            />
          </div>

          <div class="flex items-center gap-2">
            <template v-if="editingIndex !== index">
              <button
                @click="startEdit(model, index)"
                class="text-primary-600 hover:text-primary-900"
                title="Редактировать"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteModel(index)"
                class="text-red-600 hover:text-red-900"
                title="Удалить"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </template>
            <template v-else>
              <button @click="saveEdit" class="text-green-600 hover:text-green-900" title="Сохранить">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button @click="cancelEdit" class="text-gray-600 hover:text-gray-900" title="Отмена">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </template>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button @click="handleClose" class="btn-primary">Закрыть</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSpoolsStore } from '@/stores/spools'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const spoolsStore = useSpoolsStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const newModel = ref({ year: '', ean: '' })
const editingIndex = ref(null)
const editForm = ref({ year: '', ean: '' })

const models = computed(() => spoolsStore.settings.models || [])

const addModel = async () => {
  if (!newModel.value.year || !newModel.value.ean) return

  const updatedModels = [...models.value, { ...newModel.value }]
  await spoolsStore.updateSettings({ models: updatedModels })
  newModel.value = { year: '', ean: '' }
}

const startEdit = (model, index) => {
  editingIndex.value = index
  editForm.value = { ...model }
}

const saveEdit = async () => {
  const updatedModels = [...models.value]
  updatedModels[editingIndex.value] = { ...editForm.value }
  await spoolsStore.updateSettings({ models: updatedModels })
  cancelEdit()
}

const cancelEdit = () => {
  editingIndex.value = null
  editForm.value = { year: '', ean: '' }
}

const deleteModel = async (index) => {
  if (!confirm('Удалить эту модель?')) return
  const updatedModels = models.value.filter((_, i) => i !== index)
  await spoolsStore.updateSettings({ models: updatedModels })
}

const handleClose = () => {
  cancelEdit()
  isOpen.value = false
}
</script>

