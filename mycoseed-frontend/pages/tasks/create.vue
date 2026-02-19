<template>
  <div class="min-h-screen bg-background py-4 md:py-8">
    <div class="container mx-auto px-4 md:px-6 max-w-4xl pb-32 md:pb-24">
      <!-- 页面标题 -->
      <div class="mb-6 md:mb-8 text-center">
        <h1 class="text-2xl md:text-4xl font-bold text-text-title mb-2 md:mb-4">创建任务</h1>
        <div class="w-24 md:w-32 h-1 bg-border mx-auto border border-border rounded-2xl"></div>
      </div>

      <!-- 任务创建表单 -->
      <PixelCard>
        <div class="space-y-4 md:space-y-6">
          <!-- 基本信息 -->
          <div class="space-y-4">
            <div>
              <label class="block font-bold text-xs uppercase mb-2 text-text-title">任务名称 *</label>
              <input 
                v-model="taskForm.title" 
                type="text"
                placeholder="输入任务名称"
                class="w-full h-12 px-4 bg-input-bg border border-border rounded-2xl shadow-soft  text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
              />
            </div>

            <div>
              <label class="block font-bold text-xs uppercase mb-2 text-text-title">任务内容 *</label>
              <textarea 
                v-model="taskForm.objective" 
                placeholder="描述任务的具体目标，开始、结束时间，地点等信息..."
                rows="4"
                class="w-full px-4 py-3 bg-input-bg border border-border rounded-2xl shadow-soft  text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all resize-none"
              ></textarea>
            </div>

            <!-- 参与人数和指定参与人员（同一行） -->
            <div class="p-3 md:p-4 bg-gray-50 border border-border rounded-2xl shadow-soft">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 左边：参与人数 -->
                <div>
                  <label class="block font-bold text-xs uppercase mb-2 text-text-title">参与人数</label>
                  <input
                    v-model.number="taskForm.participantLimit"
                    type="number"
                    min="1"
                    placeholder="1"
                    class="w-full h-12 px-3 bg-input-bg border border-border rounded-2xl shadow-soft  text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <p v-if="participantError" class="mt-1  text-xs text-destructive">
                    {{ participantError }}
                  </p>
                  <p v-else-if="taskForm.participantLimit" class="mt-2  text-sm text-text-title/70">
                    最多 {{ taskForm.participantLimit }} 人可以参与此任务
                  </p>
                </div>

                <!-- 右边：指定参与人员 -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block font-bold text-xs uppercase text-text-title">指定参与人员</label>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        v-model="assignUser"
                        class="sr-only peer"
                      />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black border border-border rounded-2xl peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-input-bg after:border after:border-border after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div v-if="assignUser" class="space-y-3">
                    <div class="relative user-selector-container">
                      <input
                        v-model="userSearchQuery"
                        @input="filterUsers"
                        @focus="showUserDropdown = true"
                        type="text"
                        placeholder="搜索用户..."
                        class="w-full h-12 px-4 bg-input-bg border border-border rounded-2xl shadow-soft  text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                      />
                      <!-- 下拉列表 -->
                      <div 
                        v-if="showUserDropdown && filteredUsers.length > 0"
                        class="absolute z-50 w-full mt-1 bg-card border border-border rounded-2xl shadow-soft-lg max-h-60 overflow-y-auto"
                      >
                        <button
                          v-for="user in filteredUsers"
                          :key="user.id"
                          @click="selectUser(user)"
                          :disabled="isUserSelected(user.id)"
                          class="w-full px-4 py-2 text-left hover:bg-primary/10  text-base border-b border-black/10 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {{ user.name }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- 已选择的用户列表（多人任务） -->
                    <div v-if="selectedUsers.length > 0" class="space-y-2">
                      <div class="font-bold text-[10px] uppercase text-text-title">已选择用户 ({{ selectedUsers.length }}/{{ taskForm.participantLimit }})</div>
                      <div class="flex flex-wrap gap-2">
                        <div
                          v-for="(user, index) in selectedUsers"
                          :key="user.id"
                          class="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-border rounded-2xl shadow-soft"
                        >
                          <span class=" text-sm">{{ user.name }}</span>
                          <button
                            @click="removeUser(index)"
                            class="text-destructive hover:text-red-700 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <p v-if="assignUser && selectedUsers.length === 0" class=" text-sm text-text-title/70">
                      请选择用户（最多 {{ taskForm.participantLimit }} 人）
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 移动端单列，桌面端双列 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-xs uppercase mb-2 text-text-title">每人积分 *</label>
                <input 
                  v-model="taskForm.reward" 
                  type="number"
                  step="1"
                  min="1"
                  placeholder="100"
                  class="w-full h-12 px-4 bg-input-bg border border-border rounded-2xl shadow-soft  text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                />
                
                <p v-if="rewardExplanation" class="mt-2  text-sm text-text-title/70">
                  {{ rewardExplanation }}
                </p>
              </div>

              <div>
                <label class="block font-bold text-xs uppercase mb-2 text-text-title">任务领取时间（可选）</label>
                <div class="relative">
                  <input 
                    v-model="taskForm.startDate" 
                    type="datetime-local"
                    :min="minStart"
                    ref="startDateInput"
                    class="w-full h-12 px-4 pr-12 bg-input-bg border border-border rounded-2xl shadow-soft  text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                  />
                  <div 
                    class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                    @click.stop="openStartDatePicker"
                  >
                    <Icon name="heroicons:calendar" class="w-6 h-6 text-text-title" />
                  </div>
                </div>
                <p class="mt-1  text-xs text-text-title/70">
                  如果不填写，将使用发布任务时的当前时间
                </p>
              </div>
            </div>

            <div>
              <label class="block font-bold text-xs uppercase mb-2 text-text-title">领取截止时间 *</label>
              <div class="relative">
                <input 
                  v-model="taskForm.deadline" 
                  type="datetime-local"
                  :min="taskForm.startDate || minStart"
                  ref="deadlineInput"
                  class="w-full h-12 px-4 pr-12 bg-input-bg border border-border rounded-2xl shadow-soft  text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                />
                <div 
                  class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                  @click.stop="openDeadlinePicker"
                >
                  <Icon name="heroicons:calendar" class="w-6 h-6 text-text-title" />
                </div>
              </div>
              <p class="mt-1  text-xs text-text-title/70">
                过了此时间后，任务将无法再领取
              </p>
            </div>

            <div>
              <label class="block font-bold text-xs uppercase mb-2 text-text-title">提交截止时间 *</label>
              <div class="relative">
                <input 
                  v-model="taskForm.submitDeadline" 
                  type="datetime-local"
                  :min="taskForm.deadline || taskForm.startDate || minStart"
                  ref="submitDeadlineInput"
                  class="w-full h-12 px-4 pr-12 bg-input-bg border border-border rounded-2xl shadow-soft  text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                />
                <div 
                  class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                  @click.stop="openSubmitDeadlinePicker"
                >
                  <Icon name="heroicons:calendar" class="w-6 h-6 text-text-title" />
                </div>
              </div>
              <p class="mt-1  text-xs text-text-title/70">
                已领取任务必须在此时间前提交，否则将标记为已截止
              </p>
              <p v-if="dateError" class="mt-1  text-xs text-destructive">
                {{ dateError }}
              </p>
            </div>
          </div>

          <!-- 提交说明（展示给报名者的信息补充） -->
          <div class="border-t-2 border-black pt-4 md:pt-6">
            <div>
              <label class="block font-bold text-xs uppercase mb-2 text-text-title">提交说明（可选）</label>
              <textarea
                v-model="taskForm.submissionInstructions"
                placeholder="补充任务完成后的提交说明，如需要强调的注意事项等..."
                rows="3"
                class="w-full px-4 py-3 bg-input-bg border border-border rounded-2xl shadow-soft  text-base text-text-title focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <!-- 提交格式 -->
          <div class="border-t-2 border-black pt-4 md:pt-6">
            <h3 class="font-bold text-sm uppercase mb-4 text-text-title">提交格式</h3>
            <div class="space-y-3 md:space-y-4">
              <!-- 照片证据 -->
              <div class="p-3 md:p-4 bg-gray-50 border border-border rounded-2xl shadow-soft">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <span class="text-xl md:text-2xl">📷</span>
                    <h4 class="font-bold text-xs uppercase text-text-title">照片证据</h4>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="proofConfig.photo.enabled"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black border border-border rounded-2xl peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-input-bg after:border after:border-border after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div v-if="proofConfig.photo.enabled" class="space-y-3 mt-3">
                  <div>
                    <label class="block font-bold text-[10px] uppercase mb-1 text-text-title">照片数量</label>
                    <select 
                      v-model="proofConfig.photo.count"
                      class="w-full h-10 px-3 bg-input-bg border border-border rounded-2xl shadow-soft  text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                    >
                      <option v-for="opt in photoCountOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold text-[10px] uppercase mb-1 text-text-title">要求说明</label>
                    <textarea 
                      v-model="proofConfig.photo.requirements"
                      placeholder="描述照片的具体要求..."
                      rows="2"
                      class="w-full px-3 py-2 bg-input-bg border border-border rounded-2xl shadow-soft  text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- 位置定位：暂未开放，隐藏 -->
              <div v-if="false" class="p-3 md:p-4 bg-gray-50 border border-border rounded-2xl shadow-soft">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <span class="text-xl md:text-2xl">📍</span>
                    <h4 class="font-bold text-xs uppercase text-text-title">位置定位</h4>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="proofConfig.gps.enabled"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black border border-border rounded-2xl peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-input-bg after:border after:border-border after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <!-- 文字描述 -->
              <div class="p-3 md:p-4 bg-gray-50 border border-border rounded-2xl shadow-soft">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <span class="text-xl md:text-2xl">📝</span>
                    <h4 class="font-bold text-xs uppercase text-text-title">文字描述</h4>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="proofConfig.description.enabled"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black border border-border rounded-2xl peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-input-bg after:border after:border-border after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div v-if="proofConfig.description.enabled" class="space-y-3 mt-3">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block font-bold text-[10px] uppercase mb-1 text-text-title">最少字数</label>
                      <input 
                        v-model="proofConfig.description.minWords"
                        type="number"
                        placeholder="10"
                        class="w-full h-10 px-3 bg-input-bg border border-border rounded-2xl shadow-soft  text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                      />
                    </div>
                    <div>
                      <label class="block font-bold text-[10px] uppercase mb-1 text-text-title">提示语</label>
                      <input 
                        v-model="proofConfig.description.prompt"
                        type="text"
                        placeholder="请描述..."
                        class="w-full h-10 px-3 bg-input-bg border border-border rounded-2xl shadow-soft  text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部固定操作栏占位符，防止内容被遮挡 -->
          <div class="h-20 md:h-16"></div>
        </div>
      </PixelCard>
    </div>

    <!-- 底部固定操作栏 -->
    <!-- 移动端：放在底部导航栏上方（bottom-16），桌面端：放在底部（bottom-0） -->
    <div class="fixed bottom-16 left-0 right-0 p-4 bg-input-bg border-t-2 border-black z-[60] flex gap-3 shadow-[0_-4px_0_rgba(0,0,0,0.05)] md:bottom-0 md:border-t-2" style="padding-bottom: calc(1rem + env(safe-area-inset-bottom));">
      <PixelButton 
        @click="navigateTo('/tasks')"
        variant="secondary"
        size="lg"
        class="w-24"
      >
        取消
      </PixelButton>
      <PixelButton 
        @click="publishTask"
        :disabled="!canPublish || isPublishing"
        variant="success"
        size="lg"
        class="flex-1 flex items-center justify-center gap-2"
      >
        <span v-if="isPublishing" class="animate-spin">⚙️</span>
        <span v-else>💼</span>
        {{ isPublishing ? '发布中...' : '发布任务' }}
      </PixelButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PixelCard from '~/components/pixel/PixelCard.vue'
