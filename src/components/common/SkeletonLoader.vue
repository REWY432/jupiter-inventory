<template>
  <div
    :class="[
      'animate-pulse bg-gray-200 dark:bg-gray-700',
      roundedClass,
      customClass
    ]"
    :style="{ width, height }"
    role="status"
    aria-label="Загрузка..."
  >
    <span class="sr-only">Загрузка...</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1rem'
  },
  rounded: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'full'].includes(value)
  },
  customClass: {
    type: String,
    default: ''
  }
})

const roundedClass = computed(() => {
  const roundedMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }
  return roundedMap[props.rounded]
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

