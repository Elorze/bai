<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- 桌面端Header：包含登出按钮 -->
    <LayoutHeader 
      :current-page="currentPage" 
      @navigate="handleNavigate"
      class="hidden md:flex"
    />
    
    <!-- Mobile Header (Simplified) -->
    <div class="md:hidden h-14 bg-card border-b border-border flex items-center justify-between sticky top-0 z-50 px-4">
      <div class="relative flex-1">
        <button
          class="flex items-center gap-2 w-full"
          @click="toggleMobileDropdown"
          @blur="handleMobileBlur"
        >
          <div class="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-soft">
            <img src="/images/icons/myco-seed-logo.svg" alt="MycoSeed" class="w-5 h-5" />
          </div>
          <span class="font-medium text-text-title text-base flex-1 text-left">
            {{ mobileCurrentCommunityName || '选择社区' }}
          </span>
          <svg 
            class="w-4 h-4 transition-transform text-text-body"
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
            class="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-soft-lg z-50 max-h-96 overflow-y-auto border border-border"
          >
            <div class="p-2 space-y-1">
              <div 
                v-for="community in mobileCommunities" 
                :key="community.id"
                class="p-3 rounded-xl cursor-pointer hover:bg-input-bg transition-all"
                :class="{ 'bg-primary/10': community.id === mobileCommunityStore.currentCommunityId }"
                @click="selectMobileCommunity(community.id)"
              >
                <div class="font-bold text-sm text-text-title">{{ community.name }}</div>
                <div class="text-xs text-text-body mt-1">{{ community.description }}</div>
                <div class="text-xs text-text-placeholder mt-1">
                  {{ community.pointName || '积分' }}: {{ community.totalPoints }}
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      
      <!-- 手机端设置按钮 -->
      <NuxtLink
        v-if="mobileUserStore.isAuthenticated"
        to="/settings"
        class="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-medium text-sm transition-all active:scale-95 shadow-soft ml-2"
        title="设置"
      >
        ⚙️
      </NuxtLink>
    </div>
    
    <!-- 主内容区域 -->
    <main class="relative flex-grow w-full md:container md:mx-auto px-2 md:px-4 py-4 md:py-8 md:max-w-6xl pb-20">
      <NuxtPage />
    </main>

    <!-- 底部导航 -->
    <LayoutBottomNav />

    <!-- Footer (Desktop Only) -->
    <footer class="h-14 w-full bg-muted border-t border-border mt-auto hidden md:flex items-center justify-center">
      <span class="text-sm text-text-body">© 2024 MycoSeed</span>
    </footer>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

onMounted(async () => {
  await mobileCommunityStore.initialize()
  await loadMobileCommunities()
})

const handleNavigate = (page: string) => {
  currentPage.value = page
  const targetPath = page === 'hub' ? '/' : '/' + page
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
  } catch (error) {}
  navigateTo(targetPath)
}
</script>

<style scoped>
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