import PixelButton from '~/components/pixel/PixelButton.vue'
import { createTask, getApiBaseUrl, getCookie, AUTH_TOKEN_KEY } from '~/utils/api'
import { useToast } from '~/composables/useToast'
import { getCurrentBeijingTime } from '~/utils/time'
import { useCommunityStore } from '~/stores/community'

definePageMeta({
  layout: 'default'
})

const router = useRouter()
const communityStore = useCommunityStore()
const navigateTo = (path: string) => router.push(path)

// 时间输入框引用
const startDateInput = ref<HTMLInputElement | null>(null)
const deadlineInput = ref<HTMLInputElement | null>(null)
const submitDeadlineInput = ref<HTMLInputElement | null>(null)

// 打开日期选择器的方法
const openStartDatePicker = () => {
  if (startDateInput.value) {
    startDateInput.value.focus()
    // 优先使用 showPicker()（现代浏览器支持），否则使用 click()
    if (typeof startDateInput.value.showPicker === 'function') {
      startDateInput.value.showPicker()
    } else {
      startDateInput.value.click()
    }
  }
}

const openDeadlinePicker = () => {
  if (deadlineInput.value) {
    deadlineInput.value.focus()
    // 优先使用 showPicker()（现代浏览器支持），否则使用 click()
    if (typeof deadlineInput.value.showPicker === 'function') {
      deadlineInput.value.showPicker()
    } else {
      deadlineInput.value.click()
    }
  }
}

