<template>
  <AppLayout>
    <div class="p-4 lg:p-8 space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Дашборд</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Аналитика и статистика</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader v-for="i in 4" :key="i" height="120px" rounded="lg" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader height="300px" rounded="lg" />
          <SkeletonLoader height="300px" rounded="lg" />
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-6 border-l-4 border-primary-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Всего масок</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ masksStore.totalCount }}</p>
              </div>
              <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="card p-6 border-l-4 border-secondary-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Всего катушек</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ spoolsStore.totalCount }}</p>
              </div>
              <div class="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                <svg class="w-8 h-8 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="card p-6 border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Этот месяц</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ thisMonthCount }}</p>
              </div>
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div class="card p-6 border-l-4 border-amber-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Этот год</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ thisYearCount }}</p>
              </div>
              <div class="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <svg class="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Masks by Model -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Маски по моделям</h3>
            <canvas ref="masksChartRef"></canvas>
          </div>

          <!-- Spools by Type -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Катушки по типу провода</h3>
            <canvas ref="spoolsChartRef"></canvas>
          </div>
        </div>

        <!-- Production Timeline -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Динамика производства (последние 6 месяцев)</h3>
          <canvas ref="timelineChartRef"></canvas>
        </div>

        <!-- Recent Activity -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Последние добавленные</h3>
          <div class="space-y-3">
            <div v-for="item in recentItems" :key="item.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center gap-3">
                <div :class="['p-2 rounded-lg', item.type === 'mask' ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-secondary-100 dark:bg-secondary-900/30']">
                  <svg class="w-5 h-5" :class="item.type === 'mask' ? 'text-primary-600' : 'text-secondary-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-mono font-medium text-gray-900 dark:text-white">{{ item.serial }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.details }}</p>
                </div>
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useMasksStore } from '@/stores/masks'
import { useSpoolsStore } from '@/stores/spools'
import { useThemeStore } from '@/stores/theme'
import AppLayout from '@/components/common/AppLayout.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

Chart.register(...registerables)

const masksStore = useMasksStore()
const spoolsStore = useSpoolsStore()
const themeStore = useThemeStore()

const isLoading = computed(() => masksStore.isLoading || spoolsStore.isLoading)

const masksChartRef = ref(null)
const spoolsChartRef = ref(null)
const timelineChartRef = ref(null)

let masksChart = null
let spoolsChart = null
let timelineChart = null

const thisMonthCount = computed(() => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  
  const masks = masksStore.masks.filter(m => m.month === month && m.year === year).length
  const spools = spoolsStore.spools.filter(s => s.month === month && s.year === year).length
  
  return masks + spools
})

const thisYearCount = computed(() => {
  const year = new Date().getFullYear()
  const masks = masksStore.masks.filter(m => m.year === year).length
  const spools = spoolsStore.spools.filter(s => s.year === year).length
  return masks + spools
})

const recentItems = computed(() => {
  const masks = masksStore.masks.slice(0, 5).map(m => ({
    id: m.id,
    type: 'mask',
    serial: m.serial,
    details: `${m.model} - ${m.size}`,
    date: `${m.month}.${m.year}`
  }))
  
  const spools = spoolsStore.spools.slice(0, 5).map(s => ({
    id: s.id,
    type: 'spool',
    serial: s.serial,
    details: s.wireType || 'Катушка',
    date: `${s.month}.${s.year}`
  }))
  
  return [...masks, ...spools].slice(0, 10)
})

const getChartColors = () => {
  const isDark = themeStore.isDark
  return {
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    background: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.5)',
    border: isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 1)'
  }
}

const createMasksChart = () => {
  if (!masksChartRef.value) return
  
  const colors = getChartColors()
  const ctx = masksChartRef.value.getContext('2d')
  
  if (masksChart) masksChart.destroy()
  
  masksChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Рапира', 'Шпага', 'Сабля', 'Тренер'],
      datasets: [{
        data: [
          masksStore.rapierCount,
          masksStore.epeeCount,
          masksStore.sabreCount,
          masksStore.coachCount
        ],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'],
        borderWidth: 2,
        borderColor: themeStore.isDark ? '#1f2937' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: colors.text }
        }
      }
    }
  })
}

const createSpoolsChart = () => {
  if (!spoolsChartRef.value) return
  
  const colors = getChartColors()
  const ctx = spoolsChartRef.value.getContext('2d')
  
  if (spoolsChart) spoolsChart.destroy()
  
  spoolsChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Китайский', 'Favero'],
      datasets: [{
        data: [spoolsStore.chineseCount, spoolsStore.faveroCount],
        backgroundColor: ['#3b82f6', '#a855f7'],
        borderWidth: 2,
        borderColor: themeStore.isDark ? '#1f2937' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: colors.text }
        }
      }
    }
  })
}

const createTimelineChart = () => {
  if (!timelineChartRef.value) return
  
  const colors = getChartColors()
  const ctx = timelineChartRef.value.getContext('2d')
  
  if (timelineChart) timelineChart.destroy()
  
  // Get last 6 months data
  const now = new Date()
  const months = []
  const masksData = []
  const spoolsData = []
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    
    months.push(`${month}.${year}`)
    masksData.push(masksStore.masks.filter(m => m.month === month && m.year === year).length)
    spoolsData.push(spoolsStore.spools.filter(s => s.month === month && s.year === year).length)
  }
  
  timelineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Маски',
          data: masksData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Катушки',
          data: spoolsData,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: colors.text }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        },
        x: {
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        }
      }
    }
  })
}

const initCharts = () => {
  createMasksChart()
  createSpoolsChart()
  createTimelineChart()
}

onMounted(async () => {
  await Promise.all([
    masksStore.init(),
    spoolsStore.init()
  ])
  
  setTimeout(initCharts, 100)
})

watch(() => themeStore.isDark, () => {
  setTimeout(initCharts, 100)
})

watch([
  () => masksStore.masks.length,
  () => spoolsStore.spools.length
], () => {
  setTimeout(initCharts, 100)
})
</script>

