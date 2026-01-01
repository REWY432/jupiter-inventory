<template>
  <div class="min-h-screen flex flex-col">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-50">
      <div class="flex flex-col flex-grow glass-strong border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900 dark:text-white">ООО "Юпитер"</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Система учета</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            v-slot="{ isActive }"
          >
            <div
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span class="font-medium">{{ item.label }}</span>
              <span
                v-if="item.badge"
                :class="[
                  'ml-auto px-2 py-0.5 rounded-full text-xs font-bold',
                  isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                ]"
              >
                {{ item.badge }}
              </span>
            </div>
          </RouterLink>
        </nav>

        <!-- Footer Actions -->
        <div class="px-4 py-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button
            @click="themeStore.toggleTheme"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <svg v-if="!themeStore.isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="font-medium">{{ themeStore.isDark ? 'Светлая' : 'Темная' }} тема</span>
          </button>
          
          <div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
            <div class="flex items-center gap-2">
              <div :class="['w-2 h-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500']"></div>
              {{ isConnected ? 'Подключено' : 'Оффлайн' }}
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="lg:hidden sticky top-0 z-40 glass-strong border-b border-gray-200 dark:border-gray-800">
      <div class="px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-bold text-gray-900 dark:text-white">ООО "Юпитер"</h1>
          </div>
        </div>
        
        <button
          @click="themeStore.toggleTheme"
          class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg v-if="!themeStore.isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 lg:pl-72">
      <div class="min-h-screen">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-gray-200 dark:border-gray-800 pb-safe">
      <div class="flex items-center justify-around px-2 py-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          v-slot="{ isActive }"
          class="flex-1"
        >
          <div
            :class="[
              'flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all',
              isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400'
            ]"
          >
            <component :is="item.icon" class="w-6 h-6" />
            <span class="text-xs font-medium">{{ item.label }}</span>
          </div>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import { RouterLink } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useMasksStore } from '@/stores/masks'
import { useSpoolsStore } from '@/stores/spools'

const themeStore = useThemeStore()
const masksStore = useMasksStore()
const spoolsStore = useSpoolsStore()

const DashboardIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
])

const MaskIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const SpoolIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
])

const navItems = computed(() => [
  {
    path: '/',
    label: 'Дашборд',
    icon: DashboardIcon,
    badge: null
  },
  {
    path: '/masks',
    label: 'Маски',
    icon: MaskIcon,
    badge: masksStore.totalCount || null
  },
  {
    path: '/spools',
    label: 'Катушки',
    icon: SpoolIcon,
    badge: spoolsStore.totalCount || null
  }
])

const isConnected = computed(() => masksStore.isConnected && spoolsStore.isConnected)
</script>

