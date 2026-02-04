<template>
  <div class="space-y-8">
    <!-- Village Header -->
    <div 
      class="relative h-48 md:h-64 w-full bg-mario-sky overflow-hidden border-4 border-black shadow-pixel cursor-pointer hover:opacity-90 transition-opacity"
      @click="isIntroExpanded = !isIntroExpanded"
    >
      <!-- Parallax Background Layers (Simulated) -->
      <div class="absolute bottom-0 w-full h-16 bg-mario-ground"></div>
      <div class="absolute bottom-16 left-10 w-20 h-20 bg-red-500 pixel-house"></div>
      <div class="absolute bottom-16 right-20 w-24 h-24 bg-blue-500 pixel-castle"></div>
      <div class="absolute top-4 left-1/2 -translate-x-1/2 font-pixel text-white text-shadow-pixel text-2xl md:text-4xl uppercase text-center">
        {{ community?.name || '正在加载...' }}
      </div>
      <!-- 展开/收起箭头 -->
      <div 
        class="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-shadow-pixel transition-all duration-300 hover:scale-110"
        :class="{ 'rotate-180': isIntroExpanded }"
      >
        <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>

    <!-- Community Intro Card -->
    <Transition name="intro-slide">
      <div v-show="isIntroExpanded" class="bg-white border-b-4 border-black p-6 pb-8 overflow-hidden">
        <div class="prose font-vt323 text-lg max-w-none">
          <h3 class="font-pixel text-sm uppercase border-b-2 border-black pb-2 mb-4">欢迎来到 {{ community?.name }}</h3>
          <div class="whitespace-pre-wrap">{{ community?.markdownIntro || '正在加载...' }}</div>
        </div>
      </div>
    </Transition>

    <!-- Village Content Grid -->
    <div class="space-y-6">
      
      <!-- Main Content (Tabs) -->
      <div class="space-y-6">
        
        <!-- Tab Navigation -->
        <div class="flex border-b-4 border-black">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 font-pixel text-sm transition-all border-t-4 border-x-4 border-black -mb-1 mr-2',
              activeTab === tab.id ? 'bg-mario-red text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- QUESTS TAB -->
        <div v-if="activeTab === 'QUESTS'" class="space-y-6">
          <div class="flex items-center justify-between bg-white border-2 border-black p-2">
            <div class="font-pixel text-sm">当前任务: {{ activeTasksCount }} | 当前活动: {{ activeEventsCount }}</div>
          </div>

          <div v-if="mergedItems.length === 0" class="text-center py-12 bg-white border-2 border-black p-4">
            <p class="font-vt323 text-lg text-gray-600">暂无任务和活动</p>
          </div>
          
          <div v-else class="grid gap-4">
            <template v-for="item in mergedItems" :key="`${item.type}-${item.data.id}`">
              <!-- 任务卡片 -->
              <PixelCard 
                v-if="item.type === 'task'"
                hover 
                class="cursor-pointer" 
                @click="navigateTo(`/tasks/${item.data.id}`)"
              >
                <template #header>
                  <div class="flex justify-between items-start">
                    <span class="text-gray-600 text-xs">任务 #{{ item.data.id }}</span>
                    <span class="text-xs text-gray-400">{{ formatTimeAgo(item.data.createdAt) }}</span>
                  </div>
                </template>
                
                <div class="flex gap-4">
                  <PixelAvatar :seed="item.data.creatorName || `user${item.data.creatorId}`" size="md" />
                  <div class="flex-1">
                    <h3 class="font-bold text-lg">{{ item.data.title }}</h3>
                    <p class="text-gray-600 text-sm line-clamp-2">{{ item.data.description }}</p>
                  </div>
                </div>

                <template #footer>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="text-mario-coin font-bold flex items-center gap-1">
                        <div class="w-3 h-3 bg-mario-coin rounded-sm"></div>
                        {{ item.data.reward }} 积分
                      </div>
                      <span class="text-xs bg-gray-200 px-2 py-1 font-pixel uppercase">{{ getStatusLabel(item.data.status) }}</span>
                    </div>
                    <PixelButton 
                      v-if="item.data.status === 'unclaimed'"
                      size="sm" 
                      variant="secondary"
                      @click.stop="navigateTo(`/tasks/${item.data.id}`)"
                    >
                      查看详情
                    </PixelButton>
                  </div>
                </template>
              </PixelCard>

              <!-- 活动卡片 -->
              <PixelCard v-else-if="item.type === 'event'">
                <template #header>
                  <div class="flex justify-between items-start">
                    <span class="text-gray-600 text-xs">活动 #{{ item.data.id }}</span>
                    <span class="text-xs text-gray-400">{{ formatTimeAgo(item.data.createdAt) }}</span>
                  </div>
                </template>
                
                <div class="flex gap-4">
                  <div class="w-20 h-20 bg-black/10 flex items-center justify-center text-4xl border-2 border-black">
                    📅
                  </div>
                  <div class="flex-1">
                    <div class="font-pixel text-xs text-mario-red mb-1">{{ item.data.date }}</div>
                    <h3 class="font-bold text-xl font-vt323">{{ item.data.title }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ item.data.description }}</p>
                    <div class="mt-2 flex gap-2">
                      <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 border border-green-600">
                        {{ item.data.participants }} 人已报名
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col justify-center">
                    <PixelButton size="sm" variant="success">报名参加</PixelButton>
                  </div>
                </div>
              </PixelCard>
            </template>
          </div>
        </div>

        <!-- INTRO TAB -->
        <div v-else-if="activeTab === 'INTRO'" class="space-y-6">
          <!-- Town Hall (Governance & Members) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PixelCard>
              <template #header>市政厅 (TOWN HALL)</template>
              <div class="space-y-4 text-center">
                <div class="w-full h-24 bg-gray-100 flex items-center justify-center border-2 border-dashed border-black/20 relative overflow-hidden">
                  <!-- Castle IMG Placeholder -->
                  <div class="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🏰</div>
                </div>
                
                <!-- Community Stats -->
                <div class="grid grid-cols-2 gap-2 text-left font-vt323 text-lg bg-gray-50 p-2 border border-black/10">
                   <div>{{ community?.pointName || '总积分' }}:</div>
                   <div class="text-right text-mario-coin font-bold">{{ community?.totalPoints || 0 }}</div>
                   <div>成员:</div>
                   <div class="text-right font-bold">{{ community?.memberCount || 0 }}</div>
                </div>

                <p class="text-sm text-gray-600 text-left">
                  {{ community?.description || '菌丝网络中的一个和平村庄。' }}
                </p>
              </div>
            </PixelCard>

            <PixelCard>
              <template #header>村民 (VILLAGERS)</template>
              <div class="grid grid-cols-4 gap-2">
                 <PixelAvatar 
                   v-for="member in members.slice(0, 12)" 
                   :key="member.id" 
                   :seed="member.avatarSeed || member.name" 
                   size="sm"
                   class="cursor-pointer hover:scale-110 transition-transform"
                   @click="navigateTo(`/member/${member.id}`)"
                 />
              </div>
              <div v-if="members.length > 12" class="text-xs text-gray-500 mt-2 text-center">
                还有 {{ members.length - 12 }} 位成员...
              </div>
            </PixelCard>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { useCommunityStore } from '~/stores/community'
