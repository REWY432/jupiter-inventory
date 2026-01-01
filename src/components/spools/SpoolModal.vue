<template>
  <BaseModal
    v-model="isOpen"
    :title="isEdit ? 'Редактировать катушку' : 'Добавить катушку'"
    size="lg"
    :confirm-disabled="hasErrors || isSubmitting"
    @confirm="handleSubmit"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Serial Number -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Серийный номер *
        </label>
        <input
          v-model="formData.serial"
          @blur="validateField('serial')"
          type="text"
          class="input"
          :class="{ 'border-red-500': errors.serial }"
          placeholder="Например: K-2024-001"
          required
        />
        <p v-if="errors.serial" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.serial }}
        </p>
      </div>

      <!-- Wire Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Тип провода *
        </label>
        <select
          v-model="formData.wireType"
          @change="validateField('wireType')"
          class="select"
          :class="{ 'border-red-500': errors.wireType }"
          required
        >
          <option value="">Выберите тип провода</option>
          <option value="Китайский">Китайский</option>
          <option value="Favero">Favero</option>
        </select>
        <p v-if="errors.wireType" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.wireType }}
        </p>
      </div>

      <!-- Model/Year -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Модель/Год *
        </label>
        <div class="flex gap-2">
          <select
            v-model="formData.spoolModel"
            @change="validateField('spoolModel')"
            class="select flex-1"
            :class="{ 'border-red-500': errors.spoolModel }"
            required
          >
            <option value="">Выберите модель</option>
            <option v-for="model in models" :key="model.year" :value="model.year">
              {{ model.year }}
            </option>
          </select>
          <button
            type="button"
            @click="$emit('open-models')"
            class="btn-ghost"
            title="Управление моделями"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <p v-if="errors.spoolModel" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.spoolModel }}
        </p>
      </div>

      <!-- Date -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Месяц *
          </label>
          <select
            v-model="formData.month"
            @change="validateField('month')"
            class="select"
            :class="{ 'border-red-500': errors.month }"
            required
          >
            <option value="">Месяц</option>
            <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
          </select>
          <p v-if="errors.month" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.month }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Год *
          </label>
          <select
            v-model="formData.year"
            @change="validateField('year')"
            class="select"
            :class="{ 'border-red-500': errors.year }"
            required
          >
            <option value="">Год</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <p v-if="errors.year" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.year }}
          </p>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Примечания
        </label>
        <textarea
          v-model="formData.notes"
          class="input"
          rows="3"
          placeholder="Дополнительная информация..."
        ></textarea>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSpoolsStore } from '@/stores/spools'
import { useValidation } from '@/composables/useValidation'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  spool: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'open-models'])

const spoolsStore = useSpoolsStore()
const { errors, rules, validateField: validateFieldFn, validateForm, clearErrors } = useValidation()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.spool)
const isSubmitting = ref(false)

const formData = ref({
  serial: '',
  wireType: '',
  spoolModel: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  notes: ''
})

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - i)
})

const models = computed(() => spoolsStore.settings.models || [])

const validationSchema = {
  serial: [
    rules.required,
    rules.minLength(3),
    rules.custom((value) => {
      if (spoolsStore.checkSerialExists(value, props.spool?.id)) {
        return 'Серийный номер уже существует'
      }
      return null
    })
  ],
  wireType: [rules.required],
  spoolModel: [rules.required],
  month: [rules.required, rules.number, rules.min(1), rules.max(12)],
  year: [rules.required, rules.number]
}

const validateField = (fieldName) => {
  validateFieldFn(fieldName, formData.value[fieldName], validationSchema[fieldName])
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

const handleSubmit = async () => {
  if (!validateForm(formData.value, validationSchema)) {
    return
  }

  isSubmitting.value = true

  try {
    const data = {
      ...formData.value,
      globalSeq: props.spool?.globalSeq || spoolsStore.getNextSeq()
    }

    if (isEdit.value) {
      await spoolsStore.updateSpool(props.spool.id, data)
    } else {
      await spoolsStore.addSpool(data)
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Error saving spool:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  clearErrors()
  isOpen.value = false
}

watch(() => props.spool, (spool) => {
  if (spool) {
    formData.value = {
      serial: spool.serial || '',
      wireType: spool.wireType || '',
      spoolModel: spool.spoolModel || '',
      month: spool.month || new Date().getMonth() + 1,
      year: spool.year || new Date().getFullYear(),
      notes: spool.notes || ''
    }
  } else {
    formData.value = {
      serial: '',
      wireType: '',
      spoolModel: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      notes: ''
    }
  }
  clearErrors()
}, { immediate: true })
</script>

