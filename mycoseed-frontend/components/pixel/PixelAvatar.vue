<template>
  <div 
    class="pixel-avatar relative overflow-hidden border-2 border-black bg-white"
    :class="sizeClasses"
  >
    <img 
      v-if="src" 
      :src="src" 
      alt="Avatar"
      class="w-full h-full object-cover image-pixelated"
    />
    <div v-else class="w-full h-full grid grid-cols-4 grid-rows-4">
      <!-- Simple generated pattern fallback -->
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
    default: 'mario'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'w-8 h-8 shadow-pixel-sm',
    md: 'w-12 h-12 shadow-pixel',
    lg: 'w-20 h-20 shadow-pixel',
    xl: 'w-32 h-32 shadow-pixel-lg'
  }
  return sizes[props.size]
})

// Simple deterministic color generator based on seed
const getColor = (index: number) => {
  const colors = [
    '#ff3844', // Red
    '#3562ff', // Blue
    '#00cc00', // Green
    '#ffcc00', // Yellow
    '#ffffff', // White
    '#945e28', // Brown
    '#000000'  // Black
  ]
  const charCode = props.seed.charCodeAt(index % props.seed.length) || 0
  return colors[(charCode + index) % colors.length]
}
</script>

<style scoped>
.image-pixelated {
  image-rendering: pixelated;
}
</style>









