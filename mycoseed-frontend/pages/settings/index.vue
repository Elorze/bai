<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <button
        class="p-2 -ml-2 rounded-xl hover:bg-input-bg text-text-title transition-colors"
        @click="router.back()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-lg font-bold text-text-title">设置</h1>
      <div class="w-9" />
    </header>

    <!-- 用户信息区 -->
    <div class="px-4 pt-6 pb-4 flex flex-col items-center">
      <PixelAvatar
        v-if="user?.avatar"
        :src="user.avatar"
        size="xl"
      />
      <PixelAvatar
        v-else
        :seed="user?.name || user?.id || 'user'"
        size="xl"
      />
      <h2 class="mt-3 text-xl font-bold text-text-title">{{ user?.name || '未设置昵称' }}</h2>
      <p class="mt-1 text-sm text-text-placeholder">u1 • {{ shortAddress }}</p>
    </div>

    <!-- 账号 -->
    <section class="px-4 mt-6">
      <h3 class="text-sm font-bold text-text-body mb-2">账号</h3>
      <div class="bg-card rounded-2xl shadow-soft overflow-hidden border border-border">
        <NuxtLink
          to="/profile/setup"
          class="flex items-center gap-3 px-4 py-4 border-b border-border active:bg-input-bg transition-colors"
        >
          <span class="w-10 h-10 rounded-xl bg-input-bg flex items-center justify-center text-xl">👤</span>
          <div class="flex-1 text-left">
            <div class="font-medium text-text-title">个人信息</div>
            <div class="text-sm text-text-placeholder">点击修改基本信息</div>
          </div>
          <svg class="w-5 h-5 text-text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
        <NuxtLink
          :to="walletLink"
          class="flex items-center gap-3 px-4 py-4 active:bg-input-bg transition-colors"
        >
          <span class="w-10 h-10 rounded-xl bg-input-bg flex items-center justify-center text-xl">👛</span>
          <div class="flex-1 text-left">
            <div class="font-medium text-text-title">数字钱包</div>
            <div class="text-sm text-text-placeholder">查看资产与交易记录</div>
          </div>
          <svg class="w-5 h-5 text-text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </section>

    <!-- 通用 -->
    <section class="px-4 mt-6">
      <h3 class="text-sm font-bold text-text-body mb-2">通用</h3>
      <div class="bg-card rounded-2xl shadow-soft overflow-hidden border border-border">
        <div class="flex items-center gap-3 px-4 py-4 border-b border-border cursor-not-allowed opacity-70">
          <span class="w-10 h-10 rounded-xl bg-input-bg flex items-center justify-center text-xl">🔔</span>
          <div class="flex-1 text-left">
            <div class="font-medium text-text-title">消息通知</div>
            <div class="text-sm text-text-placeholder">管理推送消息</div>
          </div>
          <svg class="w-5 h-5 text-text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div class="flex items-center gap-3 px-4 py-4 border-b border-border cursor-not-allowed opacity-70">
          <span class="w-10 h-10 rounded-xl bg-input-bg flex items-center justify-center text-xl">🌙</span>
          <div class="flex-1 text-left">
            <div class="font-medium text-text-title">外观设置</div>
            <div class="text-sm text-text-placeholder">切换深色模式</div>
          </div>
          <span class="text-sm text-text-placeholder">浅色</span>
          <svg class="w-5 h-5 text-text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div class="flex items-center gap-3 px-4 py-4 cursor-not-allowed opacity-70">
          <span class="w-10 h-10 rounded-xl bg-input-bg flex items-center justify-center text-xl">⚙️</span>
          <div class="flex-1 text-left">
            <div class="font-medium text-text-title">系统设置</div>
            <div class="text-sm text-text-placeholder">语言、缓存管理</div>
          </div>
          <svg class="w-5 h-5 text-text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </section>

    <!-- 其他 -->
    <section class="px-4 mt-6">
      <h3 class="text-sm font-bold text-text-body mb-2">其他</h3>
      <div class="bg-card rounded-2xl shadow-soft overflow-hidden border border-border">
        <div class="flex items-center gap-3 px-4 py-4 cursor-not-allowed opacity-70">
          <span class="w-10 h-10 rounded-xl bg-input-bg flex items-center justify-center text-xl">❓</span>
          <div class="flex-1 text-left">
            <div class="font-medium text-text-title">帮助与反馈</div>
            <div class="text-sm text-text-placeholder">FAQ、联系我们</div>
          </div>
          <svg class="w-5 h-5 text-text-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </section>

    <!-- 退出登录 -->
    <div class="px-4 mt-8">
      <button
        class="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-destructive text-white font-medium shadow-soft hover:opacity-90 transition-opacity"
        @click="showLogoutModal = true"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        退出登录
      </button>
    </div>

    <!-- 登出确认弹窗 -->
    <Transition name="modal">
      <div
        v-if="showLogoutModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showLogoutModal = false"
      >
        <div class="bg-card rounded-3xl shadow-soft-lg p-6 max-w-sm w-full mx-4">
          <h3 class="text-xl font-bold text-text-title mb-4">确认登出</h3>
          <p class="text-text-body mb-6">确定要登出吗？登出后需要重新登录。</p>
          <div class="flex gap-3">
            <PixelButton variant="primary" block @click="confirmLogout">确认登出</PixelButton>
            <PixelButton variant="secondary" block @click="showLogoutModal = false">取消</PixelButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const router = useRouter()
const userStore = useUserStore()
const showLogoutModal = ref(false)

const user = computed(() => userStore.user)

const shortAddress = computed(() => {
  const id = user.value?.id
  if (!id || typeof id !== 'string') return '—'
  if (id.length <= 12) return id
  return `${id.slice(0, 6)}...${id.slice(-4)}`
})

const walletLink = computed(() => {
  const id = user.value?.id
  if (!id) return '/'
  return `/member/${id}`
})

const confirmLogout = async () => {
  showLogoutModal.value = false
  await userStore.signout()
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
  }
  await router.replace('/auth/login')
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login'
  }
}
</script>

<style scoped>
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
