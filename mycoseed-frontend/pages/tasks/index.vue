<template>
  <div class="min-h-screen bg-mario-sky py-8">
    <div class="container mx-auto px-6">
      <!-- 创建任务按钮 -->
      <div v-if="isAuthenticated" class="mb-6 flex justify-end gap-2">
        <button
          @click="navigateTo('/tasks/create')"
          class="create-task-btn relative px-4 py-2.5 font-pixel text-xs uppercase"
        >
          <span class="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
            <span class="text-base">🎯</span>
            <span class="font-bold">创建任务</span>
          </span>
        </button>
      </div>

      <!-- 操作栏 -->
      <div class="mb-6 flex flex-col sm:flex-row justify-start items-center gap-4">
        <!-- 状态筛选 -->
        <div class="flex gap-2">
          <button
            v-for="tab in statusTabs"
            :key="tab.id"
            @click="activeStatusTab = tab.id"
            :class="[
              'px-4 py-2 font-pixel text-xs uppercase border-2 border-black transition-all',
              activeStatusTab === tab.id
                ? 'bg-mario-red text-white shadow-pixel'
                : 'bg-white text-black hover:bg-gray-100'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="font-pixel text-xl text-white animate-pulse">加载中...</div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredItems.length === 0" class="text-center py-12">
        <div class="font-pixel text-xl text-white mb-4">暂无内容</div>
      </div>

      <!-- 内容列表 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 任务卡片 -->
        <PixelCard
          v-for="item in filteredItems"
          :key="`task-${item.id}`"
          hover
          class="cursor-pointer"
          @click="navigateTo(`/tasks/${item.id}`)"
        >
          <template #header>
            <div class="flex justify-between items-start">
              <span class="text-gray-600 text-xs">任务 #{{ item.id }}</span>
               <span class="text-xs text-gray-400">{{ formatTimeAgo(item.createdAt || item.deadline) }}</span>
            </div>
          </template>
          
          <div class="flex gap-4">
            <PixelAvatar :seed="item.creator || `user${item.id}`" size="md" />
            <div class="flex-1">
              <h3 class="font-bold text-lg">{{ item.title }}</h3>
              <p class="text-gray-600 text-sm line-clamp-2">{{ item.description }}</p>
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="text-mario-coin font-bold flex items-center gap-1">
                  <div class="w-3 h-3 bg-mario-coin rounded-sm"></div>
                  {{ item.reward || 0 }} 积分
                </div>
                <span class="text-xs bg-gray-200 px-2 py-1 font-pixel uppercase">{{ getTaskStatusText(item.status, item._task) }}</span>
              </div>
              <PixelButton 
                v-if="item.status === 'unclaimed'"
                size="sm" 
                variant="secondary"
                @click.stop="navigateTo(`/tasks/${item.id}`)"
              >
                查看详情
              </PixelButton>
            </div>
          </template>
        </PixelCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PixelCard from '~/components/pixel/PixelCard.vue'
import PixelButton from '~/components/pixel/PixelButton.vue'
import PixelAvatar from '~/components/pixel/PixelAvatar.vue'
import { useUserStore } from '~/stores/user'
import { getAllTasks, getApiBaseUrl, type Task } from '~/utils/api'
import { parseBeijingTime, getCurrentBeijingDate } from '~/utils/time'

definePageMeta({
  layout: 'default'
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 判断用户是否已登录
const isAuthenticated = computed(() => {
  return !!userStore.user
})

const navigateTo = (path: string) => {
  router.push(path)
}

// 状态筛选标签
const activeStatusTab = ref('all')
const statusTabs = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '可领取' }, // 包含"未领取"和"未领完"（多人项目没领完的）
  { id: 'unsubmit', label: '待审核' }, // 包含"待提交"（claimed/unsubmit）和"审核中"（submitted/under_review）
  { id: 'completed', label: '已完成' },
  { id: 'expired', label: '已失效' }
]

// 加载状态
const loading = ref(false)

// 任务列表
const tasks = ref<Task[]>([])