const openSubmitDeadlinePicker = () => {
  if (submitDeadlineInput.value) {
    submitDeadlineInput.value.focus()
    // 优先使用 showPicker()（现代浏览器支持），否则使用 click()
    if (typeof submitDeadlineInput.value.showPicker === 'function') {
      submitDeadlineInput.value.showPicker()
    } else {
      submitDeadlineInput.value.click()
    }
  }
}

// 任务表单数据
const taskForm = ref({
  title: '',
  objective: '',
  reward: '',
  startDate: '',
  deadline: '',
  submitDeadline: '',
  participantLimit: 1,
  submissionInstructions: ''
})

// 证明配置
const proofConfig = ref({
  photo: {
    enabled: false,
    count: '1',
    requirements: ''
  },
  gps: {
    enabled: false,
    accuracy: 'high'
  },
  description: {
    enabled: false,
    minWords: 10,
    prompt: ''
  }
})

// 加载状态
const isPublishing = ref(false)

// 参与人数错误信息
const participantError = ref('')

// 指定参与人员相关
const assignUser = ref(false)
const selectedUsers = ref<Array<{ id: string; name: string }>>([]) // 改为数组，支持多人
const allUsers = ref<Array<{ id: string; name: string; phone?: string; email?: string }>>([])
const filteredUsers = ref<Array<{ id: string; name: string; phone?: string; email?: string }>>([])
const userSearchQuery = ref('')
const showUserDropdown = ref(false)

