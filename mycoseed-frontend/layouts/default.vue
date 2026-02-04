<template>
  <div class="min-h-screen flex flex-col font-vt323 bg-mario-sky bg-[size:40px_40px]" style="background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);">
    <!-- 桌面端Header：包含登出按钮 -->
    <LayoutHeader 
      :current-page="currentPage" 
      @navigate="handleNavigate"
      class="hidden md:flex"
    />
    
    <!-- Mobile Header (Simplified) -->
    <div class="md:hidden h-14 bg-white border-b-4 border-black flex items-center justify-between sticky top-0 z-50 shadow-pixel px-4">
      <div class="relative flex-1">
        <button
          class="flex items-center gap-2 w-full"
          @click="toggleMobileDropdown"
          @blur="handleMobileBlur"
        >
          <div class="w-8 h-8 bg-mario-red border-2 border-black flex items-center justify-center shadow-pixel">
            <img src="/images/icons/myco-seed-logo.svg" alt="MycoSeed" class="w-5 h-5" style="image-rendering: pixelated;" />
          </div>
          <span class="font-pixel text-base flex-1 text-left">
            {{ mobileCurrentCommunityName || '选择社区' }}
          </span>
          <svg 
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': isMobileDropdownOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <!-- Mobile Dropdown Menu -->
        <Transition name="dropdown">
          <div 
            v-if="isMobileDropdownOpen" 
            class="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black shadow-pixel z-50 max-h-96 overflow-y-auto"
          >
            <div class="p-2 space-y-1">
              <div 
                v-for="community in mobileCommunities" 
                :key="community.id"
                class="p-3 cursor-pointer hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
                :class="{ 'bg-mario-red/10 border-black': community.id === mobileCommunityStore.currentCommunityId }"
                @click="selectMobileCommunity(community.id)"
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
      
      <!-- 手机端登出按钮 -->
      <button
        v-if="mobileUserStore.isAuthenticated"
        @click="handleMobileLogoutClick"
        class="w-10 h-10 flex items-center justify-center border-2 border-black bg-red-500 hover:bg-red-600 text-white font-pixel text-xs transition-all active:scale-95 shadow-pixel ml-2"
        title="登出"
      >
        🚪
      </button>
    </div>
    
    <!-- 主内容区域：确保在所有设备上都有足够的底部空间，避免被导航栏遮挡 -->
    <!-- 手机端：为底部导航留出空间（pb-20 = 80px） -->
    <!-- 桌面端：为底部导航留出空间（pb-20 = 80px，因为底部导航固定在底部） -->
    <main class="relative flex-grow w-full md:container md:mx-auto px-2 md:px-4 py-4 md:py-8 md:max-w-6xl pb-20">
      <!-- Floating Cloud Decoration (CSS based) -->
      <div class="absolute top-10 left-10 w-16 h-8 bg-white/80 hidden md:block pixel-cloud opacity-50 -z-10"></div>
      <div class="absolute top-24 right-20 w-24 h-10 bg-white/80 hidden md:block pixel-cloud opacity-60 -z-10"></div>

      <NuxtPage />
    </main>

    <!-- 底部导航：手机端固定，桌面端也显示 -->
    <LayoutBottomNav />

    <!-- Footer Ground (Desktop Only) -->
    <footer class="h-16 w-full bg-mario-ground border-t-4 border-black relative overflow-hidden mt-auto hidden md:block">
      <!-- Grass Top -->
      <div class="absolute top-0 left-0 right-0 h-4 bg-mario-green border-b-4 border-black"></div>
      <!-- Brick Pattern overlay -->
      <div class="w-full h-full opacity-20" style="background-image: linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000); background-size: 20px 20px; background-position: 0 0, 10px 10px;"></div>
      
      <div class="absolute bottom-2 w-full text-center text-white/50 text-xs font-pixel">
        © 2024 MYCOSEED • PRESS START
      </div>
    </footer>
    
    <!-- 手机端登出确认弹窗 -->
    <Transition name="modal">
      <div 
        v-if="showMobileLogoutModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showMobileLogoutModal = false"
      >
        <div class="bg-white border-4 border-black shadow-pixel p-6 max-w-sm w-full mx-4">
          <h3 class="font-pixel text-xl mb-4">确认登出</h3>
          <p class="font-vt323 text-gray-700 mb-6">确定要登出吗？登出后需要重新登录。</p>
          <div class="flex gap-3">
            <button
              @click="confirmMobileLogout"
              class="flex-1 px-4 py-2 bg-mario-red text-white border-2 border-black font-pixel text-sm hover:bg-red-600 transition-colors"
            >
              确认登出
            </button>
            <button
              @click="showMobileLogoutModal = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-black border-2 border-black font-pixel text-sm hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCommunityStore } from '~/stores/community'
import { useUserStore } from '~/stores/user'
import type { Community } from '~/utils/api'

const router = useRouter()
const mobileCommunityStore = useCommunityStore()
const mobileUserStore = useUserStore()
const currentPage = ref('hub')
const isMobileDropdownOpen = ref(false)
const mobileCommunities = ref<Community[]>([])
const showMobileLogoutModal = ref(false)

const mobileCurrentCommunityName = computed(() => {
  return mobileCommunityStore.currentCommunity?.name || null
})

const toggleMobileDropdown = () => {
  isMobileDropdownOpen.value = !isMobileDropdownOpen.value
}

const handleMobileBlur = (e: FocusEvent) => {
  setTimeout(() => {
    const target = e.relatedTarget as HTMLElement | null
    const currentTarget = e.currentTarget as HTMLElement | null
    if (!target || (currentTarget && !currentTarget.contains(target))) {
      isMobileDropdownOpen.value = false
    }
  }, 200)
}

const selectMobileCommunity = async (id: number) => {
  await mobileCommunityStore.setCurrentCommunity(id)
  isMobileDropdownOpen.value = false
  router.push('/')
}

const loadMobileCommunities = async () => {
  try {
    mobileCommunities.value = await mobileCommunityStore.getAllCommunities()
  } catch (error) {
    console.error('Failed to load communities:', error)
  }
}

const handleMobileLogoutClick = () => {
  showMobileLogoutModal.value = true
}

const confirmMobileLogout = async () => {
  showMobileLogoutModal.value = false
  // 执行登出
  await mobileUserStore.signout()
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

onMounted(async () => {
  await mobileCommunityStore.initialize()
  await loadMobileCommunities()
})

const handleNavigate = (page: string) => {
  currentPage.value = page
  const targetPath = page === 'hub' ? '/' : '/' + page

  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/af348509-5d27-4b86-baea-9c27926471bf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'nav-structure',
        hypothesisId: 'H1',
        location: 'layouts/default.vue:handleNavigate',
        message: 'handleNavigate called',
        data: { page, targetPath },
        timestamp: Date.now()
      })
    }).catch(() => {})
  } catch (error) {
    // 静默忽略分析服务连接错误
  }
  // #endregion

  // Map 'hub' to root index
  navigateTo(targetPath)
}
</script>

<style scoped>
.pixel-cloud {
  clip-path: polygon(
    20% 0%, 80% 0%, 
    100% 20%, 100% 80%, 
    80% 100%, 20% 100%, 
    0% 80%, 0% 20%
  );
}

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
