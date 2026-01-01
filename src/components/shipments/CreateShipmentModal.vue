<template>
  <BaseModal
    v-model="isOpen"
    title="Создать отгрузку"
    size="lg"
    :confirm-disabled="hasErrors || isSubmitting"
    confirm-text="Создать"
    @confirm="handleSubmit"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Customer Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Получатель *
        </label>
        <input
          v-model="formData.customerName"
          @blur="validateField('customerName')"
          type="text"
          class="input"
          :class="{ 'border-red-500': errors.customerName }"
          placeholder="Название компании или ФИО"
          required
        />
        <p v-if="errors.customerName" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.customerName }}
        </p>
      </div>

      <!-- Contact Info -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Телефон
          </label>
          <input
            v-model="formData.contactPhone"
            type="tel"
            class="input"
            placeholder="+7 (999) 123-45-67"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            v-model="formData.contactEmail"
            type="email"
            class="input"
            placeholder="email@example.com"
          />
        </div>
      </div>

      <!-- Shipping Address -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Адрес доставки
        </label>
        <textarea
          v-model="formData.shippingAddress"
          class="input"
          rows="2"
          placeholder="Полный адрес доставки"
        ></textarea>
      </div>

      <!-- Shipping Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Дата отгрузки *
        </label>
        <input
          v-model="formData.shippingDate"
          @blur="validateField('shippingDate')"
          type="date"
          class="input"
          :class="{ 'border-red-500': errors.shippingDate }"
          required
        />
        <p v-if="errors.shippingDate" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.shippingDate }}
        </p>
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
          placeholder="Дополнительная информация об отгрузке..."
        ></textarea>
      </div>

      <!-- Items Summary -->
      <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Товаров в отгрузке: <span class="font-bold text-primary-600">{{ shipmentsStore.bufferCount }}</span>
        </p>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useShipmentsStore } from '@/stores/shipments'
import { useToastStore } from '@/stores/toast'
import { useValidation } from '@/composables/useValidation'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'success'])

const shipmentsStore = useShipmentsStore()
const toast = useToastStore()
const { errors, rules, validateField: validateFieldFn, validateForm, clearErrors } = useValidation()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isSubmitting = ref(false)

const formData = ref({
  customerName: '',
  contactPhone: '',
  contactEmail: '',
  shippingAddress: '',
  shippingDate: new Date().toISOString().split('T')[0],
  notes: ''
})

const validationSchema = {
  customerName: [rules.required, rules.minLength(2)],
  shippingDate: [rules.required]
}

const validateField = (fieldName) => {
  validateFieldFn(fieldName, formData.value[fieldName], validationSchema[fieldName])
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

const handleSubmit = async () => {
  if (!validateForm(formData.value, validationSchema)) {
    toast.error('Заполните все обязательные поля')
    return
  }

  if (shipmentsStore.bufferCount === 0) {
    toast.error('Добавьте товары в буфер отгрузки')
    return
  }

  isSubmitting.value = true

  try {
    await shipmentsStore.createShipment(formData.value)
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Error creating shipment:', error)
    toast.error('Ошибка создания отгрузки: ' + (error.message || 'Неизвестная ошибка'))
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  clearErrors()
  formData.value = {
    customerName: '',
    contactPhone: '',
    contactEmail: '',
    shippingAddress: '',
    shippingDate: new Date().toISOString().split('T')[0],
    notes: ''
  }
  isOpen.value = false
}
</script>