// 奖励积分分配模式：'per_person' 每人积分，'total' 总积分
const rewardDistributionMode = ref<'per_person' | 'total'>('per_person')

// 日期校验相关
const minStart = ref('')
const dateError = ref('')

// 选项数据
const photoCountOptions = [
  { label: '1张', value: '1' },
  { label: '2张', value: '2' },
  { label: '3张', value: '3' },
  { label: '4张', value: '4' },
  { label: '5张', value: '5' }
]


// 计算属性
const canPublish = computed(() => {
  return taskForm.value.title && 
         taskForm.value.objective && 
         taskForm.value.reward && 
         // startDate 现在是可选的，如果为空会使用当前时间
         taskForm.value.deadline &&
         taskForm.value.submitDeadline &&
         // 参与人数校验：必须填写有效的人数
         (!!taskForm.value.participantLimit && taskForm.value.participantLimit >= 1) &&
         // 如果指定了用户，必须选择用户
         (!assignUser.value || selectedUsers.value.length > 0) &&
         // 日期关系校验（没有错误信息）
         !dateError.value
})

// 奖励积分说明文本
const rewardExplanation = computed(() => {
  const reward = parseFloat(taskForm.value.reward) || 0
  if (reward <= 0) {
    return ''
  }
  
  const limit = taskForm.value.participantLimit || 1
  const totalReward = reward * limit
  
  return `如果都完成任务，则最多支付 ${totalReward} 积分`
})

// 校验参与人数
const validateParticipants = () => {
  participantError.value = ''
  const value = taskForm.value.participantLimit
  if (!value || value < 1) {
    participantError.value = '参与人数至少为 1 人'
    return false
  }
  
  // 如果指定了用户，检查选择的用户数量是否超过参与人数限制
  if (assignUser.value && selectedUsers.value.length > value) {
    participantError.value = `选择的用户数量（${selectedUsers.value.length}）不能超过参与人数限制（${value}）`
    return false
  }
  
  return true
}

