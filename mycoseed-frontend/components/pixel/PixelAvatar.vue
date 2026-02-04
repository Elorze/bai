<template>
  <div 
    class="relative overflow-hidden rounded-full bg-input-bg shadow-soft"
    :class="sizeClasses"
  >
    <img 
      v-if="src" 
      :src="src" 
      alt="Avatar"
      class="w-full h-full object-cover"
    />
    <div v-else class="w-full h-full grid grid-cols-4 grid-rows-4 rounded-full overflow-hidden">
      <div 
        v-for="i in 16" 
        :key="i" 
        :style="{ backgroundColor: getColor(i) }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  seed: {
    type: String,
    default: 'user'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  }
  return sizes[props.size]
})

const getColor = (index: number) => {
  const colors = [
    '#00B3B3',
    '#2D8CFF',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#6366f1'
  ]
  const charCode = props.seed.charCodeAt(index % props.seed.length) || 0
  return colors[(charCode + index) % colors.length]
}
</script>
