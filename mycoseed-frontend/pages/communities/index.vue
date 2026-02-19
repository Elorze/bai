<template>
  <div class="min-h-screen bg-background pb-24">
    <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 class="text-xl font-bold text-text-title">社区广场</h1>

      <!-- 搜索 + 邀请码 -->
      <div class="flex flex-wrap gap-2 items-center">
        <input
          v-model="searchQ"
          type="text"
          placeholder="搜索社区名称或描述"
          class="flex-1 min-w-[160px] px-4 py-2 rounded-2xl border border-border bg-input-bg text-text-body placeholder-text-placeholder"
          @input="debouncedFetch()"
        />
        <button
          type="button"
          class="px-4 py-2 rounded-2xl border border-border bg-card text-text-body hover:bg-input-bg"
          @click="showInviteModal = true"
        >
          填写邀请码
        </button>
      </div>

      <!-- 公开社区列表 -->
      <div v-if="loading" class="text-center py-8 text-text-placeholder">加载中...</div>
      <div v-else-if="error" class="text-center py-8 text-red-600">{{ error }}</div>
      <div v-else class="space-y-4">
        <div
          v-for="c in publicList"
          :key="c.id"
          class="bg-card rounded-2xl border border-border p-4 shadow-soft"
        >
          <div class="flex justify-between items-start gap-2">
            <div class="flex-1 min-w-0">
              <h2 class="font-bold text-text-title">{{ c.name }}</h2>
              <p class="text-sm text-text-body mt-1 line-clamp-2">{{ c.description || '暂无简介' }}</p>
              <p class="text-xs text-text-placeholder mt-2">{{ c.pointName || '积分' }} · {{ c.memberCount }} 人</p>
            </div>
            <div class="flex flex-col gap-2 shrink-0">
              <template v-if="joinedIds.has(c.id)">
                <NuxtLink
                  :to="'/'"
                  class="px-3 py-1.5 rounded-xl bg-primary text-white text-sm text-center"
                  @click="communityStore.setCurrentCommunity(c.id)"
                >
                  进入
                </NuxtLink>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-xl border border-border text-text-body text-sm"
                  @click="leave(c.id)"
                >
                  退出
                </button>
              </template>
              <button
                v-else
                type="button"
                class="px-3 py-1.5 rounded-xl bg-primary text-white text-sm"
                :disabled="joinLoading === c.id"
                @click="join(c.id)"
              >
                {{ joinLoading === c.id ? '处理中' : '加入' }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="publicList.length === 0" class="text-center py-8 text-text-placeholder">
          暂无公开社区；可尝试填写邀请码加入私有社区。
        </div>
      </div>
    </div>

    <!-- 邀请码弹窗 -->
    <Teleport to="body">
      <div
        v-if="showInviteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showInviteModal = false"
      >
        <div class="bg-card rounded-2xl shadow-soft border border-border p-6 w-full max-w-sm">
          <h3 class="font-bold text-text-title mb-2">填写邀请码</h3>
          <p class="text-sm text-text-body mb-3">输入社区邀请码（英文/拼音）加入私有社区，提交后需管理员审批。</p>
          <input
            v-model="inviteCode"
            type="text"
            placeholder="例如 nantang"
            class="w-full px-4 py-2 rounded-xl border border-border bg-input-bg text-text-body mb-4"
          />
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-border"
              @click="showInviteModal = false"
            >
              取消
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-primary text-white"
              :disabled="!inviteCode.trim() || joinByCodeLoading"
              @click="joinByInviteCode()"
            >
              {{ joinByCodeLoading ? '提交中' : '提交' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCommunityStore } from '~/stores/community'
import { getCommunities, joinCommunity, leaveCommunity, joinCommunityByInviteCode, getApiBaseUrl, type Community } from '~/utils/api'

definePageMeta({ layout: 'default' })

const communityStore = useCommunityStore()
const searchQ = ref('')
const publicList = ref<Community[]>([])
const myCommunities = ref<Community[]>([])
const loading = ref(true)
const error = ref('')
const joinLoading = ref<string | null>(null)
const joinByCodeLoading = ref(false)
const showInviteModal = ref(false)
const inviteCode = ref('')

const joinedIds = computed(() => new Set(myCommunities.value.map(c => c.id)))

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedFetch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchPublic, 300)
}

async function fetchPublic() {
  loading.value = true
  error.value = ''
  try {
    const baseUrl = getApiBaseUrl()
    publicList.value = await getCommunities({ q: searchQ.value.trim() || undefined }, baseUrl)
  } catch (e: any) {
    error.value = e.message || '加载失败'
    publicList.value = []
  } finally {
    loading.value = false
  }
}

async function fetchMine() {
  try {
    const baseUrl = getApiBaseUrl()
    myCommunities.value = await getCommunities({ mine: true }, baseUrl)
  } catch (_) {
    myCommunities.value = []
  }
}

async function join(communityId: string) {
  joinLoading.value = communityId
  try {
    await joinCommunity(communityId, getApiBaseUrl(), {})
    await fetchMine()
    await fetchPublic()
  } catch (e: any) {
    alert(e.message || '加入失败')
  } finally {
    joinLoading.value = null
  }
}

async function leave(communityId: string) {
  if (!confirm('确定退出该社区？')) return
  try {
    await leaveCommunity(communityId, getApiBaseUrl())
    await fetchMine()
    await fetchPublic()
    if (communityStore.currentCommunityId === communityId) {
      communityStore.currentCommunityId = null
      communityStore.currentCommunity = null
    }
  } catch (e: any) {
    alert(e.message || '退出失败')
  }
}

async function joinByInviteCode() {
  const code = inviteCode.value.trim().toLowerCase().replace(/\s+/g, '-')
  if (!code) return
  joinByCodeLoading.value = true
  try {
    const baseUrl = getApiBaseUrl()
    const data = await joinCommunityByInviteCode(code, baseUrl)
    showInviteModal.value = false
    inviteCode.value = ''
    await fetchMine()
    await fetchPublic()
    alert(data.message || '操作成功')
  } catch (e: any) {
    alert(e.message || '提交失败')
  } finally {
    joinByCodeLoading.value = false
  }
}

onMounted(() => {
  fetchPublic()
  fetchMine()
})
</script>