// 日期校验：任务领取时间（可选，默认为当前时间），领取截止时间不得早于开始时间，提交截止时间不得早于领取截止时间
const validateDates = () => {
  dateError.value = ''
  
  // 验证必填字段：领取截止时间和提交截止时间
  if (!taskForm.value.deadline || !taskForm.value.submitDeadline) {
    dateError.value = '请填写领取截止时间和提交截止时间'
    return false
  }

  const now = new Date()
  
  // 如果未填写任务领取时间，使用当前时间
  const startDateStr = taskForm.value.startDate || getCurrentDateTimeString()
  
  // 解析时间（datetime-local 输入返回的是本地时间字符串 YYYY-MM-DDTHH:mm）
  const start = new Date(startDateStr)
  const deadline = new Date(taskForm.value.deadline)
  const submitDeadline = new Date(taskForm.value.submitDeadline)
  
  // 检查时间是否有效
  if (isNaN(start.getTime()) || isNaN(deadline.getTime()) || isNaN(submitDeadline.getTime())) {
    dateError.value = '时间格式无效'
    return false
  }

  // 验证时间顺序：任务领取时间 < 领取截止时间 < 提交截止时间
  if (start >= deadline) {
    dateError.value = '任务领取时间必须早于领取截止时间'
    return false
  }

  if (deadline >= submitDeadline) {
    dateError.value = '领取截止时间必须早于提交截止时间'
    return false
  }

  return true
}

// 获取当前时间的 datetime-local 格式字符串（北京时间 UTC+8）
// 统一使用 UTC+8 北京时间，不受机器时区影响
const getCurrentDateTimeString = () => {
  return getCurrentBeijingTime()
}

// 监听字段变化做实时校验
watch(() => [taskForm.value.participantLimit, assignUser.value, selectedUsers.value.length], () => {
  validateParticipants()
})

watch(() => [taskForm.value.startDate, taskForm.value.deadline, taskForm.value.submitDeadline], () => {
  validateDates()
})

