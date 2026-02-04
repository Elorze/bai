<template>
  <div class="flex flex-col gap-6">
    <!-- Search Section -->
    <div>
      <h3 class="text-sm font-bold mb-3 flex items-center border-b-2 border-black pb-1">
        <span class="mr-2">🔍</span> 筛选社区
      </h3>
      <div class="space-y-3">
        <input 
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text" 
          placeholder="搜索社区名称..." 
          class="w-full px-3 py-2 border-2 border-black text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 font-pixel shadow-pixel-sm"
        />
      </div>
    </div>

    <!-- Community List Section (by location & search) -->
    <div>
      <h3 class="text-sm font-bold mb-3 flex items-center text-yellow-800 border-b-2 border-black pb-1 bg-yellow-100 px-1">
        <span class="mr-2">🗺</span> 按地域推荐社区
      </h3>
      <!-- Location Selector -->
      <div class="mb-3">
        <select 
          :value="selectedLocation" 
          @change="$emit('update:selectedLocation', ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border-2 border-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-pixel shadow-pixel-sm"
        >
          <option value="">🌍 全部地区</option>
          <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
        </select>
      </div>
      <div v-if="communities.length" class="space-y-2">
        <div
          v-for="comm in communities"
          :key="comm.id"
          class="flex items-center justify-between text-xs p-3 bg-white border-2 border-black cursor-pointer hover:-translate-y-1 hover:shadow-pixel-sm transition-all active:translate-y-0 active:shadow-none"
          tabindex="0"
          @click="$emit('select-community', comm.id)"
          @mouseenter="$emit('preview-community', comm.id)"
          @mouseleave="$emit('clear-preview')"
          @focus="$emit('preview-community', comm.id)"
          @blur="$emit('clear-preview')"
        >
          <div class="flex flex-col gap-0.5 max-w-[140px]">
            <span class="font-bold truncate">{{ comm.name }}</span>
            <span class="text-[10px] text-gray-500 truncate">
              {{ comm.location || '位置待补充' }}
            </span>
          </div>
          <div class="text-right text-[10px] text-gray-700 font-vt323 leading-tight">
            <div>{{ formatNumber(comm.memberCount) }} 人</div>
            <div>{{ formatNumber(comm.totalPoints) }} pts</div>
          </div>
        </div>
      </div>
      <div v-else class="text-xs text-gray-400 bg-gray-50 border-2 border-dashed border-gray-300 p-3">
        暂无符合条件的社区
      </div>
    </div>

    <!-- Live Feed Section -->
    <div>
      <h3 class="text-sm font-bold mb-3 flex items-center text-green-800 border-b-2 border-black pb-1 bg-green-100 px-1">
        <span class="mr-2">⚡</span> 实时动态
      </h3>
      <div class="h-48 overflow-hidden relative bg-gray-50 border-2 border-black p-2">
        <div class="space-y-2">
          <div 
            v-for="log in activityLogs" 
            :key="log.id" 
            class="text-xs flex flex-col border-b border-gray-200 pb-2 mb-1 last:border-0 cursor-pointer hover:bg-green-50 transition-colors"
            @click="$emit('activity-click', log)"
          >
            <div class="flex items-center gap-1 mb-1 justify-between">
              <div class="flex items-center gap-1 flex-wrap">
                <span class="font-bold text-blue-700">{{ log.userName || '有人' }}</span>
                <span class="text-gray-600 scale-90 origin-left">{{ getActionText(log.type) }}</span>
              </div>
              <span class="text-gray-400 text-[10px] font-vt323">{{ formatTime(log.timestamp) }}</span>
            </div>
            <div class="text-gray-800 truncate pl-2 border-l-2 border-green-400 bg-green-50 p-1">
              {{ log.targetName }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Community, ActivityLog } from '~/utils/api'

defineProps<{
  locations: string[]
  selectedLocation: string
  searchQuery: string
  communities: Community[]
  activityLogs: ActivityLog[]
}>()

defineEmits(['update:selectedLocation', 'update:searchQuery', 'select-community', 'preview-community', 'clear-preview', 'activity-click'])

const getActionText = (type: string) => {
  const map: Record<string, string> = {
    'join': '加入了',
    'complete_task': '完成了任务',
    'create_proposal': '发起了提案',
    'new_community': '新社区成立'
  }
  return map[type] || '进行了操作'
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  const now = new Date()
  const diff = (now.getTime() - date.getTime()) / 1000 / 60 // minutes
  
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${Math.floor(diff)}m`
  if (diff < 60 * 24) return `${Math.floor(diff / 60)}h`
  return `${Math.floor(diff / 60 / 24)}d`
}
</script>

<style scoped>
.shadow-pixel-sm {
  box-shadow: 2px 2px 0 rgba(0,0,0,1);
}
</style>








