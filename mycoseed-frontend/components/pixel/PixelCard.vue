<template>
  <div 
    class="pixel-card bg-white border-2 border-black shadow-pixel relative"
    :class="[
      paddingClass,
      hover ? 'hover:-translate-y-1 hover:shadow-pixel-lg transition-all duration-200 cursor-pointer' : ''
    ]"
  >
    <!-- Decorative corners for extra 8-bit feel (optional) -->
    <div class="absolute -top-1 -left-1 w-2 h-2 bg-white border-r-2 border-b-2 border-black z-10"></div>
    <div class="absolute -top-1 -right-1 w-2 h-2 bg-white border-l-2 border-b-2 border-black z-10"></div>
    <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-white border-r-2 border-t-2 border-black z-10"></div>
    <div class="absolute -bottom-1 -right-1 w-2 h-2 bg-white border-l-2 border-t-2 border-black z-10"></div>

    <div class="relative z-20">
      <div v-if="$slots.header" class="mb-4 border-b-2 border-black/10 pb-2 font-pixel text-xs uppercase tracking-wider">
        <slot name="header" />
      </div>
      
      <div class="font-vt323 text-lg">
        <slot />
      </div>

      <div v-if="$slots.footer" class="mt-4 pt-2 border-t-2 border-black/10 flex items-center justify-between">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  noPadding: {
    type: Boolean,
    default: false
  },
  hover: {
    type: Boolean,
    default: false
  }
})

const paddingClass = computed(() => props.noPadding ? 'p-0' : 'p-4 md:p-6')
</script>

<style scoped>
.pixel-card {
  image-rendering: pixelated;
}
</style>






