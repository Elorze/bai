import { defineStore } from 'pinia'
import { getCommunities, getCommunityById, type Community } from '~/utils/api'

const STORAGE_KEY = 'mycoseed_current_community_id'
const NANTANG_ID = '00000000-0000-0000-0000-000000000002'

export const useCommunityStore = defineStore('community', {
  state: () => ({
    currentCommunityId: null as string | null,
    currentCommunity: null as Community | null,
  }),
  
  getters: {
    hasCurrentCommunity: (state) => state.currentCommunityId !== null,
  },
  
  actions: {
    loadFromStorage() {
      if (typeof window === 'undefined') return
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const idNum = parseInt(stored, 10)
        if (!isNaN(idNum)) this.currentCommunityId = NANTANG_ID
        else this.currentCommunityId = stored
      }
    },
    
    async setCurrentCommunity(id: string) {
      this.currentCommunityId = id
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, id)
      try {
        this.currentCommunity = await getCommunityById(id)
      } catch (error) {
        console.error('Failed to load community:', error)
        this.currentCommunity = null
      }
    },
    
    /** 默认社区：优先用户已加入的第一个，否则南塘 */
    async getDefaultCommunity(): Promise<string | null> {
      try {
        const list = await getCommunities({ mine: true })
        if (list.length > 0) return list[0].id
      } catch (_) {}
      return NANTANG_ID
    },
    
    async initialize() {
      this.loadFromStorage()
      if (this.currentCommunityId) {
        try {
          this.currentCommunity = await getCommunityById(this.currentCommunityId)
          return
        } catch (error) {
          console.error('Failed to load stored community:', error)
          this.currentCommunityId = null
          if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
        }
      }
      const defaultId = await this.getDefaultCommunity()
      if (defaultId) await this.setCurrentCommunity(defaultId)
    },
    
    /** 用于 Header 下拉：当前用户已加入的社区 */
    async getAllCommunities(): Promise<Community[]> {
      try {
        return await getCommunities({ mine: true })
      } catch (_) {
        return []
      }
    },
  },
})