// 从 API 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const baseUrl = getApiBaseUrl()
    const apiTasks = await getAllTasks(baseUrl)
    tasks.value = apiTasks
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 任务数据项类型
interface TaskItem {
  id: string | number
  title: string
  description: string
  status: string
  reward?: number
  deadline?: string
  createdAt?: string
  creator?: string
  _task?: Task // 原始任务对象，用于判断是否失效
}

// 检查任务是否已领取（通过 claimer_id 判断）
const isTaskClaimed = (task: Task): boolean => {
  // 如果 claimerId 不为 null，说明已领取
  return !!task.claimerId
}

// 检查任务是否已过期（过了领取截止日期）
// 对于多人任务：过了领取截止日期就不能再领取
// 对于单人任务：过了领取截止日期且未领取才算过期
// 统一使用 UTC+8 北京时间进行比较，不受机器时区影响
const isTaskExpired = (task: Task): boolean => {
  if (!task.deadline) {
    return false // 如果没有领取截止时间，认为未过期
  }
  
  // 使用统一的时间解析函数，将 YYYY-MM-DDTHH:mm 当作北京时间（UTC+8）处理
  const deadline = parseBeijingTime(task.deadline)
  if (!deadline) {
    console.warn('[isTaskExpired] deadline 解析失败，返回 false')
    return false
  }
  
  // 获取当前北京时间（UTC+8）
  const now = getCurrentBeijingDate()
  
  // 如果过了领取截止日期
  if (now.getTime() > deadline.getTime()) {
    // 多人任务：过了领取截止日期就不能再领取
    if (task.participantLimit && task.participantLimit > 1) {
      return true
    }
    // 单人任务：过了领取截止日期且未领取才算过期
    return !isTaskClaimed(task)
  }
  
  return false
}

// 检查任务是否已截止（过了提交截止日期且已领取但未提交）
// 逻辑与任务详情页保持一致
// 统一使用 UTC+8 北京时间进行比较，不受机器时区影响
const isTaskOverdue = (task: Task): boolean => {
  // 优先使用提交截止日期
  const submitDeadline = task.submitDeadline
  if (!submitDeadline) {
    // 如果没有提交截止时间，使用领取截止时间作为后备（向后兼容）
    if (!task.deadline) return false
    
    const deadline = parseBeijingTime(task.deadline)
    if (!deadline) {
      return false // 无效时间，认为未截止
    }
    
    const now = getCurrentBeijingDate()
    
    // 如果过了领取截止时间且已领取但未提交，也算已截止
    const isClaimed = !!task.claimerId
    const isNotSubmitted = task.status !== 'completed' && task.status !== 'submitted' && task.status !== 'under_review'
    return now.getTime() > deadline.getTime() && isClaimed && isNotSubmitted
  }
  
  const deadline = parseBeijingTime(submitDeadline)
  if (!deadline) {
    return false // 无效时间，认为未截止
  }
  
  const now = getCurrentBeijingDate()
  
  // 过了提交截止日期且已领取但未提交的任务才算已截止
  // 检查条件：已领取 && 状态不是已完成和审核中 && 过了提交截止日期
  const isClaimed = !!task.claimerId
  const isNotSubmitted = task.status !== 'completed' && task.status !== 'under_review'
  
  return now.getTime() > deadline.getTime() && isClaimed && isNotSubmitted
}

// 检查任务是否被终止（rejected）
// 通过检查时间线数组的最后一个状态是否为 'rejected' 来判断
const isTaskRejected = (task: Task): boolean => {
  // 如果时间线存在且不为空，检查最后一个状态
  if (task.timeline && Array.isArray(task.timeline) && task.timeline.length > 0) {
    const lastStatus = task.timeline[task.timeline.length - 1]
    return lastStatus.status === 'rejected'
  }
  // 如果没有时间线，使用旧逻辑（向后兼容）
  return task.status === 'rejected' && task.rejectOption === 'rejected'
}

// 从时间线获取最新状态（如果时间线存在）
const getLatestStatusFromTimeline = (task: Task): TaskStatus | 'resubmit' | 'reclaim' | null => {
  if (task.timeline && Array.isArray(task.timeline) && task.timeline.length > 0) {
    const lastStatus = task.timeline[task.timeline.length - 1]
    return lastStatus.status as TaskStatus | 'resubmit' | 'reclaim'
  }
  return null
}

