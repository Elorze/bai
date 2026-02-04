<template>
  <button
    :class="[
      'pixel-btn relative inline-flex items-center justify-center font-pixel uppercase transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses,
      sizeClasses,
      block ? 'w-full' : ''
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-mario-red text-white border-2 border-black shadow-pixel hover:bg-red-600',
    secondary: 'bg-white text-black border-2 border-black shadow-pixel hover:bg-gray-100',
    success: 'bg-mario-green text-white border-2 border-black shadow-pixel hover:bg-green-600',
    warning: 'bg-mario-yellow text-black border-2 border-black shadow-pixel hover:bg-yellow-500',
    danger: 'bg-black text-white border-2 border-white shadow-pixel-sm hover:bg-gray-900',
    ghost: 'bg-transparent text-black hover:bg-black/5 border-2 border-transparent hover:border-black/10'
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'text-[10px] px-2 py-1',
    md: 'text-xs px-4 py-2',
    lg: 'text-sm px-6 py-3'
  }
  return sizes[props.size]
})
</script>

<style scoped>
.pixel-btn {
  image-rendering: pixelated;
}
</style>









