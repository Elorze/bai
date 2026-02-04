<template>
  <!-- 手机端：固定在底部 -->
  <div class="fixed bottom-0 left-0 w-full bg-black text-white border-t-4 border-white z-50 md:hidden">
    <div class="flex justify-around items-center h-16">
      <div 
        v-for="item in navItems" 
        :key="item.path"
        class="flex flex-col items-center justify-center w-full h-full cursor-pointer active:bg-gray-800 transition-colors"
        @click="navigateTo(item.path)"
      >
        <span class="text-xl mb-1">{{ item.icon }}</span>
        <span class="font-pixel text-[10px]">{{ item.label }}</span>
      </div>
    </div>
  </div>
  
  <!-- 桌面端：固定在底部 -->
  <div class="hidden md:block fixed bottom-0 left-0 w-full bg-black text-white border-t-4 border-white z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-around items-center h-16">
        <div 
          v-for="item in navItems" 
          :key="item.path"
          class="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-800 transition-colors"
          @click="navigateTo(item.path)"
        >
          <span class="text-xl mb-1">{{ item.icon }}</span>
          <span class="font-pixel text-[10px]">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const userStore = useUserStore()

// 计算当前用户的 member 路径
const getMyProfilePath = () => {
  const user = userStore.user
  if (user?.id) {
    // 直接使用UUID，不要转换为数字
    return `/member/${user.id}`
  }
  return '/member/1' // 默认值（未登录时）
}

const navItems = computed(() => [
  // 与桌面端 Header 保持一致：任务页作为主要入口
  { label: '社区广场', path: '/', icon: '🗺️' },
  { label: '任务', path: '/tasks', icon: '📋' },
  { label: '活动', path: '/activities-feed', icon: '📅' },
  { label: '我的', path: getMyProfilePath(), icon: '👤' }
])

const navigateTo = (path: string) => {
  // #region agent log
  try {
  fetch('http://127.0.0.1:7242/ingest/af348509-5d27-4b86-baea-9c27926471bf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'nav-structure',
      hypothesisId: 'H1',
      location: 'components/layout/BottomNav.vue:navigateTo',
      message: 'BottomNav navigateTo called',
      data: { path },
      timestamp: Date.now()
    })
  }).catch(() => {})
  } catch (error) {
    // 静默忽略分析服务连接错误
  }
  // #endregion

  router.push(path)
}
</script>


