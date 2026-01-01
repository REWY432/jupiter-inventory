<template>
  <nav class="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
    <router-link
      to="/"
      class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      aria-label="Главная"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </router-link>

    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <svg class="w-5 h-5 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>

      <router-link
        v-if="crumb.to && index < breadcrumbs.length - 1"
        :to="crumb.to"
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        {{ crumb.label }}
      </router-link>

      <span
        v-else
        class="text-gray-900 dark:text-white font-medium"
        :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined"
      >
        {{ crumb.label }}
      </span>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    default: null
  }
})

const route = useRoute()

const breadcrumbs = computed(() => {
  if (props.items) {
    return props.items
  }

  // Auto-generate from route
  const crumbs = []
  const pathArray = route.path.split('/').filter(p => p)

  const routeMap = {
    'masks': { label: 'Маски', to: '/masks' },
    'spools': { label: 'Катушки', to: '/spools' },
    'dashboard': { label: 'Дашборд', to: '/dashboard' }
  }

  pathArray.forEach((path, index) => {
    const mapped = routeMap[path]
    if (mapped) {
      crumbs.push(mapped)
    } else {
      crumbs.push({
        label: path.charAt(0).toUpperCase() + path.slice(1),
        to: '/' + pathArray.slice(0, index + 1).join('/')
      })
    }
  })

  return crumbs
})
</script>

