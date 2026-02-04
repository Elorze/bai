<template>
  <header class="h-16 md:h-20 border-b-4 border-black bg-white sticky top-0 z-50 shadow-pixel flex-shrink-0">
    <div class="w-full md:max-w-7xl md:mx-auto px-2 md:px-4 h-full flex items-center justify-between">
      <!-- Community Switcher -->
      <div class="relative">
        <button
          class="flex items-center gap-3 cursor-pointer group"
          @click="toggleDropdown"
          @blur="handleBlur"
        >
          <div class="w-12 h-12 bg-mario-red border-4 border-black flex items-center justify-center shadow-pixel group-hover:-translate-y-1 transition-transform">
            <img src="/images/icons/myco-seed-logo.svg" alt="MycoSeed" class="w-8 h-8" style="image-rendering: pixelated;" />
          </div>
          <div class="hidden md:block text-left">
            <h1 class="font-pixel text-black text-sm md:text-base leading-tight">
              {{ currentCommunityName || '选择社区' }}
            </h1>
            <p class="font-vt323 text-gray-600 text-sm">切换频道</p>
          </div>
          <div class="ml-2">
            <svg 
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': isDropdownOpen }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </button>
        
        <!-- Dropdown Menu -->
        <Transition name="dropdown">
          <div 
            v-if="isDropdownOpen" 
            class="absolute top-full left-0 mt-2 w-64 bg-white border-4 border-black shadow-pixel z-50"
          >
            <div class="p-2 space-y-1 max-h-96 overflow-y-auto">
              <div 
                v-for="community in communities" 
                :key="community.id"
                class="p-3 cursor-pointer hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
                :class="{ 'bg-mario-red/10 border-black': community.id === communityStore.currentCommunityId }"
                @click="selectCommunity(community.id)"
              >
                <div class="font-pixel text-sm font-bold">{{ community.name }}</div>
                <div class="font-vt323 text-xs text-gray-600 mt-1">{{ community.description }}</div>
                <div class="font-vt323 text-xs text-gray-500 mt-1">
                  {{ community.pointName || '积分' }}: {{ community.totalPoints }}
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Navigation -->
      <nav class="flex items-center gap-4">
        
        <!-- Marketplace (Replacing Level Bar) -->
        <PixelButton
           variant="warning"
           size="sm"
           @click="navigateTo('tasks')"
        >
           🛒 商城
        </PixelButton>

        <!-- Wallet -->
        <PixelButton
          :variant="currentPage === 'wallet' ? 'primary' : 'secondary'"
          size="sm"
          @click="navigateTo('wallet')"
        >
          👛 钱包
        </PixelButton>

        <!-- User Avatar and Logout -->
        <div class="flex items-center gap-2">
          <div 
            v-if="userStore.isAuthenticated"
            class="cursor-pointer hover:scale-110 transition-transform"
            @click="navigateTo('profile')"
            title="个人主页"
          >
            <PixelAvatar 
              v-if="userStore.user?.avatar" 
              :src="userStore.user.avatar" 
              size="md" 
            />
            <PixelAvatar 
              v-else 
              :seed="userStore.user?.name || userStore.user?.id || 'user'" 
              size="md" 
            />
          </div>
          
          <!-- Logout Button - 始终显示（如果已登录） -->
          <button
            v-if="userStore.isAuthenticated"
            @click="handleLogoutClick"
            class="w-10 h-10 flex items-center justify-center border-2 border-black bg-red-500 hover:bg-red-600 text-white font-pixel text-xs transition-all hover:scale-110 shadow-pixel flex-shrink-0"
            title="登出"
          >
            🚪
          </button>
          
          <!-- 登录按钮（如果未登录） -->
          <button
            v-else
            @click="router.push('/auth/login')"
            class="px-4 py-2 border-2 border-black bg-mario-green hover:bg-green-600 text-white font-pixel text-xs transition-all hover:scale-110 shadow-pixel"
            title="登录"
          >
            登录
          </button>
        </div>
      </nav>
      
      <!-- Logout Confirmation Modal -->
      <Transition name="modal">
        <div 
          v-if="showLogoutModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          @click.self="showLogoutModal = false"
        >
          <div class="bg-white border-4 border-black shadow-pixel p-6 max-w-sm w-full mx-4">
            <h3 class="font-pixel text-xl mb-4">确认登出</h3>
            <p class="font-vt323 text-gray-700 mb-6">确定要登出吗？登出后需要重新登录。</p>
            <div class="flex gap-3">
              <PixelButton
                variant="primary"
                @click="confirmLogout"
                :block="true"
              >
                确认登出
              </PixelButton>
              <PixelButton
                variant="secondary"
                @click="showLogoutModal = false"
                :block="true"
              >
                取消
              </PixelButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import PixelButton from '~/components/pixel/PixelButton.vue'
