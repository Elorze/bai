<template>
  <div class="min-h-screen pb-24">
    <!-- 顶部个人信息区域 -->
    <div class="mx-4 mt-4">
      <!-- 翻转卡片容器 -->
      <div 
        class="flip-card-container"
        :class="{ 'is-flipped': isFlipped && !isEditing }"
        @click="!isEditing && toggleFlip()"
      >
        <div class="flip-card-inner">
          <!-- 卡片正面 -->
          <div class="flip-card-face flip-card-front bg-white border border-border rounded-2xl shadow-soft p-6 pb-8 relative">
            <!-- 编辑按钮（仅「我的」页面显示） -->
            <div v-if="isMyProfile" class="absolute top-4 right-4 z-20">
              <button
                @click.stop="isEditing = !isEditing"
                class="w-10 h-10 bg-gray-100 border border-border rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span v-if="!isEditing" class="text-xl">✏️</span>
                <span v-else class="text-xl">❌</span>
              </button>
            </div>
            <div class="flex flex-col items-center gap-4">

        <!-- 头像与等级 -->
        <div class="relative">
          <div v-if="!isEditing" class="relative">
            <!-- 优先使用 avatar URL,如果没有则使用 pixelavatar -->
            <PixelAvatar 
            v-if="member?.avatar"
            :src="member.avatar"
            size="xl"
            />
            <PixelAvatar
            v-else
            :seed="member?.name || member?.avatarSeed || 'user'" size="xl" />
            <div class="absolute -bottom-2 -right-2 bg-black text-white text-xs font-bold px-2 py-1 border-2 border-white">
              LV. {{ memberLevel }}
            </div>
          </div>
          <div v-else class="relative">
            <PixelAvatar
              v-if="editingForm.avatar"
              :src="editingForm.avatar"
              size="xl"
            />
            <PixelAvatar 
            v-else
            :seed="editingForm.name || 'user'" size="xl" />
            <button
              @click="changeAvatar"
              class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold hover:bg-black/70 transition-colors"
            >
              更换头像
            </button>
          </div>
        </div>

        <!-- 姓名与简介 -->
        <div class="text-center w-full max-w-xs">
          <div v-if="!isEditing">
            <h1 class="font-bold text-2xl mb-1">{{ member?.name }}</h1>
            <!-- 简介显示 -->
            <div v-if="member?.bio" class="text-sm text-gray-600  mt-2 px-4 max-w-xs mx-auto">
              {{ member.bio }}
            </div>
          </div>
          <div v-else class="space-y-3">
            <div>
              <label class="block font-bold text-xs uppercase mb-1 text-black text-left">名字</label>
              <input
                v-model="editingForm.name"
                type="text"
                class="w-full h-10 px-3 bg-white border border-border rounded-2xl shadow-soft-sm  text-base focus:outline-none focus:shadow-soft focus:-translate-y-1 transition-all"
                placeholder="输入名字"
              />
            </div>
            <!-- 简介编辑 -->
            <div>
              <label class="block font-bold text-xs uppercase mb-1 text-black text-left">简介</label>
              <textarea
                v-model="editingForm.bio"
                rows="3"
                class="w-full px-3 py-2 bg-white border border-border rounded-2xl shadow-soft-sm  text-base focus:outline-none focus:shadow-soft focus:-translate-y-1 transition-all resize-none"
                placeholder="输入简介"
              />
            </div>
          </div>
        </div>

        <!-- 编辑模式下的保存/取消按钮 -->
        <div v-if="isEditing" class="flex gap-4 mt-2 w-full max-w-xs">
          <PixelButton block variant="success" @click="saveProfile">保存</PixelButton>
          <PixelButton block variant="secondary" @click="cancelEdit">取消</PixelButton>
        </div>

        <!-- 非编辑模式下的操作按钮（已移除，发布任务按钮移到任务tab） -->
            </div>
          </div>

          <!-- 卡片背面 -->
          <div class="flip-card-face flip-card-back bg-white border border-border rounded-2xl shadow-soft p-6 pb-8 relative">
            <div class="flex flex-col gap-4">
              <!-- 钱包地址和链选择按钮（左上方）+ 发送按钮（右上角） -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 flex-1">
                  <!-- Chain Switch Button -->
                  <button 
                    @click.stop="showChainSelector = true"
                    class="w-10 h-10 bg-destructive border border-border rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-soft hover:scale-105 transition-transform"
                  >
                    {{ currentChain.shortName }}
                  </button>
                  
                  <!-- Address Display -->
                  <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-border rounded-2xl shadow-soft-sm flex-1">
                    <PixelAvatar :seed="walletAddress || 'user'" size="sm" />
                    <span class=" text-lg">{{ truncatedAddress }}</span>
                    <button 
                      @click.stop="copyAddress"
                      class="text-gray-400 hover:text-black transition-colors cursor-pointer"
                      title="复制地址"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- 发送按钮（右上角） -->
                <PixelButton 
                  @click.stop="showSendModal = true"
                  variant="primary" 
                  size="sm"
                  class="flex-shrink-0"
                >
                  <div class="flex items-center gap-1">
                    <span class="text-base">📤</span>
                    <span>转账</span>
                  </div>
                </PixelButton>
              </div>

              <!-- 二维码 -->
              <div class="flex flex-col items-center gap-4 mt-4">
                <div class="relative">
                  <div v-if="qrCodeUrl" class="w-32 h-32 bg-white border-4 border-black p-2">
                    <img :src="qrCodeUrl" alt="QR Code" class="w-full h-full image-pixelated" />
                  </div>
                  <div v-else class="w-32 h-32 bg-gray-100 border-4 border-black flex items-center justify-center">
                    <span class="text-gray-400  text-sm">加载中...</span>
                  </div>
                </div>

                <!-- 社区积分显示（替换原来的姓名位置） -->
                <div v-if="userCommunity" class="flex flex-col items-center gap-2 w-full max-w-xs">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-200 border border-border rounded-2xl flex items-center justify-center text-xl shadow-soft">
                      {{ userCommunity.pointName === '零废弃积分' ? '♻️' : '🌾' }}
                    </div>
                    <div class="text-center">
                      <div class="font-bold text-xs text-green-600">{{ userCommunity.pointName }}</div>
                      <div class=" text-2xl">{{ formatPoints(userCommunityPoints) }} {{ getPointAbbr(userCommunity.pointName) }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center w-full max-w-xs">
                  <div class="text-gray-400  text-sm">未加入任何社区</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Modal -->
    <div v-if="showSendModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div class="w-full max-w-md">
        <PixelCard>
          <template #header>
            <div class="flex justify-between items-center">
              <span>发送资产</span>
              <button @click="closeSendModal" class="hover:text-red-500">✕</button>
            </div>
          </template>
          
          <div class="space-y-4 py-4">
            <div>
              <label class="block font-bold text-xs mb-2">接收方 (地址 / 手机号)</label>
              <div class="flex gap-2">
                <input 
                  v-model="sendForm.recipient" 
                  type="text" 
                  placeholder="0x... or 138..." 
                  class="flex-1 p-3  text-xl border border-border rounded-2xl shadow-soft-sm focus:outline-none focus:translate-y-1 focus:shadow-none transition-all"
                >
                <button 
                  @click="openScanner" 
                  class="px-4 py-3 bg-white border border-border rounded-2xl shadow-soft-sm hover:bg-gray-100 transition-colors font-bold text-xs"
                  title="扫描二维码"
                >
                  📷
                </button>
                <button 
                  @click="showContacts = true" 
                  class="px-4 py-3 bg-white border border-border rounded-2xl shadow-soft-sm hover:bg-gray-100 transition-colors font-bold text-xs"
                  title="通讯录"
                >
                  📇
                </button>
              </div>
            </div>
            <div>
              <label class="block font-bold text-xs mb-2">金额</label>
              <input 
                v-model="sendForm.amount" 
                type="number" 
                step="0.000001"
                placeholder="0.00" 
                class="w-full p-3  text-xl border border-border rounded-2xl shadow-soft-sm focus:outline-none focus:translate-y-1 focus:shadow-none transition-all"
              >
            </div>
            <div>
              <label class="block font-bold text-xs mb-2">备注信息</label>
              <input 
                v-model="sendForm.note" 
                type="text" 
                placeholder="可选，添加备注信息..." 
                class="w-full p-3  text-lg border border-border rounded-2xl shadow-soft-sm focus:outline-none focus:translate-y-1 focus:shadow-none transition-all"
              >
            </div>
          </div>

          <template #footer>
            <div class="flex gap-4 w-full">
              <PixelButton block variant="secondary" @click="closeSendModal">取消</PixelButton>
              <PixelButton block variant="success" @click="handleSend">确认发送</PixelButton>
            </div>
          </template>
        </PixelCard>
      </div>
    </div>

    <!-- Contacts Modal -->
    <div v-if="showContacts" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div class="w-full max-w-md">
        <PixelCard>
          <template #header>
            <div class="flex justify-between items-center">
              <span>通讯录</span>
              <button @click="showContacts = false" class="hover:text-red-500">✕</button>
            </div>
          </template>
          
          <div class="space-y-2 py-4 max-h-96 overflow-y-auto">
            <div 
              v-for="contact in savedContacts" 
              :key="contact.id"
              @click="selectContact(contact)"
              class="flex items-center justify-between p-3 border border-border rounded-2xl/10 hover:bg-gray-50 hover:border-black cursor-pointer transition-all"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-200 border border-border rounded-2xl flex items-center justify-center text-lg shadow-soft-sm">
                  {{ contact.icon }}
                </div>
                <div>
                  <div class="font-bold text-xs">{{ contact.name }}</div>
                  <div class=" text-sm text-gray-600">{{ contact.address }}</div>
                </div>
              </div>
            </div>
            <div v-if="savedContacts.length === 0" class="text-center py-8 text-gray-400 ">
              暂无保存的地址
            </div>
          </div>

          
          <template #footer>
            <PixelButton block variant="secondary" @click="showContacts = false">关闭</PixelButton>
          </template>
        </PixelCard>
      </div>
    </div>

    <!-- Scanner Modal -->
    <div v-if="showScanner" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div class="w-full max-w-md">
        <PixelCard>
          <template #header>
            <div class="flex justify-between items-center">
              <span>扫描二维码</span>
              <button @click="closeScanner" class="hover:text-red-500">✕</button>
            </div>
          </template>
          
          <div class="py-6">
            <div class="w-full h-64 bg-black/10 border-4 border-dashed border-black flex items-center justify-center mb-4">
              <div class="text-center">
                <div class="text-4xl mb-2">📷</div>
                <div class="font-bold text-xs text-gray-500">请允许访问摄像头权限</div>
                <div class=" text-sm text-gray-400 mt-2">或手动输入地址</div>
              </div>
            </div>
            <div class="space-y-2">
              <label class="block font-bold text-xs">手动输入二维码内容</label>
              <input 
                v-model="scannedAddress" 
                type="text" 
                placeholder="粘贴二维码内容..." 
                class="w-full p-3  text-lg border border-border rounded-2xl shadow-soft-sm focus:outline-none"
                @keyup.enter="applyScannedAddress"
              >
            </div>
          </div>

          <template #footer>
            <div class="flex gap-4 w-full">
              <PixelButton block variant="secondary" @click="closeScanner">取消</PixelButton>
              <PixelButton block variant="primary" @click="applyScannedAddress">确认</PixelButton>
            </div>
          </template>
        </PixelCard>
      </div>
    </div>

    <!-- Chain Selector Modal -->
    <div v-if="showChainSelector" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div class="w-full max-w-sm">
        <PixelCard>
          <template #header>
            <div class="flex justify-between items-center">
              <span>选择网络</span>
              <button @click="showChainSelector = false" class="hover:text-red-500">✕</button>
            </div>
          </template>
          
          <div class="space-y-2 py-4">
            <div 
              v-for="chain in availableChains" 
              :key="chain.id"
              @click="selectChain(chain)"
              :class="[
                'flex items-center justify-between p-3 border-2 cursor-pointer transition-all',
                currentChain.id === chain.id ? 'border-black bg-gray-100' : 'border-black/10 hover:bg-gray-50 hover:border-black'
              ]"
            >
              <div class="flex items-center gap-3">
                <div 
                  :class="[
                    'w-8 h-8 border border-border rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-soft-sm',
                    currentChain.id === chain.id ? 'bg-destructive' : 'bg-gray-400'
                  ]"
                >
                  {{ chain.shortName }}
                </div>
                <div>
                  <div class="font-bold text-xs">{{ chain.name }}</div>
                  <div class=" text-xs text-gray-500">{{ chain.nativeCurrency.symbol }}</div>
                </div>
              </div>
              <div v-if="currentChain.id === chain.id" class="text-green-600 font-bold text-xs">
                ✓
              </div>
            </div>
          </div>

          <template #footer>
            <PixelButton block variant="secondary" @click="showChainSelector = false">关闭</PixelButton>
          </template>
        </PixelCard>
      </div>
    </div>

    <!-- 下方 Tab 区域 -->
    <div class="mt-4 px-4">
      <!-- Tab 导航 -->
      <div class="flex items-center justify-between border-b-2 border-black mb-4 gap-4">
        <div class="flex overflow-x-auto scrollbar-hide flex-1">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 font-bold text-sm whitespace-nowrap transition-colors',
              activeTab === tab.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab 内容 -->
      <div class="min-h-[300px]">
        <!-- HISTORY TAB -->
        <div v-if="activeTab === 'HISTORY'" class="space-y-4">
          <!-- 加载状态 -->
          <div v-if="loadingTasks" class="text-center py-8 text-gray-500 ">
            加载中...
          </div>
          
          <!-- 任务列表 -->
          <div v-else-if="claimedTasks.length > 0">
            <div v-for="task in claimedTasks" :key="task.id" class="bg-white border border-border rounded-2xl p-4 shadow-soft-sm hover:shadow-soft transition-shadow cursor-pointer" @click="navigateTo(`/tasks/${task.id}`)">
              <div class="flex items-start gap-3">
                <div class="text-2xl">{{ getTaskIcon(task.status) }}</div>
                <div class="flex-1">
                  <div class="flex justify-between items-start mb-1">
                    <div class="font-bold  text-lg leading-tight">{{ task.title }}</div>
                    <div v-if="task.status === 'completed'" class="font-bold text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      +{{ task.reward }} {{ taskRewardSymbols[task.id] || '积分' }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2 mb-2">
                    <span :class="getStatusBadgeClass(task.status)">
                      {{ getStatusText(task.status) }}
                    </span>
                    <span v-if="task.status === 'claimed' || task.status === 'unsubmit'" class="font-bold text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      进行中
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatTaskDate(task) }}
                  </div>
                  <div v-if="task.description" class="text-xs text-gray-600 mt-1 line-clamp-2">
                    {{ task.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="text-center py-12">
            <div class="text-4xl mb-4">📋</div>
            <div class=" text-gray-500">还没有领取任何任务</div>
          </div>
        </div>

        <!-- BADGES TAB -->
        <div v-else-if="activeTab === 'BADGES'" class="grid grid-cols-3 gap-3">
          <div v-for="i in 8" :key="i" class="aspect-square bg-white border border-border rounded-2xl flex flex-col items-center justify-center p-2 hover:-translate-y-1 transition-transform">
            <span v-if="i <= 3" class="text-3xl mb-2">🌟</span>
            <span v-else class="text-3xl mb-2 grayscale opacity-30">🔒</span>
            <span class="font-bold text-[10px] text-center text-gray-600">{{ i <= 3 ? '已解锁' : '未解锁' }}</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import PixelAvatar from '~/components/pixel/PixelAvatar.vue'
import PixelButton from '~/components/pixel/PixelButton.vue'
import PixelCard from '~/components/pixel/PixelCard.vue'
import { getMemberById, getCommunities, getMyTasks, getWalletAddressByMemberId, getUserCommunityPoints, addTransaction, getApiBaseUrl, type Task, type Community } from '~/utils/api'
import { getTaskRewardSymbol } from '~/utils/display'
import { useToast } from '~/composables/useToast'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const memberId = route.params.id as string  // UUID是字符串，不需要parseInt
const activeTab = ref('HISTORY')
const isEditing = ref(false)
const isFlipped = ref(false)
const newSkill = ref('')
const userStore = useUserStore()
const toast = useToast()

// 钱包相关状态
const walletAddress = ref('')
const showChainSelector = ref(false)
const showSendModal = ref(false)
const showContacts = ref(false)
const showScanner = ref(false)
const scannedAddress = ref('')

// 转账表单
const sendForm = ref({
  recipient: '',
  amount: '',
  note: ''
})

// 社区积分相关状态
const userCommunity = ref<Community | null>(null)
const userCommunityPoints = ref(0)
const currentChain = ref({
  id: 10,
  name: 'OP Mainnet',
  shortName: 'OP',
  nativeCurrency: {
    symbol: 'ETH'
  }
})

const availableChains = ref([
  {
    id: 10,
    name: 'OP Mainnet',
    shortName: 'OP',
    nativeCurrency: {
      symbol: 'ETH'
    }
  },
  {
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    nativeCurrency: {
      symbol: 'ETH'
    }
  },
  {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    nativeCurrency: {
      symbol: 'ETH'
    }
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: {
      symbol: 'ETH'
    }
  }
])

// 截断的钱包地址
const truncatedAddress = computed(() => {
  if (walletAddress.value.length <= 10) return walletAddress.value
  return `${walletAddress.value.slice(0, 6)}...${walletAddress.value.slice(-4)}`
})

// 二维码URL
const qrCodeUrl = computed(() => {
  if (!walletAddress.value) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${walletAddress.value}`
})

// 判断是否是当前用户自己的页面
const isMyProfile = computed(() => {
  return userStore.user?.id === memberId
})

const tabs = [
  { id: 'HISTORY', label: '任务' },
  { id: 'BADGES', label: '徽章' }
]

// Mock Data
const member = ref<any>(null)
const history = ref<any[]>([])
const communities = ref<any[]>([])
const claimedTasks = ref<Task[]>([])
const loadingTasks = ref(false)
const taskRewardSymbols = ref<Record<number, string>>({}) // 存储每个任务对应的积分符号

// 编辑表单数据
const editingForm = ref({
  name: '',
  title: '',
  bio: '',
  avatar: '',
  skills: [] as string[],
  avatarSeed: ''
})

const memberLevel = computed(() => {
  if (!member.value) return 1
  return Math.floor(member.value.reputation / 100) + 1
})

const navigateTo = (path: string) => {
  router.push(path)
}

// 翻转卡片切换
const toggleFlip = () => {
  if (!isEditing.value) {
    isFlipped.value = !isFlipped.value
  }
}

// 复制地址
const copyAddress = async () => {
  const text = walletAddress.value
  
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      toast.add({ title: '地址已复制到剪贴板', color: 'green' })
      return
    } catch (err) {
      console.error('Clipboard API 失败:', err)
    }
  }
  
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    if (successful) {
      toast.add({ title: '地址已复制到剪贴板', color: 'green' })
    } else {
      throw new Error('execCommand 失败')
    }
  } catch (err) {
    console.error('复制失败:', err)
    toast.add({ title: `请手动复制: ${text}`, color: 'red' })
  }
}

// 选择链
const selectChain = (chain: any) => {
  currentChain.value = chain
  showChainSelector.value = false
  toast.add({ title: `已切换到 ${chain.name}`, color: 'green' })
}

// 转账相关函数
const openScanner = () => {
  showScanner.value = true
}

const closeScanner = () => {
  showScanner.value = false
  scannedAddress.value = ''
}

const applyScannedAddress = () => {
  if (scannedAddress.value) {
    sendForm.value.recipient = scannedAddress.value
    closeScanner()
  }
}

const savedContacts = ref([
  { id: 1, name: 'Mario', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', icon: '🍄' },
  { id: 2, name: 'Luigi', address: '0x9bb3a8c5d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', icon: '🟢' },
  { id: 3, name: 'Peach', address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1', icon: '👑' },
])

const selectContact = (contact: any) => {
  sendForm.value.recipient = contact.address
  showContacts.value = false
}

const closeSendModal = () => {
  showSendModal.value = false
  sendForm.value = {
    recipient: '',
    amount: '',
    note: ''
  }
}

const handleSend = async () => {
  if (!sendForm.value.recipient || !sendForm.value.amount) {
    toast.add({ title: '请填写接收方和金额', color: 'red' })
    return
  }

  // 确保用户信息已加载
  const user = await userStore.getUser()
  if (!user || !user.id) {
    toast.add({ title: '用户信息获取失败', color: 'red' })
    return
  }

  // 创建新交易记录
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  // 获取当前用户的社区积分符号
  let currency = '积分'
  if (userCommunity.value && userCommunity.value.pointName) {
    if (userCommunity.value.pointName === '零废弃积分') {
      currency = 'ZWP'
    } else if (userCommunity.value.pointName === '南塘豆') {
      currency = 'NTD'
    }
  }
  
  const newTransaction = {
    id: 0,
    type: 'out' as const,
    title: sendForm.value.note || '转账',
    date: dateStr,
    amount: parseFloat(sendForm.value.amount),
    currency: currency
  }

  try {
    await addTransaction(user.id, newTransaction)
    toast.add({ title: '转账成功', color: 'green' })
  } catch (error) {
    console.error('保存交易记录失败:', error)
    toast.add({ title: '保存交易记录失败', color: 'red' })
  }

  closeSendModal()
}

// 社区积分相关函数
const formatPoints = (points: number): string => {
  return points.toLocaleString('zh-CN')
}

const getPointAbbr = (pointName: string | undefined): string => {
  if (!pointName) return 'PTS'
  if (pointName === '零废弃积分') return 'ZWP'
  if (pointName === '南塘豆') return 'NTD'
  return 'PTS'
}

const loadUserCommunity = async () => {
  try {
    // 获取成员信息（使用 memberId，因为这是查看其他成员的页面）
    const member = await getMemberById(memberId)
    
    if (!member) {
      console.log('未找到成员信息')
      return
    }
    
    if (member.communities.length === 0) {
      console.log('成员未加入任何社区')
      return
    }

    // 获取所有社区信息
    const allCommunities = await getCommunities()
    
    // 找到用户所属的第一个社区
    const community = allCommunities.find(c => member.communities.includes(c.id))
    
    if (community) {
      userCommunity.value = community
      
      // 从 API 获取真实的社区积分（使用 memberId）
      const points = await getUserCommunityPoints(memberId, community.id)
      userCommunityPoints.value = points
    }
  } catch (error) {
    console.error('Failed to load user community:', error)
  }
}

// 进入编辑模式
const startEdit = () => {
  if (member.value) {
    editingForm.value = {
      name: member.value.name || '',
      bio: member.value.bio || '',
      avatar: member.value.avatar || '',
      avatarSeed: member.value.name || 'user'
    }
  }
  isEditing.value = true
  // 确保进入编辑模式时不翻转卡片
  isFlipped.value = false
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  isFlipped.value = false  // 确保不翻转卡片
}

// 保存编辑
const saveProfile = async () => {
  if (!member.value) return
  
  try {
    // 获取 API 工具
    const { updateUserProfile, getMe } = useApi()
    
    // 获取当前用户信息
    const user = userStore.user
    if (!user?.id) {
      toast.add({
        title: '错误',
        description: '用户信息获取失败',
        color: 'red'
      })
      return
    }
    
    // 调用 API 保存到服务器
    const result = await updateUserProfile(user.id, {
      name: editingForm.value.name.trim(),
      bio: editingForm.value.bio.trim() || undefined,
      avatar: editingForm.value.avatar || undefined
    })
    
    if (result.success) {
      // 更新本地成员信息
      member.value.name = editingForm.value.name
      member.value.bio = editingForm.value.bio
      member.value.avatar = editingForm.value.avatar
  
      
      // 确保不翻转卡片
      isFlipped.value = false
      
      // 显示成功提示
      toast.add({
        title: '保存成功',
        description: '个人信息已更新',
        color: 'green'
      })
      
      // 退出编辑模式
      isEditing.value = false
      
      // 重新获取用户信息以同步最新数据
      const updatedUser = await getMe()
      if (updatedUser) {
        const userWithMetadata = {
          ...updatedUser,
          isProfileSetup: !!updatedUser.name,
          userType: updatedUser.userType || 'member'
        }
        userStore.setUser(userWithMetadata)
      }
    } else {
      toast.add({
        title: '保存失败',
        description: result.message || '请重试',
        color: 'red'
      })
    }
  } catch (error: any) {
    console.error('Save profile error:', error)
    toast.add({
      title: '保存失败',
      description: error.message || '请重试',
      color: 'red'
    })
  }
}

// 添加技能标签
const addSkill = () => {
  if (newSkill.value.trim() && !editingForm.value.skills.includes(newSkill.value.trim())) {
    editingForm.value.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

// 移除技能标签
const removeSkill = (index: number) => {
  editingForm.value.skills.splice(index, 1)
}

// 更换头像
const changeAvatar = () => {
  // 由于 PixelAvatar 是基于 seed 生成的，我们可以通过改变 seed 来改变头像
  // 这里可以弹出一个头像选择器，或者让用户输入一个 seed 字符串
  const newSeed = prompt('输入头像种子（可以是任意文字）:', editingForm.value.avatarSeed || editingForm.value.name)
  if (newSeed) {
    editingForm.value.avatarSeed = newSeed
    // 更新 member 的 name 也会更新头像（因为 PixelAvatar 使用 name 作为 seed）
    editingForm.value.name = newSeed
  }
}

// 监听编辑按钮点击
watch(() => isEditing.value, (newVal) => {
  if (newVal) {
    startEdit()
  } else {
    cancelEdit()
  }
})

// 加载领取的任务列表
const loadClaimedTasks = async () => {
  loadingTasks.value = true
  try {
    const baseUrl = getApiBaseUrl()
    const tasks = await getMyTasks(baseUrl)
    // 排序：优先显示已完成的任务，然后按更新时间倒序
    claimedTasks.value = tasks.sort((a, b) => {
      // 优先显示已完成的任务
      if (a.status === 'completed' && b.status !== 'completed') {
        return -1
      }
      if (a.status !== 'completed' && b.status === 'completed') {
        return 1
      }
      // 对于相同优先级（都是已完成或都不是已完成），按更新时间倒序
      const timeA = new Date(b.updatedAt || b.completedAt || b.submittedAt || b.claimedAt || b.createdAt).getTime()
      const timeB = new Date(a.updatedAt || a.completedAt || a.submittedAt || a.claimedAt || a.createdAt).getTime()
      return timeA - timeB
    })
    
    // 为每个任务获取对应的积分符号
    const allCommunities = await getCommunities()
    for (const task of claimedTasks.value) {
      const symbol = await getTaskRewardSymbol(task, allCommunities)
      taskRewardSymbols.value[task.id] = symbol
    }
  } catch (error) {
    console.error('Failed to load claimed tasks:', error)
  } finally {
    loadingTasks.value = false
  }
}

// 获取任务状态文本
const getStatusText = (status: Task['status']): string => {
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

// 获取任务状态图标
const getTaskIcon = (status: Task['status']): string => {
  const iconMap: Record<string, string> = {
    'unclaimed': '📋',
    'claimed': '✅',
    'unsubmit': '🔄',
    'under_review': '⏳',
    'completed': '✅',
    'rejected': '❌'
  }
  return iconMap[status] || '📋'
}

// 获取状态徽章样式
const getStatusBadgeClass = (status: Task['status']): string => {
  const classMap: Record<string, string> = {
    'unclaimed': 'font-bold text-[10px] px-2 py-0.5 rounded border border-yellow-600 text-yellow-600 bg-yellow-50',
    'claimed': 'font-bold text-[10px] px-2 py-0.5 rounded border border-blue-600 text-blue-600 bg-blue-50',
    'unsubmit': 'font-bold text-[10px] px-2 py-0.5 rounded border border-blue-600 text-blue-600 bg-blue-50',
    'under_review': 'font-bold text-[10px] px-2 py-0.5 rounded border border-orange-600 text-orange-600 bg-orange-50',
    'completed': 'font-bold text-[10px] px-2 py-0.5 rounded border border-green-600 text-green-600 bg-green-50',
    'rejected': 'font-bold text-[10px] px-2 py-0.5 rounded border border-red-600 text-red-600 bg-destructive-50'
  }
  return classMap[status] || 'font-bold text-[10px] px-2 py-0.5 rounded border border-gray-600 text-gray-600 bg-gray-50'
}

// 格式化任务日期
const formatTaskDate = (task: Task): string => {
  let dateStr = ''
  let action = ''
  
  if (task.completedAt) {
    dateStr = task.completedAt
    action = '完成于'
  } else if (task.submittedAt) {
    dateStr = task.submittedAt
    action = '提交于'
  } else if (task.claimedAt) {
    dateStr = task.claimedAt
    action = '领取于'
  } else {
    dateStr = task.createdAt
    action = '创建于'
  }
  
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))
  
  let timeStr = ''
  if (days > 0) {
    timeStr = `${days}天前`
  } else if (hours > 0) {
    timeStr = `${hours}小时前`
  } else if (minutes > 0) {
    timeStr = `${minutes}分钟前`
  } else {
    timeStr = '刚刚'
  }
  
  return `${action} ${timeStr}`
}

// 监听 activeTab，当切换到任务tab时刷新任务列表
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'HISTORY') {
    loadClaimedTasks()
  }
})

onMounted(async () => {
  // 确保用户信息已加载
  await userStore.getUser()
  
  // 从 API 获取成员数据
  try {
    member.value = await getMemberById(memberId)
    
    // 获取钱包地址
    try {
      walletAddress.value = await getWalletAddressByMemberId(memberId)
    } catch (error) {
      console.error('Failed to load wallet address:', error)
    }
    
    // 加载社区积分信息
    await loadUserCommunity()
    
    if (member.value) {
      // 获取成员所属的社群信息
      const allCommunities = await getCommunities()
      communities.value = allCommunities
        .filter(c => member.value.communities.includes(c.id))
        .map(c => ({
          id: c.id,
          name: c.name,
          points: member.value.reputation, // 使用成员的声誉值作为在该社群的积分
          pointName: c.pointName // 添加社区积分名称
        }))
      
      // 生成历史记录（基于成员的贡献）
      history.value = [
        { 
          id: 1, 
          title: `完成了 ${member.value.completedTasks} 个任务`, 
          date: '最近', 
          community: communities.value[0]?.name || '社群', 
          points: member.value.totalReward * 100, 
          icon: '✅' 
        },
        { 
          id: 2, 
          title: `贡献了 ${member.value.totalContributions} 次`, 
          date: '最近', 
          community: communities.value[0]?.name || '社群', 
          points: member.value.totalContributions * 10, 
          icon: '🌟' 
        },
      ]
      
      // 如果当前是任务tab，加载任务列表
      if (activeTab.value === 'HISTORY') {
        loadClaimedTasks()
      }
    }
  } catch (error) {
    console.error('Failed to load member data:', error)
  }
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.image-pixelated {
  image-rendering: pixelated;
}

/* 翻转卡片样式 */
.flip-card-container {
  width: 100%;
  perspective: 1000px;
  cursor: pointer;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-card-container.is-flipped .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-face {
  position: relative;
  width: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotateY(180deg);
}
</style>
