<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="visible"
        ref="menuRef"
        :style="menuStyle"
        class="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]"
        @click="close"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
        >
          <div
            v-if="item.divider"
            class="h-px bg-gray-200 dark:bg-gray-700 my-1"
          ></div>
          <button
            v-else
            @click="handleItemClick(item)"
            :disabled="item.disabled"
            :class="[
              'w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-3',
              item.disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : item.danger
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <component
              v-if="item.icon"
              :is="item.icon"
              class="w-5 h-5"
            />
            <span class="flex-1">{{ item.label }}</span>
            <span
              v-if="item.shortcut"
              class="text-xs text-gray-400 dark:text-gray-500"
            >
              {{ item.shortcut }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'select'])

const menuRef = ref(null)

const menuStyle = computed(() => {
  return {
    left: `${props.x}px`,
    top: `${props.y}px`
  }
})

const close = () => {
  emit('update:visible', false)
}

const handleItemClick = (item) => {
  if (!item.disabled && item.action) {
    item.action()
  }
  emit('select', item)
  close()
}

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    close()
  }
}

const handleEscape = (e) => {
  if (e.key === 'Escape') {
    close()
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscape)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.context-menu-enter-active,
.context-menu-leave-active {
  transition: all 0.15s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