import PixelAvatar from '~/components/pixel/PixelAvatar.vue'
import { useCommunityStore } from '~/stores/community'
import { useUserStore } from '~/stores/user'
import type { Community } from '~/utils/api'

interface Props {
  currentPage?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  navigate: [page: string]
}>()

const router = useRouter()
const communityStore = useCommunityStore()
const userStore = useUserStore()
const isDropdownOpen = ref(false)
const communities = ref<Community[]>([])
const showLogoutModal = ref(false)

const currentCommunityName = computed(() => {
  return communityStore.currentCommunity?.name || null
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleBlur = (e: FocusEvent) => {
  // 延迟关闭，以便点击事件能够触发
  setTimeout(() => {
    const target = e.relatedTarget as HTMLElement | null
    const currentTarget = e.currentTarget as HTMLElement | null
    if (!target || (currentTarget && !currentTarget.contains(target))) {
      isDropdownOpen.value = false
    }
  }, 200)
}

const selectCommunity = async (id: number) => {
  await communityStore.setCurrentCommunity(id)
  isDropdownOpen.value = false
  // 跳转到首页
  router.push('/')
}

const loadCommunities = async () => {
  try {
    communities.value = await communityStore.getAllCommunities()
  } catch (error) {
    console.error('Failed to load communities:', error)
  }
}

// 监听社区变化，更新下拉菜单
watch(() => communityStore.currentCommunityId, () => {
  // 可以在这里添加额外的逻辑
})

onMounted(async () => {
  // 初始化社区 store
  await communityStore.initialize()
  // 加载社区列表
  await loadCommunities()
  // 确保用户信息已加载（用于显示登出按钮）
  if (!userStore.user) {
    await userStore.getUser()
  }
})

const navigateTo = (page: string) => {
  // #region agent log
  try {
  fetch('http://127.0.0.1:7242/ingest/af348509-5d27-4b86-baea-9c27926471bf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'nav-structure',
      hypothesisId: 'H1',
      location: 'components/layout/Header.vue:navigateTo',
      message: 'Header navigateTo called',
      data: { page, currentPage: props.currentPage },
      timestamp: Date.now()
    })
  }).catch(() => {})
  } catch (error) {
    // 静默忽略分析服务连接错误
  }
  // #endregion

  if (page === 'profile') {
    // 使用当前登录用户的 ID
    const user = userStore.user
    if (user?.id) {
      // 直接使用UUID，不要转换为数字
      emit('navigate', `member/${user.id}`)
    } else {
      // 未登录时跳转到登录页
      router.push('/auth/login')
    }
  } else {
    emit('navigate', page)
  }
}

const handleLogoutClick = () => {
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  showLogoutModal.value = false
  // 执行登出
  await userStore.signout()
  // 清除所有本地存储
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
  }
  // 使用 replace 而不是 push，防止返回
  await router.replace('/auth/login')
  // 强制刷新页面，清除所有状态
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login'
  }
}
</script>