import PixelButton from '~/components/pixel/PixelButton.vue'
import PixelCard from '~/components/pixel/PixelCard.vue'
import PixelAvatar from '~/components/pixel/PixelAvatar.vue'
import { getCommunityById, getCommunityMembers, getAllTasks, getMemberById, getApiBaseUrl, type Task } from '~/utils/api'

const route = useRoute()
const router = useRouter()
const communityId = parseInt(route.params.id as string)
const activeTab = ref('INTRO')
const userStore = useUserStore()
const communityStore = useCommunityStore()

// 简介卡片展开/收起状态
const isIntroExpanded = ref(false)

// 判断是否是当前用户自己的社区
// 注意：Community.id是number，User.id是string(UUID)，不能直接比较
// 这里暂时只检查用户类型，实际应该通过Community的creatorId字段来判断
const isMyCommunity = computed(() => {
  return userStore.user?.userType === 'community'
  // TODO: 如果Community有creatorId字段，应该用creatorId来比较
  // return userStore.user?.id === community.value?.creatorId && userStore.user?.userType === 'community'
})

const tabs = [
  { id: 'INTRO', label: '简介' },
  { id: 'QUESTS', label: '社区动态' }
]

// Data
const community = ref<any>(null)
const members = ref<any[]>([])
const tasks = ref<Task[]>([])
const events = ref<any[]>([])

// 计算当前任务数量（未领取和进行中的任务）
const activeTasksCount = computed(() => {
  return tasks.value.filter(task => 
    task.status === 'unclaimed' || task.status === 'claimed' || task.status === 'unsubmit'
  ).length
})

