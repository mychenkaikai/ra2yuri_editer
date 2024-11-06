import { store } from '@/store'
import { createLogger } from '@/utils/logger'
import { computed } from 'vue'
const logger = createLogger('Weapons')

// 获取武器列表
export const weaponsList = computed(() => {
  if (!store.state.configData) {
    logger.warn('No config data available')
    return []
  }

  const sections = Object.keys(store.state.configData)
  return sections.filter(section => {
    const data = store.state.configData[section]
    return data && (data.Damage !== undefined)
  })
})

// 武器显示名称映射
export const weaponNames: Record<string, string> = {
  // 从 Weapons.vue 复制武器名称映射...
}

// 获取武器显示名称
export const getWeaponDisplayName = (weapon: string) => {
  const name = weaponNames[weapon]
  return name ? `${name} (${weapon})` : weapon
} 