// 发布任务
const publishTask = async () => {
  if (isPublishing.value) return
  // 最终前再做一轮校验，给出明确提示
  const participantsOK = validateParticipants()
  const datesOK = validateDates()
  
  // 检查是否指定了用户但没有选择
  if (assignUser.value && selectedUsers.value.length === 0) {
    const toast = useToast()
    toast.add({
      title: '请选择指定用户',
      description: '您已开启"指定参与人员"，请至少选择一个用户',
      color: 'red'
    })
    return
  }
  
  // 检查选择的用户数量是否超过参与人数限制
  if (assignUser.value && selectedUsers.value.length > taskForm.value.participantLimit) {
    const toast = useToast()
    toast.add({
      title: '用户数量超出限制',
      description: `选择的用户数量（${selectedUsers.value.length}）不能超过参与人数限制（${taskForm.value.participantLimit}）`,
      color: 'red'
    })
    return
  }

  if (!participantsOK || !datesOK || !canPublish.value) {
    const toast = useToast()
    const description = !participantsOK
      ? (participantError.value || '请检查参与人数配置')
      : (dateError.value || '请确保所有必填项和时间字段填写正确')
    toast.add({
      title: '请检查表单信息',
      description,
      color: 'red'
    })
    return
  }

  isPublishing.value = true
  
  try {
    console.log('[CREATE TASK] 开始创建任务...')
    console.log('[CREATE TASK] 表单数据:', {
      title: taskForm.value.title,
      description: taskForm.value.objective,
      reward: taskForm.value.reward,
      startDate: taskForm.value.startDate,
      deadline: taskForm.value.deadline,
      submitDeadline: taskForm.value.submitDeadline,
      participantLimit: taskForm.value.participantLimit,
      rewardDistributionMode: rewardDistributionMode.value
    })
    
    // 模拟钱包签名和发布
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 创建任务
    const baseUrl = getApiBaseUrl()
    console.log('[CREATE TASK] API Base URL:', baseUrl)
    
    // 检查是否指定了用户（多人任务支持多个用户）
    const assignedUserIds = assignUser.value && selectedUsers.value.length > 0 
      ? selectedUsers.value.map(u => u.id) 
      : undefined
    console.log('[CREATE TASK] 指定用户检查:', {
      assignUser: assignUser.value,
      selectedUsers: selectedUsers.value,
      assignedUserIds: assignedUserIds
    })
    
    // 如果未填写任务领取时间，使用当前时间
    const startDate = taskForm.value.startDate || getCurrentDateTimeString()
    
    const taskParams = {
      title: taskForm.value.title,
      description: taskForm.value.objective,
      reward: parseFloat(taskForm.value.reward),
      startDate: startDate,
      deadline: taskForm.value.deadline,
      submitDeadline: taskForm.value.submitDeadline,
      participantLimit: taskForm.value.participantLimit,
      rewardDistributionMode: rewardDistributionMode.value,
      submissionInstructions: taskForm.value.submissionInstructions || '请按照任务要求完成并提交相关凭证。',
      proofConfig: proofConfig.value,
      assignedUserIds: assignedUserIds,
      communityId: communityStore.currentCommunityId || undefined  // 所属社区
    }
    
    console.log('[CREATE TASK] 发送请求参数:', taskParams)
    
    const newTask = await createTask(taskParams, baseUrl)
    
    console.log('[CREATE TASK] 创建成功，返回的任务:', newTask)
    
    // 显示成功消息
    const toast = useToast()
    toast.add({
      title: '任务发布成功！',
      description: '任务已成功发布到区块链网络',
      color: 'green'
    })
    
    // 跳转到任务列表
    console.log('[CREATE TASK] 准备跳转到任务列表...')
    await navigateTo('/tasks')
    console.log('[CREATE TASK] 跳转完成')
  } catch (error) {
    console.error('[CREATE TASK] 发布任务失败:', error)
    console.error('[CREATE TASK] 错误详情:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    const toast = useToast()
    const errorMessage = error instanceof Error ? error.message : '请稍后重试'
    toast.add({
      title: '发布失败',
      description: errorMessage,
      color: 'red'
    })
  } finally {
    console.log('[CREATE TASK] 完成，重置发布状态')
    isPublishing.value = false
  }
}

// 加载用户列表
const loadUsers = async () => {
  try {
    const baseUrl = getApiBaseUrl()
    const token = getCookie(AUTH_TOKEN_KEY)
    
    if (!token) {
      console.warn('未找到认证token，无法加载用户列表')
      return
    }
    
    const response = await fetch(`${baseUrl}/api/auth/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      console.error('加载用户列表失败:', response.status, response.statusText)
      if (response.status === 404) {
        console.error('API路由不存在，请确保后端服务器已重启并包含最新的路由')
      }
      return
    }
    
    const data = await response.json()
    if (data.result === 'ok' && data.users) {
      allUsers.value = data.users
      filteredUsers.value = data.users
    } else {
      console.error('用户列表数据格式错误:', data)
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 过滤用户
const filterUsers = () => {
  if (!userSearchQuery.value.trim()) {
    filteredUsers.value = allUsers.value
  } else {
    const query = userSearchQuery.value.toLowerCase()
    filteredUsers.value = allUsers.value.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  }
}

// 检查用户是否已选择
const isUserSelected = (userId: string) => {
  return selectedUsers.value.some(u => u.id === userId)
}

// 选择用户（支持多人）
const selectUser = (user: { id: string; name: string }) => {
  // 检查是否已选择
  if (isUserSelected(user.id)) {
    return
  }
  
  // 检查是否超过参与人数限制
  if (selectedUsers.value.length >= taskForm.value.participantLimit) {
    const toast = useToast()
    toast.add({
      title: '已达到人数限制',
      description: `最多只能选择 ${taskForm.value.participantLimit} 个用户`,
      color: 'red'
    })
    return
  }
  
  console.log('[SELECT USER] 选择用户:', user)
  selectedUsers.value.push(user)
  userSearchQuery.value = ''
  showUserDropdown.value = false
  console.log('[SELECT USER] selectedUsers.value:', selectedUsers.value)
}

// 移除用户
const removeUser = (index: number) => {
  selectedUsers.value.splice(index, 1)
}

// 点击外部关闭下拉列表
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-selector-container')) {
    showUserDropdown.value = false
  }
}

// 初始化最小开始时间
onMounted(() => {
  const now = new Date()
  now.setSeconds(0, 0)
  // datetime-local 需要到分钟的字符串：YYYY-MM-DDTHH:MM
  minStart.value = now.toISOString().slice(0, 16)
  
  // 加载用户列表
  loadUsers()
  
  // 添加点击外部关闭下拉列表的事件监听
  if (typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside)
  }
})
</script>

