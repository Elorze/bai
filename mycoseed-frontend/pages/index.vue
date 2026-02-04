<template>
  <div class="space-y-8">
    <!-- 如果没有选择社区，显示提示 -->
    <div v-if="!communityStore.currentCommunityId" class="text-center py-12 bg-card rounded-3xl shadow-soft p-6">
      <p class="text-lg text-text-body mb-4">请先选择一个社区</p>
      <p class="text-sm text-text-placeholder">点击顶部按钮切换社区频道</p>
    </div>

    <!-- 社区面板内容 -->
    <div v-else>
      <!-- Village Header / Banner -->
      <div 
        class="relative h-48 md:h-64 w-full overflow-hidden rounded-3xl shadow-soft cursor-pointer hover:opacity-95 transition-opacity bg-gradient-to-br from-primary to-accent"
        @click="isIntroExpanded = !isIntroExpanded"
      >
        <div class="absolute top-4 left-1/2 -translate-x-1/2 font-bold text-white text-2xl md:text-4xl text-center drop-shadow-md">
          {{ community?.name || '正在加载...' }}
        </div>
        <!-- 展开/收起箭头 -->
        <div 
          class="absolute bottom-2 left-1/2 -translate-x-1/2 text-white transition-all duration-300 hover:scale-110"
          :class="{ 'rotate-180': isIntroExpanded }"
        >
          <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      <!-- Community Intro Card -->
      <Transition name="intro-slide">
        <div v-show="isIntroExpanded" class="bg-card rounded-3xl shadow-soft p-6 pb-8 overflow-hidden border border-border">
          <div class="prose text-lg max-w-none text-text-body">
            <h3 class="text-base font-bold text-text-title border-b border-border pb-2 mb-4">欢迎来到 {{ community?.name }}</h3>
            <div class="whitespace-pre-wrap">{{ community?.markdownIntro || '正在加载...' }}</div>
          </div>
        </div>
      </Transition>

      <!-- Village Content Grid -->
      <div class="space-y-6">
        
        <!-- Main Content (Tabs) -->
        <div class="space-y-6">
          
          <!-- Tab Navigation -->
          <div class="flex border-b border-border gap-2">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-4 py-2 rounded-t-2xl text-sm font-medium transition-all -mb-px',
                activeTab === tab.id ? 'bg-primary text-white' : 'bg-input-bg text-text-body hover:bg-muted'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- INTRO TAB -->
          <div v-if="activeTab === 'INTRO'" class="space-y-6">
            <!-- Town Hall (Governance & Members) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PixelCard>
                <template #header>市政厅 (TOWN HALL)</template>
                <div class="space-y-4 text-center">
                  <div class="w-full h-24 bg-input-bg rounded-2xl flex items-center justify-center border border-dashed border-border relative overflow-hidden">
                    <div class="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🏰</div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2 text-left text-base bg-input-bg rounded-2xl p-3 border border-border">
                     <div class="text-text-body">{{ community?.pointName || '总积分' }}:</div>
                     <div class="text-right font-bold text-primary">{{ community?.totalPoints || 0 }}</div>
                     <div class="text-text-body">成员:</div>
                     <div class="text-right font-bold text-text-title">{{ community?.memberCount || 0 }}</div>
                  </div>

                  <p class="text-sm text-text-body text-left">
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
                <div v-if="members.length > 12" class="text-sm text-text-placeholder mt-2 text-center">
                  还有 {{ members.length - 12 }} 位成员...
                </div>
              </PixelCard>
            </div>
          </div>

          <!-- COMMUNITY TAB (社区圈) -->
          <div v-else-if="activeTab === 'COMMUNITY'" class="space-y-6">
            <div v-if="!communityStore.currentCommunityId && !userCommunity" class="text-center py-12 bg-card rounded-3xl shadow-soft p-6">
              <p class="text-lg text-text-body mb-2">请先选择一个社区</p>
              <p class="text-sm text-text-placeholder">点击顶部按钮切换社区频道</p>
            </div>

            <div v-else-if="communityTransactions.length === 0" class="text-center py-12 bg-card rounded-3xl shadow-soft p-6">
              <p class="text-lg text-text-body">暂无社区动态</p>
              <p class="text-sm text-text-placeholder mt-2">社区成员还没有交易记录</p>
            </div>

            <div v-else class="space-y-4">
              <div 
                v-for="tx in communityTransactions" 
                :key="`${tx.userId}-${tx.id}`"
                class="bg-card rounded-2xl shadow-soft p-4 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all"
              >
                <div class="flex items-start gap-4">
                  <PixelAvatar 
                    :seed="tx.userAvatarSeed || tx.userName" 
                    size="md"
                    class="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    @click="navigateTo(`/member/${tx.userId}`)"
                  />
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="font-bold text-sm cursor-pointer hover:text-primary transition-colors text-text-title" @click="navigateTo(`/member/${tx.userId}`)">
                        {{ tx.userName }}
                      </span>
                      <span class="text-xs text-text-placeholder">{{ formatTimeAgoForCommunity(tx.date) }}</span>
                    </div>
                    
                    <div class="flex items-center gap-3 mb-2">
                      <div :class="[
                        'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                        tx.type === 'in' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                      ]">
                        {{ tx.type === 'in' ? '⬇️' : '⬆️' }}
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-sm text-text-title mb-1">{{ tx.title }}</div>
                        <div v-if="tx.taskTitle" class="text-xs text-text-placeholder mb-1">
                          任务: {{ tx.taskTitle }}
                        </div>
                        <div :class="[
                          'text-xl font-bold',
                          tx.type === 'in' ? 'text-success' : 'text-destructive'
                        ]">
                          {{ tx.type === 'in' ? '+' : '-' }}{{ formatAmountForCommunity(tx.amount) }} {{ tx.currency }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { useCommunityStore } from '~/stores/community'
import PixelCard from '~/components/pixel/PixelCard.vue'
import PixelAvatar from '~/components/pixel/PixelAvatar.vue'
import { getCommunityById, getCommunityMembers, getMemberById, getCommunities, getCommunityTransactions, getUserCommunityPoints, type Community, type CommunityTransaction } from '~/utils/api'

// Use definePageMeta to ensure layout is applied
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const router = useRouter()
const userStore = useUserStore()
const communityStore = useCommunityStore()
const activeTab = ref('INTRO')

// 简介卡片展开/收起状态
const isIntroExpanded = ref(false)

const tabs = [
  { id: 'INTRO', label: '简介' },
  { id: 'COMMUNITY', label: '社区圈' }
]

// Data
const community = ref<any>(null)
const members = ref<any[]>([])

// 用户社区相关数据
const userCommunity = ref<Community | null>(null)
const communityTransactions = ref<CommunityTransaction[]>([])

// 格式化时间差（用于社区圈）
const formatTimeAgoForCommunity = (dateString: string): string => {
  if (!dateString) return ''
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) {
    return '刚刚'
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    // 超过7天显示具体日期
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

// 格式化金额显示（用于社区圈）
const formatAmountForCommunity = (amount: number): string => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const navigateTo = (path: string) => {
  router.push(path)
}

// 加载社区数据
const loadCommunityData = async (communityId: number) => {
  try {
    community.value = await getCommunityById(communityId)
    if (community.value) {
      members.value = await getCommunityMembers(communityId)
    }
  } catch (error) {
    console.error('Failed to load community data:', error)
  }
}

// 获取用户所属社区
const loadUserCommunity = async () => {
  try {
    // 确保用户信息已加载
    const user = await userStore.getUser()
    
    if (!user || !user.id) {
      console.log('用户未登录或用户ID不存在')
      // 重定向到登录页
      router.push('/auth/login')
      return
    }

    console.log('加载用户社区信息，用户ID:', user.id)
    
    // 获取成员信息
    const member = await getMemberById(user.id)
    
    if (!member) {
      console.log('未找到成员信息，用户ID:', user.id)
      // 成员信息不存在是正常的（可能是新用户），不重定向
      return
    }

    console.log('找到成员信息:', member.name, '所属社区:', member.communities)
    
    if (member.communities.length === 0) {
      console.log('成员未加入任何社区')
      return
    }

    // 获取所有社区信息
    const allCommunities = await getCommunities()
    console.log('所有社区:', allCommunities.map(c => ({ id: c.id, name: c.name, pointName: c.pointName })))
    
    // 找到用户所属的第一个社区（如果有多个，取第一个）
    const community = allCommunities.find(c => member.communities.includes(c.id))
    
    if (community) {
      console.log('找到用户社区:', community.name, '积分名称:', community.pointName)
      userCommunity.value = community
      
      // 确保 communityStore 也设置了当前社区（如果还没有设置）
      if (!communityStore.currentCommunityId) {
        await communityStore.setCurrentCommunity(community.id)
        console.log('已设置 communityStore 当前社区:', community.id)
      }
    } else {
      console.log('未找到匹配的社区信息')
    }
  } catch (error) {
    console.error('Failed to load user community:', error)
    // 错误时也检查是否需要登录
    if (!userStore.isAuthenticated) {
      router.push('/auth/login')
    }
  }
}

// 加载社区交易记录
const loadCommunityTransactions = async () => {
  // 优先使用 communityStore 的社区ID，如果没有则使用 userCommunity 的ID
  let communityId = communityStore.currentCommunityId
  
  if (!communityId && userCommunity.value) {
    communityId = userCommunity.value.id
    console.log('使用 userCommunity 的社区ID:', communityId)
    // 同时设置到 communityStore
    await communityStore.setCurrentCommunity(communityId)
  }
  
  if (!communityId) {
    console.log('没有可用的社区ID，无法加载社区交易记录')
    communityTransactions.value = []
    return
  }
  
  console.log('开始加载社区交易记录，社区ID:', communityId)
  
  try {
    const transactions = await getCommunityTransactions(communityId)
    console.log('成功加载社区交易记录，数量:', transactions.length)
    console.log('交易记录详情:', transactions.map(tx => ({
      id: tx.id,
      userName: tx.userName,
      title: tx.title,
      amount: tx.amount,
      currency: tx.currency,
      date: tx.date
    })))
    communityTransactions.value = transactions
  } catch (error) {
    console.error('Failed to load community transactions:', error)
    communityTransactions.value = []
  }
}

// 监听社区变化
watch(() => communityStore.currentCommunityId, async (newId) => {
  if (newId) {
    await loadCommunityData(newId)
    // 如果当前在社区圈标签，重新加载社区交易记录
    if (activeTab.value === 'COMMUNITY') {
      await loadCommunityTransactions()
    }
  } else {
    community.value = null
    members.value = []
  }
}, { immediate: true })

// 监听 store 中的社区详情变化
watch(() => communityStore.currentCommunity, (newCommunity) => {
  if (newCommunity) {
    community.value = newCommunity
  }
}, { immediate: true })

// 监听 userCommunity 变化
watch(() => userCommunity.value?.id, (newId) => {
  console.log('userCommunity ID变化:', newId)
  if (activeTab.value === 'COMMUNITY' && newId) {
    loadCommunityTransactions()
  }
})

// 监听标签切换
watch(activeTab, (newTab) => {
  if (newTab === 'COMMUNITY') {
    loadCommunityTransactions()
  }
})

onMounted(async () => {
  // 确保用户信息已加载
  await userStore.getUser()
  
  // 初始化社区 store
  await communityStore.initialize()
  
  // 加载用户社区信息（这会确保 communityStore 有社区ID）
  await loadUserCommunity()
  
  // 如果有当前社区，加载数据
  if (communityStore.currentCommunityId) {
    await loadCommunityData(communityStore.currentCommunityId)
  }
  
  // 如果当前在社区圈标签，加载社区交易记录
  if (activeTab.value === 'COMMUNITY') {
    await loadCommunityTransactions()
  }
})
</script>

<style scoped>
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
