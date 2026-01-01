import { ref, computed } from 'vue'

export function useValidation() {
  const errors = ref({})

  const rules = {
    required: (value, fieldName = 'Поле') => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} обязательно для заполнения`
      }
      return null
    },

    minLength: (min) => (value, fieldName = 'Поле') => {
      if (value && value.length < min) {
        return `${fieldName} должно содержать минимум ${min} символов`
      }
      return null
    },

    maxLength: (max) => (value, fieldName = 'Поле') => {
      if (value && value.length > max) {
        return `${fieldName} должно содержать максимум ${max} символов`
      }
      return null
    },

    email: (value, fieldName = 'Email') => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (value && !emailRegex.test(value)) {
        return `${fieldName} должен быть корректным email адресом`
      }
      return null
    },

    number: (value, fieldName = 'Поле') => {
      if (value && isNaN(Number(value))) {
        return `${fieldName} должно быть числом`
      }
      return null
    },

    min: (min) => (value, fieldName = 'Поле') => {
      if (value && Number(value) < min) {
        return `${fieldName} должно быть не меньше ${min}`
      }
      return null
    },

    max: (max) => (value, fieldName = 'Поле') => {
      if (value && Number(value) > max) {
        return `${fieldName} должно быть не больше ${max}`
      }
      return null
    },

    pattern: (pattern, message) => (value) => {
      if (value && !pattern.test(value)) {
        return message || 'Неверный формат'
      }
      return null
    },

    custom: (validator) => (value, fieldName) => {
      return validator(value, fieldName)
    }
  }

  const validate = (value, validationRules, fieldName) => {
    for (const rule of validationRules) {
      const error = rule(value, fieldName)
      if (error) {
        return error
      }
    }
    return null
  }

  const validateField = (fieldName, value, validationRules) => {
    const error = validate(value, validationRules, fieldName)
    if (error) {
      errors.value[fieldName] = error
    } else {
      delete errors.value[fieldName]
    }
    return !error
  }

  const validateForm = (formData, validationSchema) => {
    errors.value = {}
    let isValid = true

    for (const [fieldName, validationRules] of Object.entries(validationSchema)) {
      const value = formData[fieldName]
      const error = validate(value, validationRules, fieldName)
      if (error) {
        errors.value[fieldName] = error
        isValid = false
      }
    }

    return isValid
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const clearError = (fieldName) => {
    delete errors.value[fieldName]
  }

  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  return {
    errors,
    rules,
    validate,
    validateField,
    validateForm,
    clearErrors,
    clearError,
    hasErrors
  }
}

