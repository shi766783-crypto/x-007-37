import { defineStore } from 'pinia'
import { read, write } from '@/utils/storage'
import { uid } from '@/utils/id'

const KEY = 'user'

function defaultProfile() {
  return { name: '我的家庭', avatar: '👨‍👩‍👧', points: 0, pointRecords: [] }
}

export const useUserStore = defineStore('user', {
  state: () => {
    // 兼容旧数据：历史 profile 没有 pointRecords 字段
    const stored = read(KEY, null)
    const profile = stored ? { ...defaultProfile(), ...stored } : defaultProfile()
    if (!Array.isArray(profile.pointRecords)) profile.pointRecords = []
    // 老用户可能已有积分但无明细，补登一条使明细之和与总数一致
    if (profile.points > 0 && profile.pointRecords.length === 0) {
      profile.pointRecords.push({
        id: uid('pt'),
        points: profile.points,
        reason: '历史积分',
        date: new Date().toISOString(),
      })
      write(KEY, profile)
    }
    return { profile }
  },

  getters: {
    name: (state) => state.profile.name,
    avatar: (state) => state.profile.avatar,
    points: (state) => state.profile.points,
    // 积分明细，按时间倒序（最新获得的在最前）
    pointRecords: (state) => state.profile.pointRecords,
  },

  actions: {
    persist() {
      write(KEY, this.profile)
    },
    setName(name) {
      this.profile.name = name
      this.persist()
    },
    setAvatar(avatar) {
      this.profile.avatar = avatar
      this.persist()
    },
    // 增加积分：明细与总数在同一次更新中写入，保证二者始终同步
    addPoints(n, reason = '获得积分') {
      const points = Number(n) || 0
      this.profile.pointRecords.unshift({
        id: uid('pt'),
        points,
        reason,
        date: new Date().toISOString(),
      })
      this.profile.points += points
      this.persist()
    },
  },
})