// 检查任务是否已失效（过期、已截止或被终止）
const isTaskInvalid = (task: Task): boolean => {
  return isTaskExpired(task) || isTaskOverdue(task) || isTaskRejected(task)
}

// 任务列表
const taskItems = computed<TaskItem[]>(() => {
  return tasks.value.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    reward: task.reward,
    deadline: task.deadline || task.completedAt || task.updatedAt || task.createdAt || '',
    createdAt: task.createdAt,
    creator: task.creatorName || '系统',
    // 添加原始任务对象，用于判断是否失效
    _task: task
  }))
})

// 检查任务是否未领完（多人项目没领完的）
// 通过比较已领取的行数和任务设置的参与人数来判断
const isTaskNotFullyClaimed = (task: Task): boolean => {
  // 如果任务有参与人数限制
  if (task.participantLimit && task.participantLimit > 1) {
    // 检查当前已领取人数（通过 participantsList，检查 claimerId 和 claimedAt）
    const currentParticipants = task.participantsList?.filter(p => p.claimerId && p.claimedAt).length || 0
    
    // 未领完：已领取人数小于限制（包括0人领取的情况）
    return currentParticipants < task.participantLimit
  }
  return false
}

// 状态映射：将任务状态映射到筛选状态
// 优先使用时间线数组的最后一个状态来判断
const mapTaskStatusToFilter = (item: TaskItem): string => {
  // 首先检查是否已失效（过期、已截止或被终止）
  // 注意：这个检查必须在状态映射之前，确保已失效的任务不会被归类到正常状态
  if (item._task) {
      // 优先检查已截止（因为已截止的任务状态可能还是 claimed 或 unsubmit）
    if (isTaskOverdue(item._task)) {
      return 'expired'
    }
    // 再检查是否已过期
    if (isTaskExpired(item._task)) {
      return 'expired'
    }
    // 再检查是否被终止（通过时间线最后一个状态判断）
    if (isTaskRejected(item._task)) {
      return 'expired'
    }
    
    // 优先检查是否未领完（多人任务）- 应该在状态检查之前
    if (isTaskNotFullyClaimed(item._task)) {
      return 'pending' // 未领完的任务显示在"可领取"标签页
    }
    
    // 尝试从时间线获取最新状态
    const latestStatus = getLatestStatusFromTimeline(item._task)
    if (latestStatus) {
      // 根据时间线的最新状态映射
      if (latestStatus === 'unclaimed' || (latestStatus === 'reclaim')) {
        return 'pending'
      }
      if (latestStatus === 'claimed' || latestStatus === 'unsubmit' || latestStatus === 'submitted' || latestStatus === 'under_review' || latestStatus === 'resubmit') {
        return 'unsubmit'
      }
      if (latestStatus === 'completed') {
        return 'completed'
      }
      if (latestStatus === 'rejected') {
        return 'expired'
      }
    }
  }
  
  // 如果没有时间线，使用旧逻辑（向后兼容）
  // "可领取"：包含"未领取"（unclaimed）和"未领完"（未领完的多人任务）
  if (item.status === 'unclaimed' || (item._task && isTaskNotFullyClaimed(item._task))) {
    return 'pending'
  }
  // "待审核"：包含"待提交"（claimed/unsubmit）和"审核中"（submitted/under_review）
  if (item.status === 'claimed' || item.status === 'unsubmit' || item.status === 'submitted' || item.status === 'under_review') {
    return 'unsubmit'
  }
  if (item.status === 'completed') return 'completed'
  if (item.status === 'rejected') return 'expired'
  
  return item.status
}

// 过滤后的任务列表
const filteredItems = computed(() => {
  let items = taskItems.value
  
  // 状态筛选
  if (activeStatusTab.value !== 'all') {
    items = items.filter(item => {
      const filterStatus = mapTaskStatusToFilter(item)
      return filterStatus === activeStatusTab.value
    })
  }
  
  return items
})

