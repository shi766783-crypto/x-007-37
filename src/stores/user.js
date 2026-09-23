import { defineStore } from 'pinia'
import { read, write } from '@/utils/storage'
import { uid } from '@/utils/id'

const KEY = 'user'
const LOG_KEY = 'pointsLog'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: read(KEY, { name: '我的家庭', avatar: '👨‍👩‍👧', points: 0 }),
    // 积分明细：[{ id, points, reason, date }]，最新在前
    pointsLog: read(LOG_KEY, []),
  }),

  getters: {
    name: (state) => state.profile.name,
    avatar: (state) => state.profile.avatar,
    points: (state) => state.profile.points,
    // 按时间倒序的积分明细
    pointsHistory: (state) =>
      [...state.pointsLog].sort((a, b) => new Date(b.date) - new Date(a.date)),
  },

  actions: {
    persist() {
      write(KEY, this.profile)
      write(LOG_KEY, this.pointsLog)
    },
    setName(name) {
      this.profile.name = name
      this.persist()
    },
    setAvatar(avatar) {
      this.profile.avatar = avatar
      this.persist()
    },
    addPoints(n, reason = '积分调整') {
      this.profile.points += n
      this.pointsLog.unshift({
        id: uid('pt'),
        points: n,
        reason,
        date: new Date().toISOString(),
      })
      this.persist()
    },
  },
})