// 计算当前活动数量（即将开始和进行中的活动）
const activeEventsCount = computed(() => {
  return events.value.filter(event => 
    event.status === 'upcoming' || event.status === 'ongoing'
  ).length
})

// 计算当前任务和活动的总数
const activeItemsCount = computed(() => {
  return activeTasksCount.value + activeEventsCount.value
})

// 合并任务和活动，按时间排序
const mergedItems = computed(() => {
  const items: Array<{ type: 'task' | 'event', data: any, createdAt: string }> = []
  
  // 添加任务
  tasks.value.forEach(task => {
    items.push({
      type: 'task',
      data: task,
      createdAt: task.createdAt
    })
  })
  
  // 添加活动
  events.value.forEach(event => {
    items.push({
      type: 'event',
      data: event,
      createdAt: event.createdAt
    })
  })
  
  // 按创建时间倒序排序（最新的在前）
  return items.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime()
    const timeB = new Date(b.createdAt).getTime()
    return timeB - timeA
  })
})

// 格式化时间差
const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return ''
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else {
    return `${diffDays}天前`
  }
}

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'unclaimed': '未领取',
    'claimed': '已领取',
    'unsubmit': '待提交',
    'under_review': '审核中',
    'completed': '已完成',
    'rejected': '已驳回'
  }
  return statusMap[status] || '未知'
}

const navigateTo = (path: string) => {
  router.push(path)
}

// 加载社区任务
const loadCommunityTasks = async () => {
  try {
    // 获取所有任务
    const baseUrl = getApiBaseUrl()
    const allTasks = await getAllTasks(baseUrl)
    
    // 获取社区成员列表
    const communityMembers = await getCommunityMembers(communityId)
    // ✅ 将member.id转换为string，因为task.creatorId是UUID (string)
    const memberIds = new Set(communityMembers.map(m => String(m.id)))
    
    // 过滤出属于该社区的任务
    // 任务的创建者必须是该社区的成员
    const communityTasks = allTasks.filter(task => {
      // 如果任务的创建者是社区成员，则属于该社区
      // task.creatorId是string (UUID)，memberIds也是Set<string>
      return task.creatorId && memberIds.has(String(task.creatorId))
    })
    
    // 只显示未领取和进行中的任务
    tasks.value = communityTasks.filter(task => 
      task.status === 'unclaimed' || task.status === 'claimed' || task.status === 'unsubmit'
    )
  } catch (error) {
    console.error('Failed to load community tasks:', error)
    tasks.value = []
  }
}

onMounted(async () => {
  // 确保用户信息已加载
  await userStore.getUser()
  
  // 更新 community store 中的当前选择
  await communityStore.setCurrentCommunity(communityId)
  
  // 从 API 获取社群数据
  try {
    community.value = await getCommunityById(communityId)
    if (community.value) {
      members.value = await getCommunityMembers(communityId)
      // 加载社区任务
      await loadCommunityTasks()
    }
  } catch (error) {
    console.error('Failed to load community data:', error)
  }
  
  // Mock events (可以后续从 API 获取)
  const now = new Date()
  events.value = [
     { id: 1, title: '每周管道检查', date: '2024-11-30', description: '检查所有绿色管道是否有食人花。', participants: 12, createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'upcoming' as const },
     { id: 2, title: '卡丁车锦标赛', date: '2024-12-05', description: '彩虹之路聚会。自带香蕉皮。', participants: 64, createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'ongoing' as const }
  ]
})
</script>

<style scoped>
.pixel-house {
  clip-path: polygon(
    20% 40%, 80% 40%, 80% 100%, 20% 100%, 20% 40%,
    0% 40%, 50% 0%, 100% 40%, 80% 40%
  );
}
.pixel-castle {
  clip-path: polygon(
    0% 100%, 0% 30%, 20% 30%, 20% 0%, 40% 0%, 40% 30%, 
    60% 30%, 60% 0%, 80% 0%, 80% 30%, 100% 30%, 100% 100%
  );
}

/* 简介卡片展开/收起动画 */
.intro-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.intro-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.intro-slide-enter-from {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-bottom-width: 0;
}

.intro-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-bottom-width: 0;
}

.intro-slide-enter-to,
.intro-slide-leave-from {
  max-height: 2000px;
  opacity: 1;
}
</style>