// 任务状态文本（统一的状态文本映射）
const getTaskStatusText = (status: string, task?: Task) => {
  // 如果提供了任务对象，优先检查是否已失效（过期、已截止或被终止）
  if (task) {
    // 先检查是否已截止（优先级最高，因为已截止的任务状态可能还是 claimed 或 unsubmit）
    if (isTaskOverdue(task)) {
      return '已截止'
    }
    // 再检查是否已过期
    if (isTaskExpired(task)) {
      return '已过期'
    }
    // 再检查是否被终止（只有 rejectOption === 'rejected' 的才是真正的终止）
    if (isTaskRejected(task)) {
      return '已终止'
    }
    
    // 对于多人任务，检查是否所有参与者都已完成
    if (task.participantLimit && task.participantLimit > 1 && task.participantsList) {
      const allCompleted = task.participantsList.every(p => 
        p.status === 'completed' || p.status === 'rejected'
      )
      if (allCompleted && task.participantsList.length > 0) {
        // 如果所有参与者都已完成或被驳回，检查是否至少有一个完成
        const hasCompleted = task.participantsList.some(p => p.status === 'completed')
        return hasCompleted ? '已完成' : '已终止'
      }
    }
    
    // 检查是否未领完（多人项目）
    // 优先检查未领完状态（应该在过期检查之前）
    if (isTaskNotFullyClaimed(task)) {
      return '未领完'
    }
  }
  
  // 统一的状态文本映射
  const statusMap: Record<string, string> = {
    'unclaimed': '未领取',
    'claimed': '已领取',
    'unsubmit': '待提交',
    'submitted': '已提交',
    'under_review': '审核中',
    'completed': '已完成',
    'rejected': '已终止'  // 只有 rejectOption === 'rejected' 的才会显示这个
  }
  return statusMap[status] || '未知'
}

// 格式化时间差（统一使用 UTC+8 北京时间，不受机器时区影响）
const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return ''
  
  // 使用统一的时间解析函数，将 YYYY-MM-DDTHH:mm 当作北京时间（UTC+8）处理
  const date = parseBeijingTime(dateString)
  if (!date) {
    console.warn(`[formatTimeAgo] 无法解析时间格式: ${dateString}`)
    return ''
  }
  
  // 获取当前北京时间（UTC+8）
  const now = getCurrentBeijingDate()
  
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) {
    return `${Math.max(0, diffMins)}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else {
    return `${diffDays}天前`
  }
}


// 组件挂载时加载数据
onMounted(async () => {
  // 确保用户信息已加载
  await userStore.getUser()
  loadData()
})

// 监听路由变化，当从创建页面返回时重新加载
watch(() => route.fullPath, () => {
  if (route.path === '/tasks') {
    loadData()
  }
}, { immediate: false })
</script>

<style scoped>
.create-task-btn {
  /* 机械键盘按钮风格：白底黑框 */
  background: #ffffff;
  color: #000000;
  border: 3px solid #000000;
  
  /* 无阴影 */
  box-shadow: none;
  
  /* 轻微浮动动画（包含缩放） */
  animation: float-gentle 3s ease-in-out infinite;
  
  /* 过渡效果 */
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* 像素风格 */
  image-rendering: pixelated;
  position: relative;
  overflow: visible;
}

/* 轻微浮动动画 */
@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0px) scale(0.85);
  }
  50% {
    transform: translateY(-2px) scale(0.85);
  }
}

/* Hover 效果：放大、旋转、上浮 */
.create-task-btn:hover {
  transform: translateY(-4px) rotate(2deg) scale(1);
  box-shadow: none;
  animation-play-state: paused;
}

/* Active 效果：点击放大到当前尺度 */
.create-task-btn:active {
  transform: translateY(0px) rotate(0deg) scale(1);
  box-shadow: none;
  animation-play-state: paused;
}

/* 表情动画 */
.create-task-btn .text-base {
  display: inline-block;
  animation: emoji-bounce 2s ease-in-out infinite;
}

@keyframes emoji-bounce {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
}
</style>




