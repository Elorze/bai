import { defineStore } from 'pinia'
import { getCommunities, getCommunityById, type Community, DEFAULT_COMMUNITY_UUID } from '~/utils/api'
import { getMemberById } from '~/utils/api'
import { useUserStore } from '~/stores/user'

const STORAGE_KEY = 'mycoseed_current_community_id'

export const useCommunityStore = defineStore('community', {
  state: () => ({
    currentCommunityId: null as string | null,
    currentCommunity: null as Community | null,
  }),
  
  getters: {
    hasCurrentCommunity: (state) => state.currentCommunityId !== null,
  },
  
  actions: {
    // 从 localStorage 加载上次选择的社区
    loadFromStorage() {
      if (typeof window === 'undefined') return
      
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        // 如果是数字，转换为默认 UUID（向后兼容）
        const idNum = parseInt(stored, 10)
        if (!isNaN(idNum)) {
          // 将旧的数字 ID 映射到默认 UUID
          this.currentCommunityId = DEFAULT_COMMUNITY_UUID
        } else {
          // 已经是 UUID 字符串
          this.currentCommunityId = stored
        }
      }
    },
    
    // 设置当前社区
    async setCurrentCommunity(id: string) {
      this.currentCommunityId = id
      
      // 持久化到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, id)
      }
      
      // 加载社区详情
      try {
        this.currentCommunity = await getCommunityById(id)
      } catch (error) {
        console.error('Failed to load community:', error)
        this.currentCommunity = null
      }
    },
    
    // 获取用户所属的第一个社区作为默认值
    async getDefaultCommunity(): Promise<string | null> {
      const userStore = useUserStore()
      const user = await userStore.getUser()
      
      if (!user || user.userType !== 'member') {
        return DEFAULT_COMMUNITY_UUID
      }
      
      try {
        const member = await getMemberById(user.id)
        if (member && member.communities.length > 0) {
          // 将数字 ID 映射到 UUID（临时兼容处理）
          const firstCommunityId = member.communities[0]
          if (firstCommunityId === 1) {
            return DEFAULT_COMMUNITY_UUID
          } else if (firstCommunityId === 2) {
            return '00000000-0000-0000-0000-000000000002'
          }
        }
      } catch (error) {
        console.error('Failed to get default community:', error)
      }
      
      return DEFAULT_COMMUNITY_UUID
    },
    
    // 初始化：优先使用上次选择，否则使用用户第一个社区
    async initialize() {
      // 先尝试从 localStorage 加载
      this.loadFromStorage()
      
      // 如果已有选择，加载社区详情
      if (this.currentCommunityId) {
        try {
          this.currentCommunity = await getCommunityById(this.currentCommunityId)
          return
        } catch (error) {
          console.error('Failed to load stored community:', error)
          // 如果加载失败，清除存储的选择
          this.currentCommunityId = null
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      }
      
      // 如果没有存储的选择，尝试获取用户默认社区
      const defaultId = await this.getDefaultCommunity()
      if (defaultId) {
        await this.setCurrentCommunity(defaultId)
      }
    },
    
    // 获取所有社区列表（用于下拉菜单）
    async getAllCommunities(): Promise<Community[]> {
      return await getCommunities()
    },
  }
})




